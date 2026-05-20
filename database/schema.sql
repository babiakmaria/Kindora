-- ============================================================
--  Kindora — повна схема PostgreSQL
--  Запуск: psql -U <user> -d kindora -f database/schema.sql
-- ============================================================

\set ON_ERROR_STOP on

-- ============================================================
--  Скидання в порядку залежностей (для чистого перезапуску)
-- ============================================================

DROP VIEW  IF EXISTS user_stats      CASCADE;
DROP VIEW  IF EXISTS project_summary CASCADE;

DROP TABLE IF EXISTS team_members          CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS notifications       CASCADE;
DROP TABLE IF EXISTS activity_logs       CASCADE;
DROP TABLE IF EXISTS project_tags        CASCADE;
DROP TABLE IF EXISTS tags                CASCADE;
DROP TABLE IF EXISTS project_applications CASCADE;
DROP TABLE IF EXISTS tasks               CASCADE;
DROP TABLE IF EXISTS project_members     CASCADE;
DROP TABLE IF EXISTS user_skills         CASCADE;
DROP TABLE IF EXISTS projects            CASCADE;
DROP TABLE IF EXISTS users               CASCADE;
DROP TABLE IF EXISTS project_categories  CASCADE;

DROP TYPE IF EXISTS notification_type  CASCADE;
DROP TYPE IF EXISTS application_status CASCADE;
DROP TYPE IF EXISTS task_priority      CASCADE;
DROP TYPE IF EXISTS member_role        CASCADE;
DROP TYPE IF EXISTS project_status     CASCADE;
DROP TYPE IF EXISTS user_role_type     CASCADE;

DROP FUNCTION IF EXISTS update_updated_at CASCADE;

-- ============================================================
--  Розширення
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
--  ENUM-типи
-- ============================================================

CREATE TYPE user_role_type AS ENUM (
    'volunteer',
    'admin'
);

CREATE TYPE project_status AS ENUM (
    'new',
    'active',
    'in_progress',
    'completed',
    'archived'
);

CREATE TYPE member_role AS ENUM (
    'owner',
    'contributor',
    'observer'
);

CREATE TYPE task_priority AS ENUM (
    'low',
    'medium',
    'high'
);

CREATE TYPE application_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'withdrawn'
);

CREATE TYPE notification_type AS ENUM (
    'user_joined',
    'user_left',
    'contribution_added',
    'project_updated',
    'application_reviewed',
    'task_assigned',
    'task_added',
    'task_completed'
);

-- ============================================================
--  Тригерна функція для автооновлення updated_at
-- ============================================================

CREATE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- ============================================================
--  project_categories
--  Довідник категорій: один проєкт → одна категорія (1:N)
-- ============================================================

