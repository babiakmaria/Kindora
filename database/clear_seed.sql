-- clear_seed.sql
-- Removes all seeded demo data so you can start fresh with your own account.
-- Safe to run multiple times (all deletes are scoped to the seeded UUIDs).

BEGIN;

-- Seed project UUIDs all start with 'aaaa0001-...' pattern or similar
-- We delete by the seeded user ID to catch everything they own.
DO $$
DECLARE
  seed_user_id UUID := '11111111-0000-0000-0000-000000000001';
  seed_user_ids UUID[] := ARRAY[
    '11111111-0000-0000-0000-000000000001',
    '11111111-0000-0000-0000-000000000002',
    '11111111-0000-0000-0000-000000000003',
    '11111111-0000-0000-0000-000000000004',
    '11111111-0000-0000-0000-000000000005',
    '11111111-0000-0000-0000-000000000006',
    '11111111-0000-0000-0000-000000000007',
    '11111111-0000-0000-0000-000000000008'
  ];
  seed_project_ids UUID[];
BEGIN
  -- Collect seeded project IDs
  SELECT ARRAY_AGG(id) INTO seed_project_ids
  FROM projects
  WHERE created_by = ANY(seed_user_ids);

  -- Clean up child tables first
  DELETE FROM activity_logs      WHERE project_id = ANY(seed_project_ids);
  DELETE FROM notifications      WHERE project_id = ANY(seed_project_ids);
  DELETE FROM project_applications WHERE project_id = ANY(seed_project_ids);
  DELETE FROM tasks              WHERE project_id = ANY(seed_project_ids);
  DELETE FROM project_members    WHERE project_id = ANY(seed_project_ids);
  DELETE FROM project_tags       WHERE project_id = ANY(seed_project_ids);
  DELETE FROM projects           WHERE id         = ANY(seed_project_ids);

  -- Remove seeded users (keeps your own registered account)
  DELETE FROM user_skills WHERE user_id = ANY(seed_user_ids);
  DELETE FROM notifications WHERE user_id = ANY(seed_user_ids);
  DELETE FROM project_applications WHERE user_id = ANY(seed_user_ids);
  DELETE FROM project_members WHERE user_id = ANY(seed_user_ids);
  DELETE FROM users WHERE id = ANY(seed_user_ids);

  RAISE NOTICE 'Seed data cleared. Deleted % projects.', array_length(seed_project_ids, 1);
END $$;

COMMIT;
