-- Migration 004: widen icon column from VARCHAR(10) to VARCHAR(50)
-- The project_summary view depends on icon, so we drop it first,
-- alter the column, then recreate the view identically.

DROP VIEW IF EXISTS project_summary;

ALTER TABLE projects ALTER COLUMN icon TYPE VARCHAR(50);

CREATE VIEW project_summary AS
SELECT
    p.id,
    p.title,
    p.description,
    p.icon,
    p.icon_bg,
    p.status,
    ts.progress,
    p.start_date,
    p.end_date,
    p.due_date,
    p.created_by,
    pc.name                              AS category_name,
    pc.slug                              AS category_slug,
    u.first_name || ' ' || u.last_name   AS creator_name,
    COUNT(pm.id) FILTER (WHERE pm.is_active)   AS active_members_count,
    COALESCE(
        JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('id', t.id, 'name', t.name, 'color', t.color))
        FILTER (WHERE t.id IS NOT NULL),
        '[]'
    )                                    AS tags,
    p.created_at,
    p.updated_at
FROM  projects          p
LEFT  JOIN project_categories pc ON pc.id         = p.category_id
LEFT  JOIN users               u  ON u.id          = p.created_by
LEFT  JOIN project_members     pm ON pm.project_id = p.id
LEFT  JOIN project_tags        pt ON pt.project_id = p.id
LEFT  JOIN tags                t  ON t.id          = pt.tag_id
LEFT  JOIN LATERAL (
    SELECT COALESCE(
        ROUND(
            COUNT(*) FILTER (WHERE tk.is_done) * 100.0
            / NULLIF(COUNT(*), 0)
        )::INTEGER,
        0
    ) AS progress
    FROM tasks tk
    WHERE tk.project_id = p.id
) ts ON TRUE
GROUP BY p.id, pc.name, pc.slug, u.first_name, u.last_name, ts.progress;

COMMENT ON VIEW project_summary IS 'Зведена картка проєкту: категорія, теги, кількість учасників';
