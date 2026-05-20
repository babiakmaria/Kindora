-- 011_remove_organizer_role.sql
-- Remove 'organizer' from user_role_type enum; keep only 'volunteer' and 'admin'.

BEGIN;

-- 1. Convert existing organizer users → volunteer
UPDATE users SET system_role = 'volunteer' WHERE system_role::text = 'organizer';

-- 2. Drop dependent view
DROP VIEW IF EXISTS user_stats CASCADE;

-- 3. Convert column to plain TEXT first — this breaks the dependency on the enum type
ALTER TABLE users ALTER COLUMN system_role DROP DEFAULT;
ALTER TABLE users ALTER COLUMN system_role TYPE TEXT USING system_role::text;

-- 4. Now safely drop both the old type and any leftover from a previous failed run
DROP TYPE IF EXISTS user_role_type    CASCADE;
DROP TYPE IF EXISTS user_role_type_v2 CASCADE;

-- 5. Create clean 2-value enum
CREATE TYPE user_role_type AS ENUM ('volunteer', 'admin');

-- 6. Switch column back to the new enum + restore DEFAULT
ALTER TABLE users
  ALTER COLUMN system_role TYPE user_role_type
  USING system_role::user_role_type;

ALTER TABLE users
  ALTER COLUMN system_role SET DEFAULT 'volunteer';

-- 7. Recreate user_stats view
CREATE VIEW user_stats AS
SELECT
    u.id,
    u.first_name,
    u.last_name,
    u.email,
    u.phone,
    u.city,
    u.country,
    u.bio,
    u.avatar_color,
    u.profile_role,
    u.system_role,
    u.joined_at,
    COALESCE(SUM(pm.hours_contributed), 0)                               AS total_hours,
    COALESCE(SUM(pm.tasks_completed),   0)                               AS total_tasks,
    COUNT(pm.id) FILTER (WHERE pm.is_active)                             AS active_projects_count,
    COUNT(pm.id) FILTER (WHERE p.status = 'completed' AND pm.is_active) AS finished_projects_count,
    COALESCE(
        (SELECT SUM(al.hours_logged) FROM activity_logs al WHERE al.user_id = u.id),
        0
    )                                                                    AS total_logged_hours
FROM  users            u
LEFT  JOIN project_members pm ON pm.user_id = u.id
LEFT  JOIN projects        p  ON p.id       = pm.project_id
GROUP BY u.id;

COMMENT ON VIEW user_stats IS 'Агрегована статистика активності користувача для профілю';

COMMIT;
