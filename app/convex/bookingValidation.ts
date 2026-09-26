export function parseDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Dates must use YYYY-MM-DD format.');
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new Error('Invalid calendar date.');
  return date;
}

export function validateStayDates(checkIn: string, checkOut: string) {
  const start = parseDateOnly(checkIn);
  const end = parseDateOnly(checkOut);
  const nights = Math.round((end.getTime() - start.getTime()) / 86400000);
  if (nights < 1 || nights > 90) throw new Error('Stay must be between 1 and 90 nights.');
  return nights;
}

export function validateGuestBreakdown(guestCount: number, childAges: number[]) {
  if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 20) throw new Error('Guest count must be between 1 and 20.');
  if (childAges.length >= guestCount || childAges.some((age) => !Number.isInteger(age) || age < 0 || age > 17)) throw new Error('Guest and child details are invalid.');
}

export function validateMoney(amount: number, currency: string) {
  if (currency !== 'IDR' || !Number.isSafeInteger(amount) || amount < 0) throw new Error('Invalid booking amount or currency.');
}
