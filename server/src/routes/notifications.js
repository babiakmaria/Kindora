'use strict'

async function notificationRoutes(fastify) {
  const { db } = fastify

  // ── GET /api/notifications ─────────────────────────────────
  fastify.get('/', { onRequest: [fastify.authenticate] }, async (req) => {
    const { unread_only } = req.query
    const conditions = ['n.recipient_id = $1']
    const params = [req.user.id]

    if (unread_only === 'true') {
      conditions.push('n.is_read = FALSE')
    }

    const { rows } = await db.query(
      `SELECT n.*,
              u.first_name   AS actor_first_name,
              u.last_name    AS actor_last_name,
              u.avatar_color AS actor_avatar_color,
              p.title        AS project_title,
              p.icon         AS project_icon
       FROM notifications n
       LEFT JOIN users    u ON u.id = n.actor_id
       LEFT JOIN projects p ON p.id = n.project_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY n.created_at DESC
       LIMIT 50`,
      params,
    )
    return rows
  })

  // ── GET /api/notifications/unread-count ───────────────────
  fastify.get('/unread-count', { onRequest: [fastify.authenticate] }, async (req) => {
    const { rows } = await db.query(
      `SELECT COUNT(*)::int AS count FROM notifications WHERE recipient_id = $1 AND is_read = FALSE`,
      [req.user.id],
    )
    return { count: rows[0].count }
  })

  // ── PATCH /api/notifications/:id/read ─────────────────────
  fastify.patch('/:id/read', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { rowCount } = await db.query(
      `UPDATE notifications SET is_read = TRUE WHERE id = $1 AND recipient_id = $2`,
      [req.params.id, req.user.id],
    )
    if (!rowCount) return reply.notFound('Сповіщення не знайдено')
    return reply.code(204).send()
  })

  // ── PATCH /api/notifications/read-all ─────────────────────
  fastify.patch('/read-all', { onRequest: [fastify.authenticate] }, async (req) => {
    const { rowCount } = await db.query(
      `UPDATE notifications SET is_read = TRUE WHERE recipient_id = $1 AND is_read = FALSE`,
      [req.user.id],
    )
    return { updated: rowCount }
  })

  // ── DELETE /api/notifications/:id ─────────────────────────
  fastify.delete('/:id', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { rowCount } = await db.query(
      `DELETE FROM notifications WHERE id = $1 AND recipient_id = $2`,
      [req.params.id, req.user.id],
    )
    if (!rowCount) return reply.notFound('Сповіщення не знайдено')
    return reply.code(204).send()
  })
}

module.exports = notificationRoutes
