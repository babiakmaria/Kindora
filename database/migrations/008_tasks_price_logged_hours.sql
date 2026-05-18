-- Migration 008: add price and logged_hours columns to tasks
--
-- These columns are referenced throughout the backend (PATCH /tasks/:id,
-- calendar aggregation) and frontend (time-tracking popup, task card price tag)
-- but were never added to the live database.
--
-- price        — optional UAH amount attached to a task at creation time
-- logged_hours — hours recorded when a task is marked done (set by the API,
--                also aggregated by the calendar endpoint as total_minutes)

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS logged_hours NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS price        NUMERIC(12,2);

COMMENT ON COLUMN tasks.logged_hours IS 'Час (в годинах), залогований при завершенні задачі';
COMMENT ON COLUMN tasks.price        IS 'Сума (грн), призначена задачі при створенні';
