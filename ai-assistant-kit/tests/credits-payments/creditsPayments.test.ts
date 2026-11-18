import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { OrgCreditStore } from '../../core/credits/creditStore.ts';
import { checkAndConsume } from '../../core/credits/checkAndConsume.ts';

test('Credit Meter: Free plan starts with 100 credits and decrements atomically', async () => {
  const store = new OrgCreditStore();
  const status = await store.getStatus('org-kit-test', 'ADMIN');

  assert.equal(status.plan, 'free');
  assert.equal(status.creditsRemaining, 100);

  const consumeRes = await checkAndConsume(store, 'org-kit-test', 'admin-1', 'ADMIN', 'chat');
  assert.equal(consumeRes.allowed, true);
  assert.equal(consumeRes.cost, 1);
  assert.equal(consumeRes.creditsRemaining, 99);
});

test('Razorpay HMAC Verification: Valid signature matches, tampered signature rejected', () => {
  const secret = 'test_webhook_secret_key';
  const orderId = 'order_DA981273981';
  const paymentId = 'pay_98127398127';
  const payload = `${orderId}|${paymentId}`;

  const validSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const tamperedSignature = validSignature.replace(/^[a-f0-9]{4}/, 'dead');

  const verifyHmac = (sig: string) => {
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(sig, 'utf8'), Buffer.from(expected, 'utf8'));
  };

  assert.equal(verifyHmac(validSignature), true, 'Valid signature must verify');
  assert.equal(verifyHmac(tamperedSignature), false, 'Tampered signature must be rejected');
});
