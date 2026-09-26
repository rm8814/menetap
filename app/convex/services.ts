import { query } from './_generated/server';

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const services = await ctx.db.query('addOnServices').withIndex('by_active', (q) => q.eq('active', true)).collect();
    return services.filter((service) => service.category === 'early_check_in' || service.category === 'late_check_out');
  },
});
