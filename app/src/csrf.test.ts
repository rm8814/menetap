import { describe, expect, it } from 'vitest';
import { assertSameOrigin } from '../convex/csrf';

describe('CSRF origin protection', () => {
  it('allows safe reads without an origin header', () => {
    expect(() => assertSameOrigin(new Request('https://api.example.test', { method: 'GET' }), ['https://menetap.com'])).not.toThrow();
  });

  it('requires an allowed origin for state-changing requests', () => {
    expect(() => assertSameOrigin(new Request('https://api.example.test', { method: 'POST', headers: { Origin: 'https://menetap.com' } }), ['https://menetap.com'])).not.toThrow();
    expect(() => assertSameOrigin(new Request('https://api.example.test', { method: 'POST', headers: { Origin: 'https://evil.example' } }), ['https://menetap.com'])).toThrow('CSRF validation failed.');
  });
});
