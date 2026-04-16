import 'dotenv/config';
import Cerebras from '@cerebras/cerebras_cloud_sdk';
import { MILESTONE_SUGGESTION_CONFIG } from '../config/milestoneSuggestionConfig.js';

const RATE_LIMIT_WAIT_MS = 1000;

/**
 * Domain error for milestone suggestion failures with safe API-facing metadata.
 */
export class MilestoneSuggestionServiceError extends Error {
  /**
   * @param {string} message
   * @param {{statusCode?: number, code?: string, cause?: unknown}} [options]
   */
  constructor(message, options = {}) {
    super(message, { cause: options.cause });
    this.name = 'MilestoneSuggestionServiceError';
    this.statusCode = options.statusCode ?? 500;
    this.code = options.code ?? 'MILESTONE_SUGGESTION_FAILED';
  }
}

/**
 * Wait helper used for rate-limit backoff.
 * @param {number} ms
 * @returns {Promise<void>}
 */
function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * @param {unknown} error
 * @returns {boolean}
 */
function isCerebrasApiError(error) {
  return error instanceof Cerebras.APIError;
}

/**
 * @param {unknown} error
 * @returns {number|undefined}
 */
function getErrorStatus(error) {
  return isCerebrasApiError(error) ? error.status : undefined;
}

/**
 * @param {unknown} error
 * @returns {boolean}
 */
function isRateLimitError(error) {
  const status = getErrorStatus(error);
  return status === 429 || (isCerebrasApiError(error) && error.name === 'RateLimitError');
}

/**
 * Normalizes unknown errors into a safe service error for route handlers.
 * @param {unknown} error
 * @returns {MilestoneSuggestionServiceError}
 */
function toMilestoneServiceError(error) {
  if (error instanceof MilestoneSuggestionServiceError) {
    return error;
  }

  if (isCerebrasApiError(error)) {
    const status = error.status;

    if (status === 429) {
      return new MilestoneSuggestionServiceError('Milestone suggestions are temporarily unavailable.', {
        statusCode: 503,
        code: 'RATE_LIMITED',
        cause: error,
      });
    }

    if (status === 408 || status >= 500) {
      return new MilestoneSuggestionServiceError('Milestone suggestions are temporarily unavailable.', {
        statusCode: 503,
        code: 'UPSTREAM_TEMPORARY_FAILURE',
        cause: error,
      });
    }

    if (status === 404 || error.name === 'NotFoundError') {
      return new MilestoneSuggestionServiceError('Milestone model is unavailable right now.', {
        statusCode: 502,
        code: 'MODEL_UNAVAILABLE',
        cause: error,
      });
    }

    if (status === 400 || status === 401 || status === 402 || status === 403 || status === 422) {
      return new MilestoneSuggestionServiceError('Milestone provider rejected this request.', {
        statusCode: 502,
        code: 'UPSTREAM_REQUEST_REJECTED',
        cause: error,
      });
    }
  }

  if (error instanceof Error && error.message === 'CEREBRAS_API_KEY is not configured.') {
    return new MilestoneSuggestionServiceError('Milestone suggestions are not configured.', {
      statusCode: 500,
      code: 'PROVIDER_NOT_CONFIGURED',
      cause: error,
    });
  }

  if (error instanceof Error && error.message === 'notesSoFar must be a string.') {
    return new MilestoneSuggestionServiceError('Invalid milestone suggestion request.', {
      statusCode: 400,
      code: 'INVALID_INPUT',
      cause: error,
    });
  }

  if (error instanceof Error && error.message.includes('existingMilestones')) {
    return new MilestoneSuggestionServiceError('Invalid milestone suggestion request.', {
      statusCode: 400,
      code: 'INVALID_INPUT',
      cause: error,
    });
  }

  return new MilestoneSuggestionServiceError('Failed to generate milestone suggestion.', {
    statusCode: 500,
    code: 'MILESTONE_SUGGESTION_FAILED',
    cause: error,
  });
}

/**
 * Creates a Cerebras client after validating API key availability.
 * @returns {Cerebras}
 */
