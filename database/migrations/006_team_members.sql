-- Migration 006: add team_members table
-- Run: psql <connection_string> -f database/migrations/006_team_members.sql

CREATE TABLE IF NOT EXISTS team_members (
    owner_id   UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    member_id  UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    added_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (owner_id, member_id),
    CHECK (owner_id <> member_id)
);

CREATE INDEX IF NOT EXISTS idx_team_owner  ON team_members (owner_id);
CREATE INDEX IF NOT EXISTS idx_team_member ON team_members (member_id);
