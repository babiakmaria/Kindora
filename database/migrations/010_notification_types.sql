-- Add task_added and task_completed to the notification_type enum.
-- ALTER TYPE ... ADD VALUE cannot run inside a transaction block.
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'task_added';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'task_completed';
