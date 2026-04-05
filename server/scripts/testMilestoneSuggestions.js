import { once } from 'node:events';
import { generateMilestoneSuggestion } from '../services/milestoneSuggestionsService.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

/**
 * Runs a simple connectivity and behavior smoke test for the milestone suggestion API.
 * It validates the direct service call and the HTTP endpoint response shape.
 */
async function run() {
  process.env.NODE_ENV = 'test';
  const { app } = await import('../server.js');

  const sampleNotes =
    'I want to draw a rainy cyberpunk alley with neon signs and two characters meeting under one umbrella.';
  const sampleMilestones = ['Block in alley perspective lines', 'Place main character silhouettes'];
  const results = [];

  async function test(name, fn) {
    try {
      await fn();
      results.push({ name, passed: true });
      console.log(`PASS: ${name}`);
    } catch (error) {
      results.push({ name, passed: false, error });
      console.error(`FAIL: ${name}`);
      console.error(error);
    }
  }

  await test('service input validation rejects non-string notes', async () => {
    let threw = false;

    try {
      await generateMilestoneSuggestion(123, sampleMilestones);
    } catch {
      threw = true;
    }

    assert(threw, 'Expected validation error for non-string notesSoFar.');
  });

  await test('endpoint returns 400 for invalid body', async () => {
    const server = app.listen(0);
    await once(server, 'listening');

    try {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : null;
      assert(port, 'Could not determine test server port.');

      const response = await fetch(`http://127.0.0.1:${port}/api/milestone-suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notesSoFar: 123, existingMilestones: [] }),
      });

      assert(response.status === 400, `Expected 400, got ${response.status}`);
    } finally {
      server.close();
      await once(server, 'close');
    }
  });

  await test('endpoint handles missing existingMilestones (optional)', async () => {
    const server = app.listen(0);
    await once(server, 'listening');

    try {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : null;
      assert(port, 'Could not determine test server port.');

      const response = await fetch(`http://127.0.0.1:${port}/api/milestone-suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notesSoFar: sampleNotes,
          // existingMilestones omitted
        }),
      });

      const data = await response.json();
      assert(response.status === 200, `Endpoint returned status ${response.status}`);
      assert(typeof data.milestone === 'string' && data.milestone.length > 0, 'Endpoint returned invalid milestone.');
    } finally {
      server.close();
      await once(server, 'close');
    }
  });

  await test('service direct live call returns milestone string', async () => {
    const directMilestone = await generateMilestoneSuggestion(sampleNotes, sampleMilestones);
    assert(typeof directMilestone === 'string' && directMilestone.length > 0, 'Service returned empty milestone.');
  });

  await test('endpoint live call returns milestone field', async () => {
    const server = app.listen(0);
    await once(server, 'listening');

    try {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : null;
      assert(port, 'Could not determine test server port.');

      const response = await fetch(`http://127.0.0.1:${port}/api/milestone-suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notesSoFar: sampleNotes,
          existingMilestones: sampleMilestones,
        }),
      });

      const data = await response.json();
      assert(response.status === 200, `Endpoint returned status ${response.status}`);
      assert(typeof data.milestone === 'string' && data.milestone.length > 0, 'Endpoint returned invalid milestone.');
    } finally {
      server.close();
      await once(server, 'close');
    }
  });

  const failed = results.filter((r) => !r.passed);
  const passedCount = results.length - failed.length;
  console.log(`\nTest summary: ${passedCount}/${results.length} passed.`);

  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error('Milestone suggestion smoke test failed:', error);
  process.exitCode = 1;
});
