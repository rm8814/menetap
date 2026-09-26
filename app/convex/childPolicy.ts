export type ChildPolicy = { acceptsChildren: boolean; maxChildAge: number; pricing: 'free' | 'flat' | 'age_band'; flatRate?: number; ageRates?: Array<{ maxAge: number; nightlyRate: number }> };

export function validateChildAges(policy: ChildPolicy | undefined, ages: number[]) {
  if (!ages.length) return;
  if (!policy?.acceptsChildren) throw new Error('This property does not accept children for this room.');
  if (ages.some((age) => !Number.isInteger(age) || age < 0 || age > policy.maxChildAge)) throw new Error(`Children must be ${policy.maxChildAge} years old or younger at this property.`);
}

export function childNightlyCharge(policy: ChildPolicy | undefined, ages: number[]) {
  validateChildAges(policy, ages);
  if (!policy || policy.pricing === 'free') return 0;
  if (policy.pricing === 'flat') return (policy.flatRate ?? 0) * ages.length;
  return ages.reduce((total, age) => total + (policy.ageRates?.find((band) => age <= band.maxAge)?.nightlyRate ?? 0), 0);
}
