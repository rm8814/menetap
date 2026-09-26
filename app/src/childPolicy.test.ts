import { describe, expect, it } from 'vitest';
import { childNightlyCharge, validateChildAges } from '../convex/childPolicy';

describe('property child policy', () => {
  const policy = { acceptsChildren: true, maxChildAge: 12, pricing: 'age_band' as const, ageRates: [{ maxAge: 5, nightlyRate: 50000 }, { maxAge: 12, nightlyRate: 75000 }] };
  it('calculates age-band charges', () => expect(childNightlyCharge(policy, [4, 10])).toBe(125000));
  it('rejects unsupported ages', () => expect(() => validateChildAges(policy, [13])).toThrow());
  it('rejects children when disabled', () => expect(() => validateChildAges({ ...policy, acceptsChildren: false }, [4])).toThrow());
});
