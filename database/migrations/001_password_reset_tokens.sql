-- Migration 001: add password_reset_tokens table
-- Run: psql -U <user> -d kindora -f database/migrations/001_password_reset_tokens.sql

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id         SERIAL      PRIMARY KEY,
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token      TEXT        NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours',
    used_at    TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prt_token ON password_reset_tokens (token);
CREATE INDEX IF NOT EXISTS idx_prt_user  ON password_reset_tokens (user_id);
