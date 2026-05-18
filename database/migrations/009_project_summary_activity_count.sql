-- Migration 009: expose activity_count, total_tasks, done_tasks in project_summary
--
-- The admin dashboard table ("Деталі проєктів") needs:
--   activity_count — count of activity_log rows per project ("Активності" column)
--   total_tasks    — total task count (for accurate progress display)
--   done_tasks     — completed task count
--
-- These were already computed inside the view LATERAL but were not SELECTed.
-- We drop and recreate the view to add them.

DROP VIEW IF EXISTS project_summary;

CREATE VIEW project_summary AS
SELECT
    p.id,
    p.title,
    p.description,
    p.icon,
    p.icon_bg,
    -- Live status derived from task completion, preserving terminal states
    CASE
        WHEN p.status IN ('completed', 'archived')    THEN p.status
        WHEN ts.total_tasks > 0 AND ts.done_tasks = 0 THEN 'in_progress'
        WHEN ts.done_tasks  > 0                        THEN 'active'
        ELSE p.status
    END                                              AS status,
    ts.progress,
    ts.total_tasks,
    ts.done_tasks,
    ac.activity_count,
    p.start_date,
    p.end_date,
    p.due_date,
    p.created_by,
    pc.name                                          AS category_name,
    pc.slug                                          AS category_slug,
    u.first_name || ' ' || u.last_name               AS creator_name,
    COUNT(pm.id) FILTER (WHERE pm.is_active)         AS active_members_count,
    COALESCE(
        JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('id', t.id, 'name', t.name, 'color', t.color))
        FILTER (WHERE t.id IS NOT NULL),
        '[]'
    )                                                AS tags,
    p.created_at,
    p.updated_at
FROM  projects          p
LEFT  JOIN project_categories pc ON pc.id         = p.category_id
LEFT  JOIN users               u  ON u.id          = p.created_by
LEFT  JOIN project_members     pm ON pm.project_id = p.id
LEFT  JOIN project_tags        pt ON pt.project_id = p.id
LEFT  JOIN tags                t  ON t.id          = pt.tag_id
LEFT  JOIN LATERAL (
    SELECT
        COUNT(*)                               AS total_tasks,
        COUNT(*) FILTER (WHERE tk.is_done)     AS done_tasks,
        COALESCE(
            ROUND(
                COUNT(*) FILTER (WHERE tk.is_done) * 100.0
                / NULLIF(COUNT(*), 0)
            )::INTEGER,
            0
        )                                      AS progress
    FROM tasks tk
    WHERE tk.project_id = p.id
) ts ON TRUE
LEFT  JOIN LATERAL (
    SELECT COUNT(*) AS activity_count
    FROM   activity_logs al
    WHERE  al.project_id = p.id
) ac ON TRUE
GROUP BY
    p.id, pc.name, pc.slug, u.first_name, u.last_name,
    ts.total_tasks, ts.done_tasks, ts.progress, ac.activity_count;

COMMENT ON VIEW project_summary IS 'Зведена картка проєкту: категорія, теги, кількість учасників, live статус, активності';
