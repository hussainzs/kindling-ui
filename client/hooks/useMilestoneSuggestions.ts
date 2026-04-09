import { useEffect, useRef, useState } from 'react';
import {
  MilestoneSuggestionRequestError,
  requestMilestoneSuggestion,
} from '../services/milestoneSuggestionsApi';

const WORD_THRESHOLD_STEP = 8;
const REQUESTS_PER_WINDOW = 10;
const WINDOW_MS = 60_000;

type UseMilestoneSuggestionsOptions = {
  notesSoFar: string;
  existingMilestones: string[];
  onSuggestion: (milestone: string) => void;
};

type UseMilestoneSuggestionsResult = {
  suggestionError: string | null;
  isRateLimited: boolean;
};

function getEligibleThreshold(notesSoFar: string) {
  const words = notesSoFar.trim().split(/\s+/).filter(Boolean).length;
  return Math.floor(words / WORD_THRESHOLD_STEP) * WORD_THRESHOLD_STEP;
}

export default function useMilestoneSuggestions({
  notesSoFar,
  existingMilestones,
  onSuggestion,
}: UseMilestoneSuggestionsOptions): UseMilestoneSuggestionsResult {
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const previousThresholdRef = useRef(getEligibleThreshold(notesSoFar));
  const pendingThresholdRef = useRef<number | null>(null);
  const requestTimestampsRef = useRef<number[]>([]);
  const resumeTimeoutRef = useRef<number | null>(null);
  const inFlightRef = useRef(false);
  const isMountedRef = useRef(true);
  const activeControllerRef = useRef<AbortController | null>(null);
  const totalRequestCountRef = useRef(0);

  const onSuggestionRef = useRef(onSuggestion);
  const latestNotesRef = useRef(notesSoFar);
  const latestMilestonesRef = useRef(existingMilestones);
  const attemptDispatchRef = useRef<() => void>(() => {});

  onSuggestionRef.current = onSuggestion;
  latestNotesRef.current = notesSoFar;
  latestMilestonesRef.current = existingMilestones;

  attemptDispatchRef.current = () => {
    if (inFlightRef.current) {
      return;
    }

    const pendingThreshold = pendingThresholdRef.current;
    if (pendingThreshold === null) {
      return;
    }

    const now = Date.now();
    requestTimestampsRef.current = requestTimestampsRef.current.filter(
      (timestamp) => now - timestamp < WINDOW_MS
    );

    if (requestTimestampsRef.current.length >= REQUESTS_PER_WINDOW) {
      if (isMountedRef.current) {
        setIsRateLimited(true);
      }

      if (resumeTimeoutRef.current === null) {
        const oldestTimestamp = requestTimestampsRef.current[0];
        if (typeof oldestTimestamp === 'number') {
          const retryInMs = Math.max(WINDOW_MS - (now - oldestTimestamp), 80);
          resumeTimeoutRef.current = window.setTimeout(() => {
            resumeTimeoutRef.current = null;
            attemptDispatchRef.current();
          }, retryInMs);
        }
      }

      return;
    }

    pendingThresholdRef.current = null;
    inFlightRef.current = true;

    if (isMountedRef.current) {
      setSuggestionError(null);
      setIsRateLimited(false);
    }

    const payload =
      latestMilestonesRef.current.length > 0
        ? {
            notesSoFar: latestNotesRef.current,
            existingMilestones: latestMilestonesRef.current,
          }
        : {
            notesSoFar: latestNotesRef.current,
          };

    const controller = new AbortController();
    activeControllerRef.current = controller;
    requestTimestampsRef.current.push(now);
    totalRequestCountRef.current += 1;

    console.log('[milestone-suggestions] API request dispatched', {
      totalCallsInSession: totalRequestCountRef.current,
      callsInLastMinute: requestTimestampsRef.current.length,
      threshold: pendingThreshold,
      notesSoFar: payload.notesSoFar,
      existingMilestones:
        'existingMilestones' in payload ? payload.existingMilestones : null,
    });

    requestMilestoneSuggestion(payload, controller.signal)
      .then((milestone) => {
        const trimmedMilestone = milestone.trim();
        if (!trimmedMilestone) {
          return;
        }

        const hasNewerPendingThreshold =
          pendingThresholdRef.current !== null &&
          pendingThresholdRef.current > pendingThreshold;

        if (hasNewerPendingThreshold) {
          return;
        }

        onSuggestionRef.current(trimmedMilestone);
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        if (!isMountedRef.current) {
          return;
        }

        if (error instanceof MilestoneSuggestionRequestError) {
          setSuggestionError(error.message);
          return;
        }

        const isNetworkFailure = error instanceof TypeError;

        setSuggestionError(
          isNetworkFailure
            ? 'Unable to reach milestone service. Ensure the server is running on port 5000.'
            : 'Unable to fetch milestone suggestion right now.'
        );
      })
      .finally(() => {
        inFlightRef.current = false;
        activeControllerRef.current = null;
        attemptDispatchRef.current();
      });
  };

  useEffect(() => {
    const currentThreshold = getEligibleThreshold(notesSoFar);
    const previousThreshold = previousThresholdRef.current;

    previousThresholdRef.current = currentThreshold;

    if (
      currentThreshold < WORD_THRESHOLD_STEP ||
      currentThreshold <= previousThreshold
    ) {
      return;
    }

    pendingThresholdRef.current = currentThreshold;
    attemptDispatchRef.current();
  }, [notesSoFar]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;

      if (resumeTimeoutRef.current !== null) {
        window.clearTimeout(resumeTimeoutRef.current);
        resumeTimeoutRef.current = null;
      }

      activeControllerRef.current?.abort();
      activeControllerRef.current = null;
    };
  }, []);

  return {
    suggestionError,
    isRateLimited,
  };
}
