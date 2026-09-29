import { describe, expect, it } from 'vitest';
import { validateOverbookingNote } from '../convex/refunds';

describe('overbooking flag validation', () => {
  it('rejects blank and trivial notes', () => {
    expect(() => validateOverbookingNote('  ')).toThrow();
    expect(() => validateOverbookingNote('ok')).toThrow();
  });

  it('trims and accepts a meaningful note', () => {
    expect(validateOverbookingNote('  Inventory mismatch confirmed  ')).toBe('Inventory mismatch confirmed');
  });
});
