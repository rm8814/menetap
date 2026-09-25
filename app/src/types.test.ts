import { describe, expect, it } from 'vitest';
import { userRoles, isUserRole } from '../convex/roles';

describe('Menetap roles', () => {
  it('contains every supported role', () => {
    expect(userRoles).toEqual(['guest', 'partner', 'vendor', 'support', 'operations', 'finance', 'admin']);
  });

  it('rejects unknown role values', () => {
    expect(isUserRole('unknown')).toBe(false);
    expect(isUserRole('partner')).toBe(true);
  });
});
