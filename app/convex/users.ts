import { query } from './_generated/server';
import { auth } from './auth';

export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user || user.status === 'suspended') return null;
    return { id: user._id, email: user.email, name: user.name, role: user.role, status: user.status };
  },
});
