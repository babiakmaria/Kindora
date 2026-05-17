-- Migration 002: add logged_hours to tasks
-- Run: psql <connection_string> -f database/migrations/002_tasks_logged_hours.sql

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS logged_hours NUMERIC(8,2);
