export function earnedPoints(totalIdr: number, rate: number) { return Math.floor(totalIdr * rate); }
export function redemptionDiscount(points: number, valuePerPoint: number, balance: number) { if (points < 0 || points > balance) throw new Error('Not enough Rewards points.'); return points * valuePerPoint; }
export function nextExpiry(memberSince: number, months: number) { const date = new Date(memberSince); date.setUTCMonth(date.getUTCMonth() + months); return date.getTime(); }
