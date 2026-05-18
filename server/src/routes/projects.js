'use strict'

const { createProjectSchema, updateProjectSchema } = require('../schemas/projects')

async function projectRoutes(fastify) {
  const { db } = fastify

  // ── Helpers ────────────────────────────────────────────────

  // Returns true if userId is an active member of projectId
  async function isMember(projectId, userId) {
    const { rows } = await db.query(
      `SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2 AND is_active = TRUE`,
      [projectId, userId],
    )
    return rows.length > 0
  }

  // Validates that assignee_id exists and is an active member of the project
  async function validateAssignee(projectId, assigneeId, reply) {
    const { rows } = await db.query(
      `SELECT 1 FROM users u
       JOIN project_members pm ON pm.user_id = u.id
       WHERE u.id = $1 AND u.is_active = TRUE AND pm.project_id = $2 AND pm.is_active = TRUE`,
      [assigneeId, projectId],
    )
    if (!rows[0]) {
      reply.badRequest('Виконавець не є учасником проєкту або не існує')
      return false
    }
    return true
  }

  async function notifyMembers(projectId, actorId, type, payload) {
    const { rows: members } = await db.query(
      `SELECT user_id FROM project_members WHERE project_id = $1 AND is_active = TRUE AND user_id != $2`,
      [projectId, actorId],
    )
    if (!members.length) return
    const values = members
      .map((_, i) => `($${i * 5 + 1}, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`)
      .join(', ')
    const params = members.flatMap((m) => [m.user_id, actorId, projectId, type, JSON.stringify(payload)])
    await db.query(
      `INSERT INTO notifications (recipient_id, actor_id, project_id, type, payload) VALUES ${values}`,
      params,
    )
  }

  // ── GET /api/projects ──────────────────────────────────────
  // Фільтри: status, category (slug), tag (slug), search
  // Optionally authenticated: if token present, adds is_member field
  fastify.get('/', { onRequest: [fastify.optionalAuth] }, async (req) => {
    const { status, category, tag, search } = req.query
    const userId = req.user?.id ?? null
    const conditions = []
    const params = []

    if (status) {
      params.push(status)
      conditions.push(`ps.status = $${params.length}`)
    }
    if (category) {
      params.push(category)
      conditions.push(`ps.category_slug = $${params.length}`)
    }
    if (search) {
      params.push(`%${search}%`)
      conditions.push(`(ps.title ILIKE $${params.length} OR ps.description ILIKE $${params.length})`)
    }

    let tagJoin = ''
    if (tag) {
      tagJoin = `JOIN project_tags pt ON pt.project_id = ps.id JOIN tags tg ON tg.id = pt.tag_id`
      params.push(tag)
      conditions.push(`tg.slug = $${params.length}`)
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    // When authenticated, compute is_member so the frontend knows which projects
    // the current user belongs to (covers creator AND joined-via-explore cases)
    params.push(userId)
    const memberExpr = `EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = ps.id
        AND pm.user_id    = $${params.length}
        AND pm.is_active  = TRUE
    ) AS is_member`

    const { rows } = await db.query(
      `SELECT ps.*, ${memberExpr}
       FROM project_summary ps ${tagJoin} ${where}
       ORDER BY ps.created_at DESC`,
      params,
    )
    return rows
  })

  // ── GET /api/projects/:id ──────────────────────────────────
  fastify.get('/:id', async (req, reply) => {
    const { rows } = await db.query('SELECT * FROM project_summary WHERE id = $1', [req.params.id])
    if (!rows[0]) return reply.notFound('Проєкт не знайдено')
    return rows[0]
  })

  // ── POST /api/projects ─────────────────────────────────────
  fastify.post('/', { onRequest: [fastify.authenticate], schema: createProjectSchema }, async (req, reply) => {
    const { title, description, icon, icon_bg, category_id, start_date, end_date, tag_ids = [] } = req.body
    const userId = req.user.id

    const { rows: inserted } = await db.query(
      `INSERT INTO projects (title, description, icon, icon_bg, category_id, start_date, end_date, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [title, description, icon, icon_bg, category_id, start_date, end_date, userId],
    )
    const projectId = inserted[0].id

    // Creator is automatically an owner-member
    await db.query(
      `INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, 'owner')`,
      [projectId, userId],
    )

    if (tag_ids.length) {
      const tagValues = tag_ids.map((_, i) => `($1, $${i + 2})`).join(', ')
      await db.query(
        `INSERT INTO project_tags (project_id, tag_id) VALUES ${tagValues} ON CONFLICT DO NOTHING`,
        [projectId, ...tag_ids],
      )
    }

    // Return the full project_summary row (includes category_name, progress, member count, etc.)
    // plus is_member = true since we just added the creator to project_members
    const { rows } = await db.query(
      `SELECT ps.*,
              EXISTS (
                SELECT 1 FROM project_members pm
                WHERE pm.project_id = ps.id AND pm.user_id = $2 AND pm.is_active = TRUE
              ) AS is_member
       FROM project_summary ps WHERE ps.id = $1`,
      [projectId, userId],
    )

    return reply.code(201).send(rows[0])
  })

  // ── PATCH /api/projects/:id ────────────────────────────────
  fastify.patch('/:id', { onRequest: [fastify.authenticate], schema: updateProjectSchema }, async (req, reply) => {
    const { id } = req.params
    const keys = Object.keys(req.body)
    const sets = keys.map((k, i) => `${k} = $${i + 2}`)

    const { rows } = await db.query(
      `UPDATE projects SET ${sets.join(', ')} WHERE id = $1 RETURNING *`,
      [id, ...Object.values(req.body)],
    )
    if (!rows[0]) return reply.notFound('Проєкт не знайдено')

    await notifyMembers(id, req.user.id, 'project_updated', { fields: keys })

    return rows[0]
  })

  // ── DELETE /api/projects/:id ───────────────────────────────
  fastify.delete('/:id', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { rowCount } = await db.query(
      'DELETE FROM projects WHERE id = $1 AND created_by = $2',
      [req.params.id, req.user.id],
    )
    if (!rowCount) return reply.notFound('Проєкт не знайдено або доступ заборонено')
    return reply.code(204).send()
  })

  // ── POST /api/projects/:id/join ────────────────────────────
  fastify.post('/:id/join', {
    onRequest: [fastify.authenticate],
    schema: { body: { type: 'object', additionalProperties: true } },
  }, async (req, reply) => {
    const { rows } = await db.query(
      `INSERT INTO project_members (project_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (project_id, user_id) DO UPDATE SET is_active = TRUE
       RETURNING *`,
      [req.params.id, req.user.id],
    )
    await notifyMembers(req.params.id, req.user.id, 'user_joined', {})
    return reply.code(201).send(rows[0])
  })

  // ── DELETE /api/projects/:id/leave ────────────────────────
  fastify.delete('/:id/leave', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    await db.query(
      `UPDATE project_members SET is_active = FALSE WHERE project_id = $1 AND user_id = $2`,
      [req.params.id, req.user.id],
    )
    await notifyMembers(req.params.id, req.user.id, 'user_left', {})
    return reply.code(204).send()
  })

  // ── POST /api/projects/:id/members ────────────────────────
  // Owner or admin adds an existing user to the project.
  fastify.post('/:id/members', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { user_id } = req.body ?? {}
    if (!user_id) return reply.badRequest('user_id обовʼязковий')

    // Only project owner or system admin can add members
    const { rows: ownerCheck } = await db.query(
      `SELECT 1 FROM project_members
       WHERE project_id = $1 AND user_id = $2 AND role = 'owner' AND is_active = TRUE`,
      [req.params.id, req.user.id],
    )
    if (!ownerCheck.length && req.user.role !== 'admin') {
      return reply.forbidden('Тільки власник проєкту може додавати учасників')
    }

    // Verify the target user exists
    const { rows: userCheck } = await db.query(
      `SELECT id FROM users WHERE id = $1 AND is_active = TRUE`,
      [user_id],
    )
    if (!userCheck.length) return reply.notFound('Користувача не знайдено')

    // Upsert: re-activate if they previously left
    await db.query(
      `INSERT INTO project_members (project_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (project_id, user_id) DO UPDATE SET is_active = TRUE`,
      [req.params.id, user_id],
    )

    // Return the full member row so the frontend can render the avatar immediately
    const { rows } = await db.query(
      `SELECT u.id, u.first_name, u.last_name, u.avatar_color, u.profile_role,
              pm.role, pm.hours_contributed, pm.tasks_completed, pm.joined_at
       FROM project_members pm
       JOIN users u ON u.id = pm.user_id
       WHERE pm.project_id = $1 AND pm.user_id = $2`,
      [req.params.id, user_id],
    )
    return reply.code(201).send(rows[0])
  })

  // ── DELETE /api/projects/:id/members/:userId ───────────────
  // Owner or admin removes a user from the project.
  fastify.delete('/:id/members/:userId', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { rows: ownerCheck } = await db.query(
      `SELECT 1 FROM project_members
       WHERE project_id = $1 AND user_id = $2 AND role = 'owner' AND is_active = TRUE`,
      [req.params.id, req.user.id],
    )
    if (!ownerCheck.length && req.user.role !== 'admin') {
      return reply.forbidden('Тільки власник проєкту може видаляти учасників')
    }

    await db.query(
      `UPDATE project_members SET is_active = FALSE
       WHERE project_id = $1 AND user_id = $2`,
      [req.params.id, req.params.userId],
    )
    return reply.code(204).send()
  })

  // ── GET /api/projects/:id/members ─────────────────────────
  fastify.get('/:id/members', async (req) => {
    const { rows } = await db.query(
      `SELECT u.id, u.first_name, u.last_name, u.avatar_color, u.profile_role,
              pm.role, pm.hours_contributed, pm.tasks_completed, pm.joined_at
       FROM project_members pm
       JOIN users u ON u.id = pm.user_id
       WHERE pm.project_id = $1 AND pm.is_active = TRUE
       ORDER BY pm.role DESC, pm.joined_at`,
      [req.params.id],
    )
    return rows
  })

  // ── GET /api/projects/:id/tasks ───────────────────────────
  fastify.get('/:id/tasks', async (req) => {
    const { is_done } = req.query
    const conditions = ['t.project_id = $1']
    const params = [req.params.id]

    if (is_done !== undefined) {
      params.push(is_done === 'true')
      conditions.push(`t.is_done = $${params.length}`)
    }

    const { rows } = await db.query(
      `SELECT t.*,
              a.first_name AS assignee_first_name, a.last_name AS assignee_last_name,
              c.first_name AS creator_first_name,  c.last_name  AS creator_last_name
       FROM tasks t
       LEFT JOIN users a ON a.id = t.assignee_id
       LEFT JOIN users c ON c.id = t.created_by
       WHERE ${conditions.join(' AND ')}
       ORDER BY t.is_done, t.priority DESC, t.created_at`,
      params,
    )
    return rows
  })

  // ── POST /api/projects/:id/tasks ──────────────────────────
  fastify.post('/:id/tasks', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { title, description, assignee_id, priority, due_date, price } = req.body

    if (!title?.trim()) return reply.badRequest('title обовʼязковий')

    const VALID_PRIORITIES = ['low', 'medium', 'high']
    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return reply.badRequest(`priority має бути одним з: ${VALID_PRIORITIES.join(', ')}`)
    }

    // Only project members can create tasks
    if (!(await isMember(req.params.id, req.user.id))) {
      return reply.forbidden('Тільки учасники проєкту можуть створювати задачі')
    }

    // Validate assignee belongs to the project
    if (assignee_id) {
      if (!(await validateAssignee(req.params.id, assignee_id, reply))) return
    }

    const priceVal = price != null && parseFloat(price) > 0 ? parseFloat(price) : null

    // Insert and return full row with assignee/creator names via join
    const insertRes = await db.query(
      `INSERT INTO tasks (project_id, created_by, assignee_id, title, description, priority, due_date, price)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [req.params.id, req.user.id, assignee_id ?? null, title.trim(), description ?? null, priority ?? 'medium', due_date ?? null, priceVal],
    )
    const { rows } = await db.query(
      `SELECT t.*,
              a.first_name AS assignee_first_name, a.last_name AS assignee_last_name,
              c.first_name AS creator_first_name,  c.last_name  AS creator_last_name
       FROM tasks t
       LEFT JOIN users a ON a.id = t.assignee_id
       LEFT JOIN users c ON c.id = t.created_by
       WHERE t.id = $1`,
      [insertRes.rows[0].id],
    )

    if (assignee_id && assignee_id !== req.user.id) {
      await db.query(
        `INSERT INTO notifications (recipient_id, actor_id, project_id, type, payload)
         VALUES ($1, $2, $3, 'task_assigned', $4)`,
        [assignee_id, req.user.id, req.params.id, JSON.stringify({ task_title: title.trim() })],
      )
    }

    return reply.code(201).send(rows[0])
  })

  // ── PATCH /api/projects/:id/tasks/:taskId ─────────────────
  fastify.patch('/:id/tasks/:taskId', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const projectId = req.params.id
    const taskId    = req.params.taskId

    // Membership check
    if (!(await isMember(projectId, req.user.id))) {
      return reply.forbidden('Тільки учасники проєкту можуть редагувати задачі')
    }

    // Pull out hours_logged before filtering — it's not a task column
    const { hours_logged: rawHours, ...bodyRest } = req.body ?? {}

    const ALLOWED = ['title', 'description', 'assignee_id', 'priority', 'is_done', 'due_date', 'price']
    const fields  = Object.fromEntries(Object.entries(bodyRest).filter(([k]) => ALLOWED.includes(k)))
    const keys    = Object.keys(fields)
    if (!keys.length && rawHours === undefined) return reply.badRequest('Немає допустимих полів')

    // ── Field validation ──
    if ('title' in fields && !fields.title?.trim()) {
      return reply.badRequest('title не може бути порожнім')
    }
    if (fields.title) fields.title = fields.title.trim()

    const VALID_PRIORITIES = ['low', 'medium', 'high']
    if (fields.priority && !VALID_PRIORITIES.includes(fields.priority)) {
      return reply.badRequest(`priority має бути одним з: ${VALID_PRIORITIES.join(', ')}`)
    }

    if (fields.assignee_id) {
      if (!(await validateAssignee(projectId, fields.assignee_id, reply))) return
    }

    // ── Validate hours_logged ──
    let hoursToLog = null
    if (rawHours !== undefined && rawHours !== null && rawHours !== '') {
      hoursToLog = parseFloat(rawHours)
      if (isNaN(hoursToLog) || hoursToLog <= 0) {
        return reply.badRequest('hours_logged має бути числом більше 0')
      }
      if (hoursToLog > 24) {
        return reply.badRequest('hours_logged не може перевищувати 24 години')
      }
    }

    // ── Fetch current task state (to detect is_done transition) ──
    const { rows: current } = await db.query(
      `SELECT is_done, assignee_id FROM tasks WHERE id = $1 AND project_id = $2`,
      [taskId, projectId],
    )
    if (!current[0]) return reply.notFound('Задачу не знайдено')
    const wasNotDone = !current[0].is_done
    const transitioningToDone   = fields.is_done === true  && wasNotDone
    const transitioningToUndone = fields.is_done === false && !wasNotDone

    // Stamp completed_at alongside is_done so the calendar has a real timestamp
    if (transitioningToDone)   fields.completed_at = new Date().toISOString()
    if (transitioningToUndone) fields.completed_at = null

    // Rebuild keys/sets after possibly adding completed_at
    const finalKeys = Object.keys(fields)

    // ── Update task (skip DB call if no task fields to change) ──
    let updatedTask
    if (finalKeys.length) {
      const sets = finalKeys.map((k, i) => `${k} = $${i + 2}`)
      const { rows } = await db.query(
        `UPDATE tasks SET ${sets.join(', ')}
         WHERE id = $1 AND project_id = $${finalKeys.length + 2}
         RETURNING *`,
        [taskId, ...Object.values(fields), projectId],
      )
      if (!rows[0]) return reply.notFound('Задачу не знайдено')
      updatedTask = rows[0]
    } else {
      updatedTask = (await db.query(`SELECT * FROM tasks WHERE id = $1`, [taskId])).rows[0]
    }

    // ── Notify new assignee ──
    if (fields.assignee_id && fields.assignee_id !== req.user.id) {
      await db.query(
        `INSERT INTO notifications (recipient_id, actor_id, project_id, type, payload)
         VALUES ($1, $2, $3, 'task_assigned', $4)`,
        [fields.assignee_id, req.user.id, projectId, JSON.stringify({ task_title: updatedTask.title })],
      )
    }

    // ── Time tracking: only when transitioning from not-done → done ──
    if (transitioningToDone) {
      // Determine whose counters to update: assignee or the person completing it
      const targetUserId = updatedTask.assignee_id || req.user.id

      // Increment tasks_completed for that member
      await db.query(
        `UPDATE project_members
         SET tasks_completed = tasks_completed + 1
         WHERE project_id = $1 AND user_id = $2`,
        [projectId, targetUserId],
      )

      // Log hours if provided
      if (hoursToLog !== null) {
        const today = new Date().toISOString().slice(0, 10)

        // Persist on the task itself so the UI can show it without joins
        await db.query(
          `UPDATE tasks SET logged_hours = $1 WHERE id = $2`,
          [hoursToLog, taskId],
        )
        updatedTask.logged_hours = hoursToLog

        await db.query(
          `INSERT INTO activity_logs (project_id, user_id, hours_logged, description, log_date)
           VALUES ($1, $2, $3, $4, $5)`,
          [projectId, req.user.id, hoursToLog,
           `Задача: ${updatedTask.title}`, today],
        )
        await db.query(
          `UPDATE project_members
           SET hours_contributed = hours_contributed + $1
           WHERE project_id = $2 AND user_id = $3`,
          [hoursToLog, projectId, req.user.id],
        )
      }
    }

    return updatedTask
  })

  // ── DELETE /api/projects/:id/tasks/:taskId ────────────────
  fastify.delete('/:id/tasks/:taskId', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    // Only members can delete; additionally only task creator or project owner can delete
    if (!(await isMember(req.params.id, req.user.id))) {
      return reply.forbidden('Тільки учасники проєкту можуть видаляти задачі')
    }

    const { rowCount } = await db.query(
      `DELETE FROM tasks
       WHERE id = $1 AND project_id = $2
         AND (created_by = $3 OR $3 IN (
           SELECT user_id FROM project_members WHERE project_id = $2 AND role = 'owner' AND is_active = TRUE
         ))`,
      [req.params.taskId, req.params.id, req.user.id],
    )
    if (!rowCount) return reply.forbidden('Задачу не знайдено або недостатньо прав для видалення')
    return reply.code(204).send()
  })

  // ── GET /api/projects/:id/activity ────────────────────────
  fastify.get('/:id/activity', async (req) => {
    const { date_from, date_to, user_id } = req.query
    const conditions = ['al.project_id = $1']
    const params = [req.params.id]

    if (user_id) {
      params.push(user_id)
      conditions.push(`al.user_id = $${params.length}`)
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
      `SELECT al.*, u.first_name, u.last_name, u.avatar_color
       FROM activity_logs al
       JOIN users u ON u.id = al.user_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY al.log_date DESC, al.created_at DESC`,
      params,
    )
    return rows
  })

  // ── POST /api/projects/:id/activity ───────────────────────
  fastify.post('/:id/activity', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { hours_logged, description, log_date } = req.body
    if (!hours_logged || hours_logged <= 0) return reply.badRequest('hours_logged має бути більше 0')

    // Перевірка чи є учасником
    const { rows: member } = await db.query(
      `SELECT id FROM project_members WHERE project_id = $1 AND user_id = $2 AND is_active = TRUE`,
      [req.params.id, req.user.id],
    )
    if (!member[0]) return reply.forbidden('Тільки учасники можуть логувати години')

    const { rows } = await db.query(
      `INSERT INTO activity_logs (project_id, user_id, hours_logged, description, log_date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.params.id, req.user.id, hours_logged, description ?? null, log_date ?? new Date().toISOString().slice(0, 10)],
    )

    // Оновлюємо агрегований лічильник у project_members
    await db.query(
      `UPDATE project_members SET hours_contributed = hours_contributed + $1
       WHERE project_id = $2 AND user_id = $3`,
      [hours_logged, req.params.id, req.user.id],
    )

    await notifyMembers(req.params.id, req.user.id, 'contribution_added', { hours: hours_logged })

    return reply.code(201).send(rows[0])
  })

  // ── DELETE /api/projects/:id/activity/:logId ──────────────
  fastify.delete('/:id/activity/:logId', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { rows } = await db.query(
      `DELETE FROM activity_logs WHERE id = $1 AND user_id = $2 RETURNING hours_logged`,
      [req.params.logId, req.user.id],
    )
    if (!rows[0]) return reply.notFound('Запис не знайдено або доступ заборонено')

    // Відкатуємо години з агрегату
    await db.query(
      `UPDATE project_members SET hours_contributed = GREATEST(0, hours_contributed - $1)
       WHERE project_id = $2 AND user_id = $3`,
      [rows[0].hours_logged, req.params.id, req.user.id],
    )

    return reply.code(204).send()
  })

  // ── GET /api/projects/:id/calendar?year=YYYY&month=M ─────
  // Returns completed-task activity grouped by calendar day.
  //
  // Response shape:
  //   { "YYYY-MM-DD": [ { userId, initials, name, color, tasks, totalMinutes } ] }
  //
  // Each array element represents one unique user who completed tasks that day.
  // tasks[] contains the task titles; totalMinutes is the sum of logged_hours*60
  // for that user on that date (0 when no time was tracked).
  //
  // The query runs a single GROUP BY aggregation — no per-day loops on the server.
  fastify.get('/:id/calendar', async (req, reply) => {
    const projectId = req.params.id
    const year  = parseInt(req.query.year,  10) || new Date().getFullYear()
    const month = parseInt(req.query.month, 10) || (new Date().getMonth() + 1) // 1-based

    if (month < 1 || month > 12) return reply.badRequest('month має бути від 1 до 12')

    // Date range for the requested month (inclusive)
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate   = new Date(year, month, 0).toISOString().slice(0, 10) // last day of month

    const { rows } = await db.query(
      `SELECT
         TO_CHAR(t.completed_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS day,
         u.id                                                       AS user_id,
         u.first_name,
         u.last_name,
         u.avatar_color,
         ARRAY_AGG(t.title ORDER BY t.completed_at)                AS task_titles,
         COALESCE(SUM(
           CASE WHEN t.logged_hours IS NOT NULL
                THEN ROUND(t.logged_hours * 60)::INT
                ELSE 0
           END
         ), 0)                                                      AS total_minutes,
         COALESCE(SUM(t.price), 0)                                  AS total_price
       FROM tasks t
       JOIN users u ON u.id = COALESCE(t.assignee_id, t.created_by)
       WHERE t.project_id  = $1
         AND t.is_done     = TRUE
         AND t.completed_at IS NOT NULL
         AND t.completed_at >= $2::DATE
         AND t.completed_at <  ($3::DATE + INTERVAL '1 day')
       GROUP BY day, u.id, u.first_name, u.last_name, u.avatar_color
       ORDER BY day, total_minutes DESC`,
      [projectId, startDate, endDate],
    )

    // Reshape flat rows into the map the frontend expects:
    // { 'YYYY-MM-DD': [ { userId, initials, name, color, tasks, totalMinutes } ] }
    const calendar = {}
    for (const row of rows) {
      const initials = (
        ((row.first_name || '')[0] || '') +
        ((row.last_name  || '')[0] || '')
      ).toUpperCase() || '??'

      const entry = {
        userId:       row.user_id,
        initials,
        name:         `${row.first_name || ''} ${row.last_name || ''}`.trim(),
        color:        row.avatar_color || '#6B7280',
        tasks:        row.task_titles,
        totalMinutes: Number(row.total_minutes),
        totalPrice:   Number(row.total_price),
      }

      if (!calendar[row.day]) calendar[row.day] = []
      calendar[row.day].push(entry)
    }

    return calendar
  })

  // ── GET /api/projects/:id/tags ────────────────────────────
  fastify.get('/:id/tags', async (req) => {
    const { rows } = await db.query(
      `SELECT t.* FROM tags t JOIN project_tags pt ON pt.tag_id = t.id WHERE pt.project_id = $1`,
      [req.params.id],
    )
    return rows
  })

  // ── POST /api/projects/:id/tags ───────────────────────────
  fastify.post('/:id/tags', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { tag_id } = req.body
    if (!tag_id) return reply.badRequest('tag_id обовʼязковий')

    await db.query(
      `INSERT INTO project_tags (project_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [req.params.id, tag_id],
    )
    return reply.code(204).send()
  })

  // ── DELETE /api/projects/:id/tags/:tagId ──────────────────
  fastify.delete('/:id/tags/:tagId', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    await db.query(
      `DELETE FROM project_tags WHERE project_id = $1 AND tag_id = $2`,
      [req.params.id, req.params.tagId],
    )
    return reply.code(204).send()
  })
}

module.exports = projectRoutes
