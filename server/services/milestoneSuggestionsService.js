import 'dotenv/config';
import Cerebras from '@cerebras/cerebras_cloud_sdk';
import { MILESTONE_SUGGESTION_CONFIG } from '../config/milestoneSuggestionConfig.js';

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
    throw new Error(validation.error);
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

    // We Retry atleast once if the model fails to return a valid suggestion.   
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const modelToUse = attempt === 1 ? MILESTONE_SUGGESTION_CONFIG.model : MILESTONE_SUGGESTION_CONFIG.fallbackModel;
      const completion = await cerebrasClient.chat.completions.create({
        model: modelToUse,
        stream: false,
        temperature: MILESTONE_SUGGESTION_CONFIG.temperature,
        tool_choice: 'none',
        messages: [
          { role: 'system', content: MILESTONE_SUGGESTION_CONFIG.systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });

      const parsedMilestone = extractMilestoneFromCompletion(completion);
      if (parsedMilestone) {
        return parsedMilestone;
      }

      lastError = new Error('Model returned an empty or invalid milestone suggestion.');
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Failed to generate milestone suggestion after retry.');
}
