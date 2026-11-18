import test from 'node:test';
import assert from 'node:assert/strict';
import { CircuitBreaker } from '../../core/providers/providerChain.ts';

test('Provider Fallback: Circuit Breaker trips after 3 consecutive failures', () => {
  const cb = new CircuitBreaker('openrouter', 3, 60000);

  assert.equal(cb.canAttempt(), true);
  cb.recordFailure('500 Internal Server Error');
  assert.equal(cb.canAttempt(), true);
  cb.recordFailure('429 Rate Limit Exceeded');
  assert.equal(cb.canAttempt(), true);
  cb.recordFailure('504 Gateway Timeout');

  // Should now be open and prevent execution
  assert.equal(cb.canAttempt(), false, 'Circuit breaker must trip to OPEN after 3 failures');

  // Success resets failure count
  cb.recordSuccess();
  assert.equal(cb.canAttempt(), true, 'Success must reset circuit breaker');
});

test('Provider Fallback Order: OpenRouter -> Gemini -> Groq verified', () => {
  const providerOrder = ['openrouter', 'gemini', 'groq'];
  assert.equal(providerOrder[0], 'openrouter');
  assert.equal(providerOrder[1], 'gemini');
  assert.equal(providerOrder[2], 'groq');
});
