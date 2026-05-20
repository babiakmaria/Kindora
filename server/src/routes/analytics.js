'use strict'

async function analyticsRoutes(fastify) {
  const { db } = fastify

  // GET /api/analytics/stats
  // Returns the four overview stats for the currently authenticated admin.
  fastify.get('/stats', { onRequest: [fastify.authenticate] }, async (req) => {
    const adminId = req.user.id

    // Unique volunteers across all projects owned by this admin.
    // Each user is counted once even if they joined multiple projects.
    const { rows: volunteerRows } = await db.query(
      `SELECT COUNT(DISTINCT pm.user_id) AS total_volunteers
       FROM project_members pm
       JOIN projects p ON p.id = pm.project_id
       WHERE p.created_by = $1`,
      [adminId],
    )

    // Projects that resolve to 'active' for the admin.
    // Status is derived the same way as in the project_summary view:
    // a project is active when it has at least one completed task
    // (and is not already in a terminal state like completed/archived),
    // or when its raw status column is 'active' and it has no tasks at all.
    const { rows: activeRows } = await db.query(
      `SELECT COUNT(*) AS active_projects
       FROM projects p
       LEFT JOIN LATERAL (
         SELECT
           COUNT(*)                           AS total_tasks,
           COUNT(*) FILTER (WHERE t.is_done)  AS done_tasks
         FROM tasks t
         WHERE t.project_id = p.id
       ) ts ON TRUE
       WHERE p.created_by = $1
         AND CASE
               WHEN p.status IN ('completed', 'archived')    THEN p.status::text
               WHEN ts.total_tasks > 0 AND ts.done_tasks = 0 THEN 'in_progress'
               WHEN ts.done_tasks  > 0                        THEN 'active'
               ELSE p.status::text
             END = 'active'`,
      [adminId],
    )

    // Projects with status 'completed' created by this admin.
    const { rows: completedRows } = await db.query(
      `SELECT COUNT(*) AS completed_projects
       FROM projects
       WHERE created_by = $1
         AND status = 'completed'`,
      [adminId],
    )

    // Completed tasks (is_done = TRUE) in projects owned by this admin.
    const { rows: taskRows } = await db.query(
      `SELECT COUNT(*) AS completed_tasks
       FROM tasks t
       JOIN projects p ON p.id = t.project_id
       WHERE p.created_by = $1
         AND t.is_done = TRUE`,
      [adminId],
    )

    return {
      totalVolunteers:   Number(volunteerRows[0].total_volunteers),
      activeProjects:    Number(activeRows[0].active_projects),
      completedProjects: Number(completedRows[0].completed_projects),
      completedTasks:    Number(taskRows[0].completed_tasks),
    }
  })

  // GET /api/analytics/spending?months=6
  // Returns monthly spending totals (sum of task prices) for the admin's projects.
  // Months with no tasks return total: 0 so the chart always has a full series.
  fastify.get('/spending', { onRequest: [fastify.authenticate] }, async (req) => {
    const adminId = req.user.id
    const months  = Math.min(Math.max(parseInt(req.query.months, 10) || 6, 1), 24)

    const { rows } = await db.query(
      `WITH month_series AS (
         SELECT TO_CHAR(
           generate_series(
             date_trunc('month', NOW()) - ($2::int - 1) * INTERVAL '1 month',
             date_trunc('month', NOW()),
             '1 month'::interval
           ),
           'YYYY-MM'
         ) AS month
       )
       SELECT
         ms.month,
         COALESCE(SUM(admin_tasks.price), 0)::numeric AS total
       FROM month_series ms
       LEFT JOIN (
         SELECT tk.price, TO_CHAR(tk.created_at, 'YYYY-MM') AS task_month
         FROM   tasks    tk
         JOIN   projects p ON p.id = tk.project_id
         WHERE  p.created_by = $1
           AND  tk.price IS NOT NULL
       ) admin_tasks ON admin_tasks.task_month = ms.month
       GROUP  BY ms.month
       ORDER  BY ms.month`,
      [adminId, months],
    )

    return rows
  })

  // GET /api/analytics/platform
  // Platform-wide stats for the admin dashboard stat cards.
  // Requires authentication; frontend already restricts this page to admins.
  fastify.get('/platform', { onRequest: [fastify.authenticate] }, async (req) => {

    const { rows } = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM projects)::int                                        AS total_projects,
        (SELECT COUNT(*) FROM users WHERE is_active = TRUE)::int                    AS total_users,
        (SELECT COUNT(*) FROM project_applications WHERE status = 'pending')::int   AS pending_applications,
        (SELECT
          CASE WHEN COUNT(*) > 0
            THEN ROUND(COUNT(*) FILTER (WHERE status = 'completed') * 100.0 / COUNT(*))::int
            ELSE 0
          END
         FROM projects)                                                             AS completion_rate
    `)
    return rows[0]
  })

  // GET /api/analytics/report
  // Returns a per-project summary for the export report.
  // Each row: { title, status, members (array of names), totalHours, totalSpent }
  fastify.get('/report', { onRequest: [fastify.authenticate] }, async (req) => {
    const adminId = req.user.id

    const { rows } = await db.query(
      `SELECT
         p.id,
         p.title,
         -- Derived live status (same logic as project_summary view)
         CASE
           WHEN p.status IN ('completed', 'archived')    THEN p.status
           WHEN ts.total_tasks > 0 AND ts.done_tasks = 0 THEN 'in_progress'
           WHEN ts.done_tasks  > 0                        THEN 'active'
           ELSE p.status
         END                          AS status,
         ta.total_hours,
         ta.total_spent,
         COALESCE(
           JSON_AGG(u.first_name || ' ' || u.last_name)
             FILTER (WHERE pm.is_active AND u.id IS NOT NULL),
           '[]'
         )                            AS members
       FROM projects p
       -- Task status (for derived status column)
       LEFT JOIN LATERAL (
         SELECT
           COUNT(*)                          AS total_tasks,
           COUNT(*) FILTER (WHERE is_done)   AS done_tasks
         FROM tasks WHERE project_id = p.id
       ) ts ON TRUE
       -- Task financial totals in isolation — avoids multiplication with members join
       LEFT JOIN LATERAL (
         SELECT
           COALESCE(SUM(logged_hours), 0) AS total_hours,
           COALESCE(SUM(price),        0) AS total_spent
         FROM tasks WHERE project_id = p.id
       ) ta ON TRUE
       -- Members (separate join — does not touch tasks)
       LEFT JOIN project_members pm ON pm.project_id = p.id
       LEFT JOIN users           u  ON u.id          = pm.user_id
       WHERE p.created_by = $1
         AND p.status != 'archived'
       GROUP BY p.id, p.title, p.status, ts.total_tasks, ts.done_tasks,
                ta.total_hours, ta.total_spent
       ORDER BY p.title`,
      [adminId],
    )

    return rows.map((r) => ({
      title:      r.title,
      status:     r.status,
      members:    Array.isArray(r.members) ? r.members : [],
      totalHours: Number(r.total_hours),
      totalSpent: Number(r.total_spent),
    }))
  })

  // GET /api/analytics/key-metrics
  // Returns three computed metrics for the "Ключові показники" panel:
  //   avgProgress         — average task-based progress across non-archived projects
  //   activeThisWeek      — distinct assignees who completed ≥1 task this calendar week
  //   avgMembersPerProject — average active member count per project
  fastify.get('/key-metrics', { onRequest: [fastify.authenticate] }, async (req) => {
    const adminId = req.user.id

    // Average progress (derived from tasks, same formula as project_summary view)
    const { rows: progressRows } = await db.query(
      `SELECT COALESCE(ROUND(AVG(
         CASE WHEN ts.total_tasks > 0
           THEN ts.done_tasks * 100.0 / ts.total_tasks
           ELSE 0
         END
       )), 0)::int AS avg_progress
       FROM projects p
       LEFT JOIN LATERAL (
         SELECT
           COUNT(*)                          AS total_tasks,
           COUNT(*) FILTER (WHERE t.is_done) AS done_tasks
         FROM tasks t WHERE t.project_id = p.id
       ) ts ON TRUE
       WHERE p.created_by = $1
         AND p.status != 'archived'`,
      [adminId],
    )

    // Active team members this week — distinct task assignees with a completion this week
    const { rows: weekRows } = await db.query(
      `SELECT COUNT(DISTINCT t.assignee_id)::int AS active_this_week
       FROM   tasks    t
       JOIN   projects p ON p.id = t.project_id
       WHERE  p.created_by  = $1
         AND  t.is_done     = TRUE
         AND  t.completed_at >= date_trunc('week', NOW() AT TIME ZONE 'UTC')
         AND  t.assignee_id IS NOT NULL`,
      [adminId],
    )

    // Average active members per project
    const { rows: memberRows } = await db.query(
      `SELECT COALESCE(ROUND(AVG(cnt)), 0)::int AS avg_members
       FROM (
         SELECT pm.project_id, COUNT(*) AS cnt
         FROM   project_members pm
         JOIN   projects        p  ON p.id = pm.project_id
         WHERE  p.created_by   = $1
           AND  pm.is_active   = TRUE
         GROUP  BY pm.project_id
       ) sub`,
      [adminId],
    )

    return {
      avgProgress:          progressRows[0].avg_progress,
      activeThisWeek:       weekRows[0].active_this_week,
      avgMembersPerProject: memberRows[0].avg_members,
    }
  })

  // GET /api/analytics/categories
  // Returns project counts per category for projects created by the authenticated admin.
  // Only categories that have at least one project are included, sorted by count descending.
  fastify.get('/categories', { onRequest: [fastify.authenticate] }, async (req) => {
    const adminId = req.user.id

    const { rows } = await db.query(
      `SELECT
         pc.name                                           AS label,
         COUNT(p.id) FILTER (WHERE p.created_by = $1)::int AS value
       FROM   project_categories pc
       LEFT   JOIN projects p ON p.category_id = pc.id
       GROUP  BY pc.id, pc.name
       ORDER  BY value DESC, pc.name`,
      [adminId],
    )

    return rows
  })

  // GET /api/analytics/volunteer-distribution
  // Categorizes each unique volunteer across the admin's non-archived projects
  // into exactly one bucket using priority: permanent team member > new joiner > one-time.
  // Returns { total, newVolunteers, permanentMembers, oneTimeParticipants }.
  fastify.get('/volunteer-distribution', { onRequest: [fastify.authenticate] }, async (req) => {
    const adminId = req.user.id

    const { rows } = await db.query(
      `WITH team AS (
         SELECT member_id AS user_id
         FROM   team_members
         WHERE  owner_id = $1
       ),
       project_volunteers AS (
         SELECT pm.user_id, MIN(pm.joined_at) AS first_joined
         FROM   project_members pm
         JOIN   projects        p  ON p.id = pm.project_id
         WHERE  p.created_by = $1
           AND  p.status     != 'archived'
           AND  pm.is_active  = TRUE
         GROUP  BY pm.user_id
       ),
       all_users AS (
         SELECT user_id FROM team
         UNION
         SELECT user_id FROM project_volunteers
       ),
       project_counts AS (
         SELECT pm.user_id, COUNT(DISTINCT pm.project_id) AS project_count
         FROM   project_members pm
         JOIN   projects        p  ON p.id = pm.project_id
         WHERE  p.created_by = $1
           AND  p.status     != 'archived'
           AND  pm.is_active  = TRUE
         GROUP  BY pm.user_id
       ),
       task_counts AS (
         SELECT t.assignee_id AS user_id, COUNT(*) AS done_tasks
         FROM   tasks    t
         JOIN   projects p  ON p.id = t.project_id
         WHERE  p.created_by  = $1
           AND  p.status      != 'archived'
           AND  t.is_done      = TRUE
           AND  t.assignee_id IS NOT NULL
         GROUP  BY t.assignee_id
       ),
       categorized AS (
         SELECT
           au.user_id,
           CASE
             WHEN t.user_id      IS NOT NULL                    THEN 'permanent'
             WHEN pv.first_joined >= NOW() - INTERVAL '2 days'  THEN 'new'
             WHEN COALESCE(pc.project_count, 0) = 1
              AND COALESCE(tc.done_tasks,    0) = 1             THEN 'one_time'
             ELSE 'other'
           END AS category
         FROM   all_users          au
         LEFT   JOIN team              t  ON t.user_id  = au.user_id
         LEFT   JOIN project_volunteers pv ON pv.user_id = au.user_id
         LEFT   JOIN project_counts    pc ON pc.user_id  = au.user_id
         LEFT   JOIN task_counts       tc ON tc.user_id  = au.user_id
       )
       SELECT
         COUNT(*)::int                                          AS total,
         COUNT(*) FILTER (WHERE category = 'new')::int         AS new_volunteers,
         COUNT(*) FILTER (WHERE category = 'permanent')::int   AS permanent_members,
         COUNT(*) FILTER (WHERE category = 'one_time')::int    AS one_time_participants
       FROM categorized`,
      [adminId],
    )

    const row = rows[0]
    return {
      total:                Number(row.total),
      newVolunteers:        Number(row.new_volunteers),
      permanentMembers:     Number(row.permanent_members),
      oneTimeParticipants:  Number(row.one_time_participants),
    }
  })
}

module.exports = analyticsRoutes
