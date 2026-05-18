-- Migration 005: compute project status from tasks in project_summary view
--
-- Before: status = p.status (static column, only updated by explicit PATCH)
-- After:  status is derived from the live task counts so project cards are
--         always up to date without needing to open the project first.
--
-- Rules (match the logic already in ProjectDetailPage.jsx):
--   completed / archived  → keep the stored status (terminal states)
--   total_tasks > 0 AND done_tasks = 0  → in_progress
--   done_tasks  > 0                     → active
--   no tasks yet                        → keep the stored status (e.g. 'new')

DROP VIEW IF EXISTS project_summary;

CREATE VIEW project_summary AS
SELECT
    p.id,
    p.title,
    p.description,
    p.icon,
    p.icon_bg,
    -- Derive live status from task counts; preserve terminal states.
    CASE
        WHEN p.status IN ('completed', 'archived')   THEN p.status
        WHEN ts.total_tasks > 0 AND ts.done_tasks = 0 THEN 'in_progress'
        WHEN ts.done_tasks  > 0                        THEN 'active'
        ELSE p.status
    END                                          AS status,
    ts.progress,
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
GROUP BY p.id, pc.name, pc.slug, u.first_name, u.last_name,
         ts.total_tasks, ts.done_tasks, ts.progress;

COMMENT ON VIEW project_summary IS 'Зведена картка проєкту: категорія, теги, кількість учасників, live статус';
