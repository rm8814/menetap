export const userRoles = ['guest', 'partner', 'vendor', 'support', 'operations', 'finance', 'admin'] as const;
export type UserRole = (typeof userRoles)[number];

export function isUserRole(value: string): value is UserRole {
  return userRoles.includes(value as UserRole);
}
