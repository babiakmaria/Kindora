-- Add location column + widen icon column, then rebuild the project_summary view.
-- Run once against the live database:
--   psql $DATABASE_URL -f database/migrations/add_location_to_projects.sql

ALTER TABLE projects ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE projects ALTER COLUMN icon TYPE VARCHAR(50);

DROP VIEW IF EXISTS project_summary CASCADE;

CREATE VIEW project_summary AS
SELECT
    p.id,
    p.title,
    p.description,
    p.icon,
    p.icon_bg,
    p.location,
    CASE
        WHEN p.status IN ('completed', 'archived')    THEN p.status
        WHEN ts.total_tasks > 0 AND ts.done_tasks = 0 THEN 'in_progress'
        WHEN ts.done_tasks  > 0                        THEN 'active'
        ELSE p.status
    END                                          AS status,
    ts.progress,
    ts.total_tasks,
    ts.done_tasks,
    ac.activity_count,
    p.start_date,
    p.end_date,
    p.due_date,
    p.created_by,
    pc.name                                      AS category_name,
    pc.slug                                      AS category_slug,
    u.first_name || ' ' || u.last_name           AS creator_name,
    COUNT(pm.id) FILTER (WHERE pm.is_active)     AS active_members_count,
    COALESCE(
        JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('id', t.id, 'name', t.name, 'color', t.color))
        FILTER (WHERE t.id IS NOT NULL),
        '[]'
    )                                            AS tags,
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
