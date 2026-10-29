import 'server-only';
import crypto from 'crypto';

export function validateCodeSignature(code: string, receivedSignature: string, secret: string): boolean {
  const expected = Buffer.from(crypto.createHmac('sha256', secret).update(code, 'utf8').digest('hex'), 'utf8');
  const received = Buffer.from(receivedSignature, 'utf8');
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}
