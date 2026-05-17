'use strict'

const EDITABLE_FIELDS = ['first_name', 'last_name', 'phone', 'city', 'country', 'bio', 'avatar_color', 'profile_role']

async function userRoutes(fastify) {
  const { db } = fastify

  // ── GET /api/users/:id ─────────────────────────────────────
  fastify.get('/:id', async (req, reply) => {
    const { rows } = await db.query('SELECT * FROM user_stats WHERE id = $1', [req.params.id])
    if (!rows[0]) return reply.notFound('Користувача не знайдено')
    return rows[0]
  })

  // ── GET /api/users/:id/skills ──────────────────────────────
  fastify.get('/:id/skills', async (req) => {
    const { rows } = await db.query(
      'SELECT * FROM user_skills WHERE user_id = $1 ORDER BY level_pct DESC',
      [req.params.id],
    )
    return rows
  })

  // ── GET /api/users/:id/projects ───────────────────────────
  fastify.get('/:id/projects', async (req) => {
    const { rows } = await db.query(
      `SELECT ps.*, pm.role AS member_role, pm.hours_contributed, pm.tasks_completed, pm.joined_at
       FROM project_members pm
       JOIN project_summary ps ON ps.id = pm.project_id
       WHERE pm.user_id = $1 AND pm.is_active = TRUE
       ORDER BY pm.joined_at DESC`,
      [req.params.id],
    )
    return rows
  })

  // ── GET /api/users/:id/activity ───────────────────────────
  fastify.get('/:id/activity', async (req) => {
    const { date_from, date_to, project_id } = req.query
    const conditions = ['al.user_id = $1']
    const params = [req.params.id]

    if (project_id) {
      params.push(project_id)
      conditions.push(`al.project_id = $${params.length}`)
    }
    if (date_from) {
      params.push(date_from)
      conditions.push(`al.log_date >= $${params.length}`)
    }
    if (date_to) {
      params.push(date_to)
      conditions.push(`al.log_date <= $${params.length}`)
    }

    const { rows } = await db.query(
      `SELECT al.*, p.title AS project_title, p.icon AS project_icon
       FROM activity_logs al
       JOIN projects p ON p.id = al.project_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY al.log_date DESC, al.created_at DESC`,
      params,
    )
    return rows
  })

  // ── PATCH /api/users/me ────────────────────────────────────
  fastify.patch('/me', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const fields = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => EDITABLE_FIELDS.includes(k)),
    )
    const keys = Object.keys(fields)
    if (!keys.length) return reply.badRequest('Немає допустимих полів для оновлення')

    const sets = keys.map((k, i) => `${k} = $${i + 2}`)
    const { rows } = await db.query(
      `UPDATE users SET ${sets.join(', ')} WHERE id = $1
       RETURNING id, first_name, last_name, email, phone, city, country, bio, avatar_color, profile_role, system_role`,
      [req.user.id, ...Object.values(fields)],
    )
    return rows[0]
  })

  // ── POST /api/users/me/skills ──────────────────────────────
  fastify.post('/me/skills', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { name, level_pct, color } = req.body
    if (!name?.trim()) return reply.badRequest('name обовʼязковий')
    if (level_pct === undefined || level_pct < 0 || level_pct > 100) {
      return reply.badRequest('level_pct має бути від 0 до 100')
    }

    const { rows } = await db.query(
      `INSERT INTO user_skills (user_id, name, level_pct, color)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, name) DO UPDATE SET level_pct = $3, color = $4
       RETURNING *`,
      [req.user.id, name.trim(), level_pct, color ?? '#4F46E5'],
    )
    return reply.code(201).send(rows[0])
  })

  // ── DELETE /api/users/me/skills/:skillId ──────────────────
  fastify.delete('/me/skills/:skillId', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { rowCount } = await db.query(
      `DELETE FROM user_skills WHERE id = $1 AND user_id = $2`,
      [req.params.skillId, req.user.id],
    )
    if (!rowCount) return reply.notFound('Навичку не знайдено')
    return reply.code(204).send()
  })
}

module.exports = userRoutes
