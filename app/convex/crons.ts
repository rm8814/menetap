import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';
const crons = cronJobs();
crons.daily('expire rewards points', { hourUTC: 0, minuteUTC: 15 }, internal.rewards.expireStale, {});
export default crons;
