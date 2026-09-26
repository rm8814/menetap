import type { MutationCtx } from './_generated/server';
import { auth } from './auth';
const sensitiveKey = /(password|token|secret|cookie|authorization|email|phone|payment|card|otp|address|location)/i;
function sanitize(value: unknown): unknown { if (Array.isArray(value)) return value.slice(0, 20).map(sanitize); if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value as Record<string, unknown>).filter(([key]) => !sensitiveKey.test(key)).map(([key, item]) => [key, sanitize(item)])); if (typeof value === 'string') return value.slice(0, 500); return value; }

export async function recordAudit(ctx: MutationCtx, event: { action: string; entityType: string; entityId: string; metadata?: Record<string, unknown> }) {
  const actorUserId = await auth.getUserId(ctx);
  await ctx.db.insert('auditLogs', {
    actorUserId: actorUserId ?? undefined,
    action: event.action,
    entityType: event.entityType,
    entityId: event.entityId,
    metadata: event.metadata ? sanitize(event.metadata) : undefined,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
}
