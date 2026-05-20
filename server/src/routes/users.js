'use strict'

const EDITABLE_FIELDS = ['first_name', 'last_name', 'phone', 'city', 'country', 'bio', 'avatar_color', 'profile_role']

async function userRoutes(fastify) {
  const { db } = fastify

  // ── GET /api/users — all active users (admin only) ───────
  fastify.get('/', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    if (req.user.role !== 'admin') return reply.forbidden()
    const { rows } = await db.query(
      `SELECT id, first_name, last_name, email, avatar_color, profile_role, system_role, joined_at
       FROM users WHERE is_active = TRUE ORDER BY first_name, last_name`,
    )
    return rows
  })

  // ── GET /api/users/search?q=<query> ──────────────────────
  // Returns up to 20 users whose name or email matches the query.
  // Requires authentication so arbitrary visitors can't enumerate users.
  fastify.get('/search', { onRequest: [fastify.authenticate] }, async (req) => {
    const q = (req.query.q ?? '').trim()
    if (q.length < 2) return []

    const { rows } = await db.query(
      `SELECT id, first_name, last_name, avatar_color, profile_role
       FROM users
       WHERE is_active = TRUE
         AND (
           first_name ILIKE $1 OR
           last_name  ILIKE $1 OR
           (first_name || ' ' || last_name) ILIKE $1 OR
           email ILIKE $1
         )
       ORDER BY first_name, last_name
       LIMIT 20`,
      [`%${q}%`],
    )
    return rows
  })

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

  // ── GET /api/users/:id/team ────────────────────────────────
  fastify.get('/:id/team', async (req) => {
    const { rows } = await db.query(
      `SELECT u.id, u.first_name, u.last_name, u.avatar_color, u.profile_role
       FROM team_members tm
       JOIN users u ON u.id = tm.member_id
       WHERE tm.owner_id = $1 AND u.is_active = TRUE
       ORDER BY tm.added_at ASC`,
      [req.params.id],
    )
    return rows
  })

  // ── POST /api/users/me/team  { member_id } ────────────────
  fastify.post('/me/team', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { member_id } = req.body ?? {}
    if (!member_id) return reply.badRequest('member_id обовʼязковий')
    if (member_id === req.user.id) return reply.badRequest('Не можна додати себе до команди')

    await db.query(
      `INSERT INTO team_members (owner_id, member_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [req.user.id, member_id],
    )

    const { rows } = await db.query(
      `SELECT u.id, u.first_name, u.last_name, u.avatar_color, u.profile_role
       FROM users u WHERE u.id = $1`,
      [member_id],
    )
    return reply.code(201).send(rows[0] ?? {})
  })

  // ── DELETE /api/users/me/team/:memberId ───────────────────
  fastify.delete('/me/team/:memberId', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    await db.query(
      `DELETE FROM team_members WHERE owner_id = $1 AND member_id = $2`,
      [req.user.id, req.params.memberId],
    )
    return reply.code(204).send()
  })
}

module.exports = userRoutes