CREATE TABLE project_categories (
    id          SERIAL       PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    slug        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE project_categories IS 'Довідник категорій проєктів';

INSERT INTO project_categories (name, slug, description) VALUES
    ('Довкілля',  'environment', 'Проєкти з охорони навколишнього середовища'),
    ('Освіта',    'education',   'Освітні ініціативи та навчальні програми'),
    ('Соціальне', 'social',      'Соціальна підтримка та допомога громадам'),
    ('Культура',  'culture',     'Культурні та мистецькі ініціативи'),
    ('Здоров''я', 'health',      'Охорона здоров''я та добробут'),
    ('Загальне',  'general',     'Загальні волонтерські ініціативи');

-- ============================================================
--  users
-- ============================================================

CREATE TABLE users (
    id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name    VARCHAR(100)  NOT NULL,
    last_name     VARCHAR(100)  NOT NULL,
    email         VARCHAR(255)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    phone         VARCHAR(30),
    city          VARCHAR(100),
    country       VARCHAR(100),
    bio           TEXT          CHECK (LENGTH(bio) <= 400),
    avatar_color  VARCHAR(7)    NOT NULL DEFAULT '#4F46E5',
    system_role   user_role_type NOT NULL DEFAULT 'volunteer',
    profile_role  VARCHAR(150),
    agreed_terms  BOOLEAN       NOT NULL DEFAULT FALSE,
    is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
    joined_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  users              IS 'Зареєстровані користувачі платформи';
COMMENT ON COLUMN users.avatar_color IS 'HEX-колір fallback-аватару з ініціалами';
COMMENT ON COLUMN users.system_role  IS 'volunteer | admin';
COMMENT ON COLUMN users.profile_role IS 'Відображувана роль у публічному профілі';

CREATE INDEX idx_users_email       ON users (email);
CREATE INDEX idx_users_city        ON users (city);
CREATE INDEX idx_users_system_role ON users (system_role);
CREATE INDEX idx_users_is_active   ON users (is_active) WHERE is_active;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
--  user_skills
--  Навички одного користувача (1:N users → user_skills)
-- ============================================================

CREATE TABLE user_skills (
    id        SERIAL       PRIMARY KEY,
    user_id   UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name      VARCHAR(100) NOT NULL,
    level_pct SMALLINT     NOT NULL DEFAULT 0 CHECK (level_pct BETWEEN 0 AND 100),
    color     VARCHAR(7)   NOT NULL DEFAULT '#4F46E5',

    UNIQUE (user_id, name)
);

COMMENT ON TABLE user_skills IS 'Навички користувача з відсотковим рівнем володіння';

CREATE INDEX idx_user_skills_user ON user_skills (user_id);

-- ============================================================
--  projects
-- ============================================================

CREATE TABLE projects (
    id              UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(255)   NOT NULL CHECK (LENGTH(TRIM(title)) >= 3),
    description     TEXT,
    icon            VARCHAR(50)    NOT NULL DEFAULT 'Leaf',
    icon_bg         VARCHAR(7)     NOT NULL DEFAULT '#EEF2FF'
                                   CHECK (icon_bg ~ '^#[0-9A-Fa-f]{6}$'),
    status          project_status NOT NULL DEFAULT 'new',
    category_id     INT            REFERENCES project_categories (id) ON DELETE SET NULL,
    progress        SMALLINT       NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    start_date      DATE,
    end_date        DATE,
    due_date        DATE,
    location        VARCHAR(255),
    created_by      UUID           NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_project_dates CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

COMMENT ON TABLE  projects          IS 'Волонтерські проєкти платформи';
COMMENT ON COLUMN projects.progress IS 'Відсоток виконання (0–100)';

CREATE INDEX idx_projects_status     ON projects (status);
CREATE INDEX idx_projects_category   ON projects (category_id);
CREATE INDEX idx_projects_created_by ON projects (created_by);
CREATE INDEX idx_projects_due_date   ON projects (due_date);

CREATE TRIGGER trg_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
--  project_members  (N:M  users ↔ projects)
-- ============================================================

CREATE TABLE project_members (
    id                SERIAL       PRIMARY KEY,
    project_id        UUID         NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    user_id           UUID         NOT NULL REFERENCES users (id)    ON DELETE CASCADE,
    role              member_role  NOT NULL DEFAULT 'contributor',
    hours_contributed NUMERIC(8,2) NOT NULL DEFAULT 0 CHECK (hours_contributed >= 0),
    tasks_completed   INT          NOT NULL DEFAULT 0 CHECK (tasks_completed >= 0),
    is_active         BOOLEAN      NOT NULL DEFAULT TRUE,
    joined_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    UNIQUE (project_id, user_id)
);

COMMENT ON TABLE  project_members                  IS 'Учасники проєктів; зв''язок users ↔ projects';
COMMENT ON COLUMN project_members.role             IS 'owner — засновник, contributor — учасник, observer — спостерігач';
COMMENT ON COLUMN project_members.hours_contributed IS 'Сумарні години внеску у проєкт';

CREATE INDEX idx_pm_project ON project_members (project_id);
CREATE INDEX idx_pm_user    ON project_members (user_id);
CREATE INDEX idx_pm_active  ON project_members (project_id, user_id) WHERE is_active;

CREATE TRIGGER trg_pm_updated_at
    BEFORE UPDATE ON project_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
--  tags  (глобальний довідник тегів)
-- ============================================================

CREATE TABLE tags (
    id         SERIAL       PRIMARY KEY,
    name       VARCHAR(50)  NOT NULL UNIQUE,
    slug       VARCHAR(50)  NOT NULL UNIQUE,
    color      VARCHAR(7)   NOT NULL DEFAULT '#6B7280'
);

COMMENT ON TABLE tags IS 'Глобальний довідник тегів для проєктів';

INSERT INTO tags (name, slug, color) VALUES
    ('Волонтерство', 'volunteering', '#4CAF7D'),
    ('Екологія',     'ecology',      '#34D399'),
    ('Освіта',       'education',    '#6366F1'),
    ('Громада',      'community',    '#F59E0B'),
    ('Мистецтво',    'art',          '#EC4899'),
    ('IT',           'it',           '#3B82F6'),
    ('Спорт',        'sport',        '#14B8A6'),
    ('Здоров''я',    'health',       '#EF4444'),
    ('Молодь',       'youth',        '#8B5CF6'),
    ('Культура',     'culture',      '#F97316');

-- ============================================================
--  project_tags  (N:M  projects ↔ tags)
-- ============================================================

CREATE TABLE project_tags (
    project_id UUID NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    tag_id     INT  NOT NULL REFERENCES tags (id)     ON DELETE CASCADE,

    PRIMARY KEY (project_id, tag_id)
);

COMMENT ON TABLE project_tags IS 'Теги проєктів; зв''язок projects ↔ tags';

CREATE INDEX idx_project_tags_tag ON project_tags (tag_id);

-- ============================================================
--  tasks  (завдання в межах проєкту)
--  1:N  projects → tasks
--  M:1  tasks → users (assignee, created_by)
-- ============================================================

CREATE TABLE tasks (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  UUID          NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    created_by  UUID          NOT NULL REFERENCES users (id)    ON DELETE RESTRICT,
    assignee_id UUID          REFERENCES users (id)             ON DELETE SET NULL,
    title       VARCHAR(500)  NOT NULL CHECK (LENGTH(TRIM(title)) >= 1),
    description TEXT,
    priority    task_priority NOT NULL DEFAULT 'medium',
    is_done      BOOLEAN        NOT NULL DEFAULT FALSE,
    due_date     DATE,
    completed_at TIMESTAMPTZ,
    logged_hours NUMERIC(6,2),
    price        NUMERIC(12,2),
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  tasks             IS 'Задачі (checklist) всередині проєкту';
COMMENT ON COLUMN tasks.completed_at IS 'Заповнюється автоматично при is_done = TRUE';

CREATE INDEX idx_tasks_project  ON tasks (project_id);
CREATE INDEX idx_tasks_assignee ON tasks (assignee_id);
CREATE INDEX idx_tasks_priority ON tasks (priority);
CREATE INDEX idx_tasks_done     ON tasks (project_id, is_done);

-- Авто-проставляємо completed_at при закритті задачі
CREATE OR REPLACE FUNCTION tasks_set_completed_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.is_done AND OLD.is_done IS DISTINCT FROM TRUE THEN
        NEW.completed_at = NOW();
    ELSIF NOT NEW.is_done THEN
        NEW.completed_at = NULL;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_tasks_completed_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION tasks_set_completed_at();

CREATE TRIGGER trg_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
--  activity_logs  (щоденні записи внеску)
--  М:1  projects, M:1  users
--  Один запис = один учасник, один день, один проєкт
-- ============================================================

CREATE TABLE activity_logs (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  UUID          NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    user_id     UUID          NOT NULL REFERENCES users (id)    ON DELETE CASCADE,
    log_date    DATE          NOT NULL DEFAULT CURRENT_DATE,
    hours_logged NUMERIC(5,2) NOT NULL CHECK (hours_logged > 0 AND hours_logged <= 24),
    description TEXT,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  activity_logs             IS 'Щоденний облік волонтерських годин';
COMMENT ON COLUMN activity_logs.hours_logged IS 'Кількість відпрацьованих годин за день (0.25–24)';

CREATE INDEX idx_activity_project_date ON activity_logs (project_id, log_date);
CREATE INDEX idx_activity_user_date    ON activity_logs (user_id,    log_date);

-- ============================================================
--  project_applications  (заявки на вступ)
-- ============================================================

CREATE TABLE project_applications (
    id          SERIAL             PRIMARY KEY,
    project_id  UUID               NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    user_id     UUID               NOT NULL REFERENCES users (id)    ON DELETE CASCADE,
    status      application_status NOT NULL DEFAULT 'pending',
    message     TEXT,
    reviewed_by UUID               REFERENCES users (id)             ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    applied_at  TIMESTAMPTZ        NOT NULL DEFAULT NOW(),

    UNIQUE (project_id, user_id)
);

COMMENT ON TABLE project_applications IS 'Заявки користувачів на участь у проєктах';

CREATE INDEX idx_pa_project ON project_applications (project_id);
CREATE INDEX idx_pa_user    ON project_applications (user_id);
CREATE INDEX idx_pa_status  ON project_applications (status);

-- ============================================================
--  notifications
-- ============================================================

CREATE TABLE notifications (
    id           UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID              NOT NULL REFERENCES users (id)    ON DELETE CASCADE,
    actor_id     UUID              REFERENCES users (id)             ON DELETE SET NULL,
    project_id   UUID              REFERENCES projects (id)          ON DELETE CASCADE,
    type         notification_type NOT NULL,
    is_read      BOOLEAN           NOT NULL DEFAULT FALSE,
    payload      JSONB,
    created_at   TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  notifications         IS 'Сповіщення для користувачів платформи';
COMMENT ON COLUMN notifications.payload IS 'Довільні JSON-дані для рендерингу тексту сповіщення';

CREATE INDEX idx_notif_recipient  ON notifications (recipient_id, created_at DESC);
CREATE INDEX idx_notif_unread     ON notifications (recipient_id) WHERE is_read = FALSE;
CREATE INDEX idx_notif_project    ON notifications (project_id);

-- ============================================================
--  VIEW: project_summary
--  Для карток проєктів — включає теги та кількість учасників
-- ============================================================

CREATE VIEW project_summary AS
SELECT
    p.id,
    p.title,
    p.description,
    p.icon,
    p.icon_bg,
    p.location,
    -- Derive live status from task counts; preserve terminal states.
    CASE
        WHEN p.status IN ('completed', 'archived')    THEN p.status
        WHEN ts.total_tasks > 0 AND ts.done_tasks = 0 THEN 'in_progress'
        WHEN ts.done_tasks  > 0                        THEN 'active'
        ELSE p.status
    END                                          AS status,
    ts.progress,
    ts.total_tasks,
    ts.done_tasks,
    ac.activity_count,
    p.start_date,
    p.end_date,
    p.due_date,
    p.created_by,
    pc.name                                      AS category_name,
    pc.slug                                      AS category_slug,
    u.first_name || ' ' || u.last_name           AS creator_name,
    COUNT(pm.id) FILTER (WHERE pm.is_active)     AS active_members_count,
    COALESCE(
        JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('id', t.id, 'name', t.name, 'color', t.color))
        FILTER (WHERE t.id IS NOT NULL),
        '[]'
    )                                            AS tags,
    p.created_at,
    p.updated_at
FROM  projects          p
LEFT  JOIN project_categories pc ON pc.id         = p.category_id
LEFT  JOIN users               u  ON u.id          = p.created_by
LEFT  JOIN project_members     pm ON pm.project_id = p.id
LEFT  JOIN project_tags        pt ON pt.project_id = p.id
LEFT  JOIN tags                t  ON t.id          = pt.tag_id
LEFT  JOIN LATERAL (
    SELECT
        COUNT(*)                               AS total_tasks,
        COUNT(*) FILTER (WHERE tk.is_done)     AS done_tasks,
        COALESCE(
            ROUND(
                COUNT(*) FILTER (WHERE tk.is_done) * 100.0
                / NULLIF(COUNT(*), 0)
            )::INTEGER,
            0
        )                                      AS progress
    FROM tasks tk
    WHERE tk.project_id = p.id
) ts ON TRUE
LEFT  JOIN LATERAL (
    SELECT COUNT(*) AS activity_count
    FROM   activity_logs al
    WHERE  al.project_id = p.id
) ac ON TRUE
GROUP BY
    p.id, pc.name, pc.slug, u.first_name, u.last_name,
    ts.total_tasks, ts.done_tasks, ts.progress, ac.activity_count;

COMMENT ON VIEW project_summary IS 'Зведена картка проєкту: категорія, теги, кількість учасників, live статус';

-- ============================================================
--  VIEW: user_stats
--  Агрегована статистика для профільної сторінки
-- ============================================================

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
    COALESCE(SUM(pm.hours_contributed), 0)                                   AS total_hours,
    COALESCE(SUM(pm.tasks_completed),   0)                                   AS total_tasks,
    COUNT(pm.id) FILTER (WHERE pm.is_active)                                 AS active_projects_count,
    COUNT(pm.id) FILTER (WHERE p.status = 'completed' AND pm.is_active)      AS finished_projects_count,
    COALESCE(
        (SELECT SUM(al.hours_logged) FROM activity_logs al WHERE al.user_id = u.id),
        0
    )                                                                         AS total_logged_hours
FROM  users            u
LEFT  JOIN project_members pm ON pm.user_id    = u.id
LEFT  JOIN projects        p  ON p.id          = pm.project_id
GROUP BY u.id;

COMMENT ON VIEW user_stats IS 'Агрегована статистика активності користувача для профілю';

-- ============================================================
--  password_reset_tokens
--  Одноразові токени для скидання паролю (дійсні 24 год)
-- ============================================================

-- ============================================================
--  team_members  (N:M  users → users)
--  Одна команда = один власник + довільна кількість учасників
-- ============================================================

CREATE TABLE team_members (
    owner_id   UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    member_id  UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    added_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (owner_id, member_id),
    CHECK (owner_id <> member_id)
);

COMMENT ON TABLE team_members IS 'Персональна команда користувача (owner → members)';

CREATE INDEX idx_team_owner  ON team_members (owner_id);
CREATE INDEX idx_team_member ON team_members (member_id);

-- ============================================================
--  password_reset_tokens
-- ============================================================

CREATE TABLE password_reset_tokens (
    id         SERIAL      PRIMARY KEY,
    user_id    INT         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token      TEXT        NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours',
    used_at    TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prt_token   ON password_reset_tokens (token);
CREATE INDEX idx_prt_user    ON password_reset_tokens (user_id);
