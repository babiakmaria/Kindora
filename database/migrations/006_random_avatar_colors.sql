-- Migration 006: assign random palette colors to users who still have the default avatar_color
--
-- New users will receive a random color at registration time (handled in the API).
-- This migration back-fills existing users that were created before that change
-- and therefore still carry the old default '#4F46E5'.
--
-- Each row gets an independently random pick so users end up with different colors.

UPDATE users
SET avatar_color = (
  ARRAY[
    '#FF6B9D', '#4CAF7D', '#8B5CF6', '#F59E0B', '#06B6D4',
    '#10B981', '#F97316', '#6366F1', '#EC4899', '#14B8A6'
  ])[floor(random() * 10 + 1)::int]
WHERE avatar_color = '#4F46E5';
