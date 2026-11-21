export async function cleanupExpired(db: D1Database, now = new Date()): Promise<void> {
  const timestamp = now.toISOString();
  const cutoff = new Date(now);
  cutoff.setUTCFullYear(now.getUTCFullYear() - 1);
  if (cutoff.getUTCMonth() !== now.getUTCMonth()) cutoff.setUTCDate(0);
  await db.batch([
    db.prepare('DELETE FROM messages WHERE created_at < ?').bind(cutoff.toISOString()),
    db.prepare('DELETE FROM admin_sessions WHERE expires_at <= ?').bind(timestamp),
    db.prepare('DELETE FROM rate_limits WHERE expires_at <= ?').bind(timestamp),
  ]);
}
