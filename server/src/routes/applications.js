'use strict'

async function applicationRoutes(fastify) {
  const { db } = fastify

  // ── GET /api/applications ──────────────────────────────────
  // admin → всі pending; user → власні з будь-яким статусом
  fastify.get('/', { onRequest: [fastify.authenticate] }, async (req) => {
    if (req.user.role === 'admin') {
      const { rows } = await db.query(
        `SELECT pa.*, p.title AS project_title, p.icon AS project_icon,
                u.first_name, u.last_name, u.avatar_color
         FROM project_applications pa
         JOIN projects p ON p.id = pa.project_id
         JOIN users    u ON u.id = pa.user_id
         WHERE pa.status = 'pending'
         ORDER BY pa.applied_at DESC`,
      )
      return rows
    }

    const { rows } = await db.query(
      `SELECT pa.*, p.title AS project_title, p.icon AS project_icon
       FROM project_applications pa
       JOIN projects p ON p.id = pa.project_id
       WHERE pa.user_id = $1
       ORDER BY pa.applied_at DESC`,
      [req.user.id],
    )
    return rows
  })

  // ── POST /api/applications — подати заявку ─────────────────
  fastify.post('/', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { project_id, message } = req.body
    if (!project_id) return reply.badRequest('project_id обовʼязковий')

    // Перевірка чи вже є учасником
    const { rows: member } = await db.query(
      `SELECT id FROM project_members WHERE project_id = $1 AND user_id = $2 AND is_active = TRUE`,
      [project_id, req.user.id],
    )
    if (member[0]) return reply.conflict('Ви вже є учасником цього проєкту')

    const { rows } = await db.query(
      `INSERT INTO project_applications (project_id, user_id, message)
       VALUES ($1, $2, $3)
       ON CONFLICT (project_id, user_id) DO NOTHING
       RETURNING *`,
      [project_id, req.user.id, message ?? null],
    )
    if (!rows[0]) return reply.conflict('Заявку на цей проєкт вже подано')

    // Нотифікуємо власника проєкту
    const { rows: owners } = await db.query(
      `SELECT user_id FROM project_members WHERE project_id = $1 AND role = 'owner'`,
      [project_id],
    )
    if (owners.length) {
      await db.query(
        `INSERT INTO notifications (recipient_id, actor_id, project_id, type, payload)
         VALUES ($1, $2, $3, 'user_joined', $4)`,
        [owners[0].user_id, req.user.id, project_id, JSON.stringify({ action: 'application_submitted' })],
      )
    }

    return reply.code(201).send(rows[0])
  })

  // ── PATCH /api/applications/:id — approve / reject (admin) ─
  fastify.patch('/:id', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    if (req.user.role !== 'admin') return reply.forbidden('Тільки адміністратор може розглядати заявки')

    const { status } = req.body
    if (!['approved', 'rejected'].includes(status)) {
      return reply.badRequest('status має бути "approved" або "rejected"')
    }

    const { rows } = await db.query(
      `UPDATE project_applications
       SET status = $1, reviewed_by = $2, reviewed_at = NOW()
       WHERE id = $3 RETURNING *`,
      [status, req.user.id, req.params.id],
    )
    if (!rows[0]) return reply.notFound('Заявку не знайдено')

    if (status === 'approved') {
      await db.query(
        `INSERT INTO project_members (project_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT (project_id, user_id) DO UPDATE SET is_active = TRUE`,
        [rows[0].project_id, rows[0].user_id],
      )
    }

    // Нотифікуємо заявника про результат
    await db.query(
      `INSERT INTO notifications (recipient_id, actor_id, project_id, type, payload)
       VALUES ($1, $2, $3, 'application_reviewed', $4)`,
      [
        rows[0].user_id,
        req.user.id,
        rows[0].project_id,
        JSON.stringify({ status }),
      ],
    )

    return rows[0]
  })

  // ── PATCH /api/applications/:id/withdraw — відкликати заявку
  fastify.patch('/:id/withdraw', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { rows } = await db.query(
      `UPDATE project_applications
       SET status = 'withdrawn'
       WHERE id = $1 AND user_id = $2 AND status = 'pending'
       RETURNING *`,
      [req.params.id, req.user.id],
    )
    if (!rows[0]) return reply.notFound('Заявку не знайдено або вона вже розглянута')
    return rows[0]
  })
}

module.exports = applicationRoutes
