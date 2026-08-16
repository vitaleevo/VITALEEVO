import { MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export async function writeAuditLog(
    ctx: MutationCtx,
    actorId: Id<"users">,
    action: string,
    entityType: string,
    entityId: string,
    details?: string,
) {
    await ctx.db.insert("auditLogs", {
        actorId,
        action,
        entityType,
        entityId,
        details,
        createdAt: Date.now(),
    });
}