function getCerebrasClient() {
  if (!process.env.CEREBRAS_API_KEY) {
    throw new Error('CEREBRAS_API_KEY is not configured.');
  }

  return new Cerebras({
    apiKey: process.env.CEREBRAS_API_KEY,
    maxRetries: 0,
  });
}

/**
 * Validates the milestone suggestion request payload.
 * @param {unknown} notesSoFar - Partial notes written by the user.
 * @param {unknown} [existingMilestones] - Milestones the user has already added.
 * @returns {{isValid: boolean, error?: string}}
 */
function validateMilestoneSuggestionInput(notesSoFar, existingMilestones) {
  if (typeof notesSoFar !== 'string') {
    return { isValid: false, error: 'notesSoFar must be a string.' };
  }

  if (existingMilestones !== undefined) {
    if (!Array.isArray(existingMilestones)) {
      return { isValid: false, error: 'existingMilestones must be an array of strings.' };
    }

    if (!existingMilestones.every((item) => typeof item === 'string')) {
      return { isValid: false, error: 'existingMilestones must contain only strings.' };
    }
  }

  return { isValid: true };
}

/**
 * Extracts and sanitizes a milestone from the model completion payload.
 * @param {any} completion - Raw completion response from Cerebras.
 * @returns {string|null} Sanitized milestone text, or null if invalid.
 */
function extractMilestoneFromCompletion(completion) {
  const milestone = completion?.choices?.[0]?.message?.content?.trim();
  if (!milestone) {
    return null;
  }

  const cleanedMilestone = milestone.replace(/^[-*\d.\s]+/, '').trim();
  return cleanedMilestone || null;
}

/**
 * Generates a single milestone suggestion using the Cerebras Chat Completions API.
 * @param {string} notesSoFar - The user's notebook text so far. Can be partial/incomplete.
 * @param {string[]} [existingMilestones=[]] - Milestones already accepted/added by the user.
 * @returns {Promise<string>} One concise milestone suggestion.
 */
export async function generateMilestoneSuggestion(notesSoFar, existingMilestones = []) {
  const validation = validateMilestoneSuggestionInput(notesSoFar, existingMilestones);
  if (!validation.isValid) {
    throw new MilestoneSuggestionServiceError('Invalid milestone suggestion request.', {
      statusCode: 400,
      code: 'INVALID_INPUT',
      cause: new Error(validation.error),
    });
  }

  const cerebrasClient = getCerebrasClient();

  const userPrompt = [
    'NOTES_SO_FAR:',
    notesSoFar.trim(),
    '',
    'EXISTING_MILESTONES:',
    existingMilestones.length ? existingMilestones.map((m) => `- ${m}`).join('\n') : '- (none)',
    '',
    'Return one new milestone not duplicated in existing milestones.',
  ].join('\n');

  const maxAttempts = Number(MILESTONE_SUGGESTION_CONFIG.maxAttempts) || 2;
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const modelToUse = attempt === 1 ? MILESTONE_SUGGESTION_CONFIG.model : MILESTONE_SUGGESTION_CONFIG.fallbackModel;
      const completion = await cerebrasClient.chat.completions.create(
        {
          model: modelToUse,
          stream: false,
          temperature: MILESTONE_SUGGESTION_CONFIG.temperature,
          tool_choice: 'none',
          messages: [
            { role: 'system', content: MILESTONE_SUGGESTION_CONFIG.systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        },
        {
          maxRetries: 0,
        }
      );

      const parsedMilestone = extractMilestoneFromCompletion(completion);
      if (parsedMilestone) {
        return parsedMilestone;
      }

      lastError = new MilestoneSuggestionServiceError('Model returned an empty or invalid milestone suggestion.', {
        statusCode: 502,
        code: 'INVALID_MODEL_OUTPUT',
      });
    } catch (error) {
      lastError = error;

      if (isRateLimitError(error)) {
        if (attempt === 1 && attempt < maxAttempts) {
          await wait(RATE_LIMIT_WAIT_MS);
          continue;
        }

        throw new MilestoneSuggestionServiceError('Milestone suggestions are temporarily unavailable.', {
          statusCode: 503,
          code: 'RATE_LIMITED',
          cause: error,
        });
      }
    }
  }

  throw toMilestoneServiceError(lastError || new Error('Failed to generate milestone suggestion after retry.'));
}
