import express from 'express';
import { generateMilestoneSuggestion } from '../services/milestoneSuggestionsService.js';

const milestoneSuggestionsRouter = express.Router();

/**
 * POST /api/milestone-suggestions
 * Body:
 * - notesSoFar: string (required)
 * - existingMilestones: string[] (optional)
 *
 * Returns:
 * - milestone: string
 */
milestoneSuggestionsRouter.post('/', async (req, res) => {
  const { notesSoFar, existingMilestones } = req.body ?? {};

  if (typeof notesSoFar !== 'string') {
    return res.status(400).json({ error: 'notesSoFar must be a string.' });
  }

  if (existingMilestones !== undefined) {
    if (!Array.isArray(existingMilestones) || !existingMilestones.every((m) => typeof m === 'string')) {
      return res.status(400).json({ error: 'existingMilestones must be an array of strings.' });
    }
  }

  try {
    const milestone = await generateMilestoneSuggestion(notesSoFar, existingMilestones);
    return res.status(200).json({ milestone });
  } catch (error) {
    console.error('Milestone suggestion error:', error);

    const providerErrorCode = error?.error?.code;
    if (providerErrorCode === 'model_not_found') {
      return res.status(502).json({
        error: 'Milestone model is unavailable for the current API key.',
        code: providerErrorCode,
      });
    }

    return res.status(500).json({ error: 'Failed to generate milestone suggestion.' });
  }
});

export default milestoneSuggestionsRouter;
