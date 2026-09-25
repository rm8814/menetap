import type { MutationCtx } from './_generated/server';
import { auth } from './auth';

export async function recordAudit(ctx: MutationCtx, event: { action: string; entityType: string; entityId: string; metadata?: Record<string, unknown> }) {
  const actorUserId = await auth.getUserId(ctx);
  await ctx.db.insert('auditLogs', {
    actorUserId: actorUserId ?? undefined,
    action: event.action,
    entityType: event.entityType,
    entityId: event.entityId,
    metadata: event.metadata,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
}
