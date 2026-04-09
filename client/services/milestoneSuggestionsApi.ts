export class MilestoneSuggestionRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'MilestoneSuggestionRequestError';
    this.status = status;
  }
}

type MilestoneSuggestionApiPayload = {
  notesSoFar: string;
  existingMilestones?: string[];
};

type MilestoneSuggestionApiResponse = {
  milestone: string;
};

type MilestoneSuggestionApiError = {
  error?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export async function requestMilestoneSuggestion(
  payload: MilestoneSuggestionApiPayload,
  signal?: AbortSignal
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/milestone-suggestions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal,
  });

  let responseBody: unknown = null;
  try {
    responseBody = await response.json();
  } catch {
    responseBody = null;
  }

  if (!response.ok) {
    const errorBody = responseBody as MilestoneSuggestionApiError | null;
    const message =
      typeof errorBody?.error === 'string'
        ? errorBody.error
        : 'Unable to fetch milestone suggestion right now.';

    throw new MilestoneSuggestionRequestError(message, response.status);
  }

  const successBody = responseBody as MilestoneSuggestionApiResponse | null;
  if (!successBody || typeof successBody.milestone !== 'string') {
    throw new MilestoneSuggestionRequestError(
      'Milestone suggestion response was invalid.',
      response.status
    );
  }

  return successBody.milestone;
}
