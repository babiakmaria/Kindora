-- Migration 007: add completed_at column to tasks
--
-- completed_at records the exact timestamp when a task transitioned to done.
-- It is set by the API (PATCH /projects/:id/tasks/:taskId) when is_done goes
-- false → true, and cleared back to NULL when a task is uncompleted.
--
-- The calendar aggregation endpoint (GET /projects/:id/calendar) groups by
-- DATE(completed_at) so the calendar shows real completion data instead of mocks.

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Back-fill: existing done tasks get the timestamp they were last updated,
-- which is the closest approximation we have.
UPDATE tasks
SET completed_at = updated_at
WHERE is_done = TRUE AND completed_at IS NULL;
