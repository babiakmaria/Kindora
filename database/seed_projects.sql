-- ============================================================
--  seed_projects.sql
--  Додає 6 волонтерів та 12 проєктів з повним набором даних.
--  Проєкти прив'язані до облікового запису адміністратора,
--  знайденого за email. Запускати після реєстрації в застосунку.
--
--  Запуск:
--    psql postgres://maria@localhost:5432/kindora -f database/seed_projects.sql
-- ============================================================

BEGIN;

DO $$
DECLARE
  -- ── Admin (власник всіх проєктів) ────────────────────────
  admin_id UUID;

  -- ── Волонтери ────────────────────────────────────────────
  u1 UUID := 'bbbb0001-0000-0000-0000-000000000001';
  u2 UUID := 'bbbb0001-0000-0000-0000-000000000002';
  u3 UUID := 'bbbb0001-0000-0000-0000-000000000003';
  u4 UUID := 'bbbb0001-0000-0000-0000-000000000004';
  u5 UUID := 'bbbb0001-0000-0000-0000-000000000005';
  u6 UUID := 'bbbb0001-0000-0000-0000-000000000006';

  -- ── Проєкти ──────────────────────────────────────────────
  p1  UUID := 'cccc0001-0000-0000-0000-000000000001';
  p2  UUID := 'cccc0001-0000-0000-0000-000000000002';
  p3  UUID := 'cccc0001-0000-0000-0000-000000000003';
  p4  UUID := 'cccc0001-0000-0000-0000-000000000004';
  p5  UUID := 'cccc0001-0000-0000-0000-000000000005';
  p6  UUID := 'cccc0001-0000-0000-0000-000000000006';
  p7  UUID := 'cccc0001-0000-0000-0000-000000000007';
  p8  UUID := 'cccc0001-0000-0000-0000-000000000008';
  p9  UUID := 'cccc0001-0000-0000-0000-000000000009';
  p10 UUID := 'cccc0001-0000-0000-0000-000000000010';
  p11 UUID := 'cccc0001-0000-0000-0000-000000000011';
  p12 UUID := 'cccc0001-0000-0000-0000-000000000012';

  -- ── Категорії ────────────────────────────────────────────
  cat_env     INT;
  cat_edu     INT;
  cat_social  INT;
  cat_culture INT;
  cat_health  INT;
  cat_general INT;

  -- ── Теги ─────────────────────────────────────────────────
  tag_vol  INT;
  tag_eco  INT;
  tag_edu  INT;
  tag_com  INT;
  tag_art  INT;
  tag_it   INT;
  tag_sport INT;
  tag_hlth INT;
  tag_yth  INT;
  tag_cult INT;

BEGIN

  -- ── Знайти адміна ────────────────────────────────────────
  SELECT id INTO admin_id FROM users ORDER BY joined_at LIMIT 1;
  IF admin_id IS NULL THEN
    RAISE EXCEPTION 'Не знайдено жодного користувача. Зареєструйтесь спочатку.';
  END IF;

  -- ── Категорії ────────────────────────────────────────────
  SELECT id INTO cat_env     FROM project_categories WHERE slug = 'environment';
  SELECT id INTO cat_edu     FROM project_categories WHERE slug = 'education';
  SELECT id INTO cat_social  FROM project_categories WHERE slug = 'social';
  SELECT id INTO cat_culture FROM project_categories WHERE slug = 'culture';
  SELECT id INTO cat_health  FROM project_categories WHERE slug = 'health';
  SELECT id INTO cat_general FROM project_categories WHERE slug = 'general';

  -- ── Теги ─────────────────────────────────────────────────
  SELECT id INTO tag_vol  FROM tags WHERE slug = 'volunteering';
  SELECT id INTO tag_eco  FROM tags WHERE slug = 'ecology';
  SELECT id INTO tag_edu  FROM tags WHERE slug = 'education';
  SELECT id INTO tag_com  FROM tags WHERE slug = 'community';
  SELECT id INTO tag_art  FROM tags WHERE slug = 'art';
  SELECT id INTO tag_it   FROM tags WHERE slug = 'it';
  SELECT id INTO tag_sport FROM tags WHERE slug = 'sport';
  SELECT id INTO tag_hlth FROM tags WHERE slug = 'health';
  SELECT id INTO tag_yth  FROM tags WHERE slug = 'youth';
  SELECT id INTO tag_cult FROM tags WHERE slug = 'culture';

  -- ============================================================
  --  ВОЛОНТЕРИ
  -- ============================================================

  INSERT INTO users (id, first_name, last_name, email, password_hash, phone, city, country, bio, avatar_color, system_role, profile_role, agreed_terms)
  VALUES
    (u1, 'Іван',     'Петренко',   'ivan.petrenko@kindora.test',    '$2b$10$xK9mL2nP4qR6sT8uV0wXyZaAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQ', '+380501234501', 'Київ',   'Україна', 'Захоплений екологічними ініціативами та міським озелененням. Беру участь у волонтерських акціях понад 5 років.',         '#4CAF7D', 'volunteer', 'Еколог-волонтер',         TRUE),
    (u2, 'Оксана',   'Мельник',    'oksana.melnyk@kindora.test',    '$2b$10$xK9mL2nP4qR6sT8uV0wXyZaAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQ', '+380502234502', 'Київ',   'Україна', 'Вчителька з досвідом організації освітніх заходів. Люблю навчати дітей та людей похилого віку цифровим навичкам.',         '#FF6B9D', 'volunteer', 'Педагог-волонтер',        TRUE),
    (u3, 'Дмитро',   'Ковальчук',  'dmytro.kovalchuk@kindora.test', '$2b$10$xK9mL2nP4qR6sT8uV0wXyZaAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQ', '+380503234503', 'Львів',  'Україна', 'Fullstack розробник. Допомагаю некомерційним організаціям з цифровою трансформацією та автоматизацією процесів.',          '#F59E0B', 'volunteer', 'IT-спеціаліст',           TRUE),
    (u4, 'Наталія',  'Бондаренко', 'natalia.bondarenko@kindora.test','$2b$10$xK9mL2nP4qR6sT8uV0wXyZaAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQ', '+380504234504', 'Харків', 'Україна', 'Медична сестра. Організую безкоштовні медичні консультації для мешканців віддалених районів та ветеранів.',               '#8B5CF6', 'volunteer', 'Медичний волонтер',       TRUE),
    (u5, 'Андрій',   'Шевченко',   'andriy.shevchenko@kindora.test', '$2b$10$xK9mL2nP4qR6sT8uV0wXyZaAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQ', '+380505234505', 'Одеса',  'Україна', 'Художник і муралист. Прикрашаю міські простори та організовую культурні заходи для підняття духу громади.',                '#06B6D4', 'volunteer', 'Митець-волонтер',         TRUE),
    (u6, 'Юлія',     'Іванова',    'yuliia.ivanova@kindora.test',   '$2b$10$xK9mL2nP4qR6sT8uV0wXyZaAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQ', '+380506234506', 'Київ',   'Україна', 'Психолог та соціальний працівник. Підтримую вразливі групи населення та допомагаю ветеранам адаптуватися до мирного життя.', '#EF4444', 'volunteer', 'Соціальний працівник',   TRUE)
  ON CONFLICT (id) DO NOTHING;

  -- Навички волонтерів
  INSERT INTO user_skills (user_id, name, level_pct, color) VALUES
    (u1, 'Екологія',         90, '#4CAF7D'), (u1, 'Організація заходів', 75, '#34D399'), (u1, 'Фізична праця',      85, '#6B7280'),
    (u2, 'Педагогіка',       95, '#FF6B9D'), (u2, 'Цифрові навички',     80, '#6366F1'), (u2, 'Комунікація',        90, '#F59E0B'),
    (u3, 'JavaScript',        95, '#F59E0B'), (u3, 'Python',              85, '#3B82F6'), (u3, 'Менеджмент проєктів',70, '#8B5CF6'),
    (u4, 'Медицина',          90, '#8B5CF6'), (u4, 'Перша допомога',      95, '#EF4444'), (u4, 'Психологія',         65, '#06B6D4'),
    (u5, 'Живопис',           95, '#06B6D4'), (u5, 'Графічний дизайн',   85, '#EC4899'), (u5, 'Фотографія',         80, '#F97316'),
    (u6, 'Психологія',        90, '#EF4444'), (u6, 'Соціальна робота',   95, '#8B5CF6'), (u6, 'Медіація',            75, '#4CAF7D')
  ON CONFLICT (user_id, name) DO NOTHING;

  -- ============================================================
  --  ПРОЄКТИ
  -- ============================================================

  INSERT INTO projects (id, title, description, icon, icon_bg, status, category_id, start_date, end_date, due_date, created_by, created_at)
  VALUES
    -- 1. Чисте місто (Довкілля, active, 75%)
    (p1,  'Чисте місто',
     'Масштабна кампанія з прибирання та озеленення міських районів. Включає встановлення нових урн, висадку дерев і кущів, очищення водойм та просвітницьку роботу з мешканцями.',
     'Leaf', '#EAF7F0', 'active', cat_env,
     NOW() - INTERVAL '3 months', NOW() + INTERVAL '1 month', NOW() + INTERVAL '3 weeks', admin_id, NOW() - INTERVAL '3 months'),

    -- 2. Цифрова грамотність для пенсіонерів (Освіта, active, 60%)
    (p2,  'Цифрова грамотність для пенсіонерів',
     'Безкоштовні курси роботи зі смартфоном, інтернетом та держпослугами онлайн для людей похилого віку. Заняття проходять двічі на тиждень у районних бібліотеках.',
     'BookOpen', '#FFF0F5', 'active', cat_edu,
     NOW() - INTERVAL '2 months', NOW() + INTERVAL '2 months', NOW() + INTERVAL '6 weeks', admin_id, NOW() - INTERVAL '2 months'),

    -- 3. Молодіжний спортивний центр (Соціальне, in_progress → view compute, 20%)
    (p3,  'Молодіжний спортивний центр',
     'Облаштування занедбаного майданчика у повноцінний спортивний простір для підлітків: баскетбольний кошик, турнік, зона для воркауту та лавки. Мета — зменшити підліткову безпритульність.',
     'Dumbbell', '#FFF8E1', 'active', cat_social,
     NOW() - INTERVAL '6 weeks', NOW() + INTERVAL '6 weeks', NOW() + INTERVAL '5 weeks', admin_id, NOW() - INTERVAL '6 weeks'),

    -- 4. Фестиваль вуличного мистецтва (Культура, completed, 100%)
    (p4,  'Фестиваль вуличного мистецтва',
     'Триденний фестиваль з муралами, живими виставками, перформансами та майстер-класами з графіті. Залучили 14 митців з різних міст України, розфарбували 8 брандмауерів.',
     'Palette', '#FFF0F5', 'completed', cat_culture,
     NOW() - INTERVAL '4 months', NOW() - INTERVAL '2 months', NOW() - INTERVAL '2 months', admin_id, NOW() - INTERVAL '4 months'),

    -- 5. Медичний патруль (Здоров'я, active, 50%)
    (p5,  'Медичний патруль',
     'Виїзні безкоштовні медичні огляди у малозабезпечені райони міста та прилеглі села. Надаємо консультації терапевта, кардіолога та психолога, роздаємо ліки першої необхідності.',
     'HeartPulse', '#FFF0F5', 'active', cat_health,
     NOW() - INTERVAL '10 weeks', NOW() + INTERVAL '2 months', NOW() + INTERVAL '7 weeks', admin_id, NOW() - INTERVAL '10 weeks'),

    -- 6. Відновлення шкільного стадіону (Загальне, in_progress view-wise)
    (p6,  'Відновлення шкільного стадіону',
     'Ремонт та відновлення шкільного стадіону у ЗОШ №47: нове покриття бігових доріжок, фарбування розміток, встановлення нових воріт та трибуни. Роботи фінансуються з донатів батьків та волонтерів.',
     'Trophy', '#EAF7F0', 'active', cat_general,
     NOW() - INTERVAL '2 weeks', NOW() + INTERVAL '2 months', NOW() + INTERVAL '8 weeks', admin_id, NOW() - INTERVAL '2 weeks'),

    -- 7. Благодійний ярмарок (Культура, active, 80%)
    (p7,  'Благодійний ярмарок',
     'Щорічний благодійний ярмарок handmade виробів, куштування домашньої їжі та розваги для дітей. Весь прибуток спрямовується на допомогу дітям з онкологічними захворюваннями.',
     'ShoppingBag', '#FFF8E1', 'active', cat_culture,
     NOW() - INTERVAL '5 weeks', NOW() + INTERVAL '1 week', NOW() + INTERVAL '5 days', admin_id, NOW() - INTERVAL '5 weeks'),

    -- 8. Літній дитячий табір (Освіта, in_progress, 40%)
    (p8,  'Літній дитячий табір',
     'Безкоштовний денний табір для дітей ВПО (внутрішньо переміщених осіб) 7–14 років. Програма включає творчі майстерні, спорт, екскурсії та психологічну підтримку.',
     'Sun', '#FFFBEA', 'active', cat_edu,
     NOW() - INTERVAL '4 weeks', NOW() + INTERVAL '4 weeks', NOW() + INTERVAL '3 weeks', admin_id, NOW() - INTERVAL '4 weeks'),

    -- 9. Еко-маршрут у Голосіївському лісі (Довкілля, active, 66%)
    (p9,  'Еко-маршрут у Голосіївському лісі',
     'Облаштування пішохідного маршруту довжиною 4 км: встановлення інформаційних стендів про флору та фауну, нових лавок і смітників, прибирання сміття вздовж стежки.',
     'TreePine', '#EAF7F0', 'active', cat_env,
     NOW() - INTERVAL '7 weeks', NOW() + INTERVAL '3 weeks', NOW() + INTERVAL '2 weeks', admin_id, NOW() - INTERVAL '7 weeks'),

    -- 10. Допомога ветеранам (Соціальне, active, 57%)
    (p10, 'Допомога ветеранам',
     'Комплексна підтримка ветеранів: юридична допомога у вирішенні житлових питань, психологічні консультації, навчання нової професії, допомога у пошуку роботи та соціальна адаптація.',
     'Shield', '#EAF7F0', 'active', cat_social,
     NOW() - INTERVAL '12 weeks', NOW() + INTERVAL '3 months', NOW() + INTERVAL '10 weeks', admin_id, NOW() - INTERVAL '12 weeks'),

    -- 11. IT-майстерня для молоді (Освіта, in_progress view-wise)
    (p11, 'IT-майстерня для молоді',
     'Безкоштовний 3-місячний курс з основ веб-розробки для молоді 16–25 років з малозабезпечених родин. Викладають практикуючі розробники-волонтери. Після курсу — допомога з першим працевлаштуванням.',
     'Code', '#EEF2FF', 'active', cat_edu,
     NOW() - INTERVAL '1 week', NOW() + INTERVAL '3 months', NOW() + INTERVAL '12 weeks', admin_id, NOW() - INTERVAL '1 week'),

    -- 12. Прибирання річкового берега (Довкілля, active, 33%)
    (p12, 'Прибирання річкового берега',
     'Систематичне прибирання берегів річки Либідь. Збираємо пластик, скло та великогабаритне сміття, встановлюємо таблички із забороною смітити, садимо прибережні рослини для зміцнення берега.',
     'Waves', '#EAF7F0', 'active', cat_env,
     NOW() - INTERVAL '5 weeks', NOW() + INTERVAL '5 weeks', NOW() + INTERVAL '4 weeks', admin_id, NOW() - INTERVAL '5 weeks')
  ON CONFLICT (id) DO NOTHING;

  -- ============================================================
  --  УЧАСНИКИ ПРОЄКТІВ
  -- ============================================================

  INSERT INTO project_members (project_id, user_id, role, is_active, joined_at) VALUES
    -- p1: Чисте місто
    (p1, admin_id, 'owner',       TRUE, NOW() - INTERVAL '3 months'),
    (p1, u1,       'contributor', TRUE, NOW() - INTERVAL '3 months'),
    (p1, u2,       'contributor', TRUE, NOW() - INTERVAL '10 weeks'),
    (p1, u5,       'contributor', TRUE, NOW() - INTERVAL '8 weeks'),
    (p1, u6,       'contributor', TRUE, NOW() - INTERVAL '6 weeks'),

    -- p2: Цифрова грамотність
    (p2, admin_id, 'owner',       TRUE, NOW() - INTERVAL '2 months'),
    (p2, u2,       'contributor', TRUE, NOW() - INTERVAL '2 months'),
    (p2, u3,       'contributor', TRUE, NOW() - INTERVAL '7 weeks'),
    (p2, u6,       'contributor', TRUE, NOW() - INTERVAL '5 weeks'),

    -- p3: Молодіжний спортивний центр
    (p3, admin_id, 'owner',       TRUE, NOW() - INTERVAL '6 weeks'),
    (p3, u1,       'contributor', TRUE, NOW() - INTERVAL '6 weeks'),
    (p3, u5,       'contributor', TRUE, NOW() - INTERVAL '5 weeks'),

    -- p4: Фестиваль вуличного мистецтва (completed)
    (p4, admin_id, 'owner',       TRUE, NOW() - INTERVAL '4 months'),
    (p4, u5,       'contributor', TRUE, NOW() - INTERVAL '4 months'),
    (p4, u2,       'contributor', TRUE, NOW() - INTERVAL '4 months'),
    (p4, u3,       'contributor', TRUE, NOW() - INTERVAL '14 weeks'),

    -- p5: Медичний патруль
    (p5, admin_id, 'owner',       TRUE, NOW() - INTERVAL '10 weeks'),
    (p5, u4,       'contributor', TRUE, NOW() - INTERVAL '10 weeks'),
    (p5, u6,       'contributor', TRUE, NOW() - INTERVAL '9 weeks'),
    (p5, u2,       'contributor', TRUE, NOW() - INTERVAL '8 weeks'),
    (p5, u1,       'contributor', TRUE, NOW() - INTERVAL '7 weeks'),

    -- p6: Відновлення стадіону
    (p6, admin_id, 'owner',       TRUE, NOW() - INTERVAL '2 weeks'),
    (p6, u1,       'contributor', TRUE, NOW() - INTERVAL '2 weeks'),
    (p6, u3,       'contributor', TRUE, NOW() - INTERVAL '10 days'),

    -- p7: Благодійний ярмарок
    (p7, admin_id, 'owner',       TRUE, NOW() - INTERVAL '5 weeks'),
    (p7, u2,       'contributor', TRUE, NOW() - INTERVAL '5 weeks'),
    (p7, u5,       'contributor', TRUE, NOW() - INTERVAL '4 weeks'),
    (p7, u6,       'contributor', TRUE, NOW() - INTERVAL '4 weeks'),

    -- p8: Дитячий табір
    (p8, admin_id, 'owner',       TRUE, NOW() - INTERVAL '4 weeks'),
    (p8, u2,       'contributor', TRUE, NOW() - INTERVAL '4 weeks'),
    (p8, u4,       'contributor', TRUE, NOW() - INTERVAL '3 weeks'),
    (p8, u6,       'contributor', TRUE, NOW() - INTERVAL '3 weeks'),
    (p8, u5,       'contributor', TRUE, NOW() - INTERVAL '2 weeks'),

    -- p9: Еко-маршрут
    (p9, admin_id, 'owner',       TRUE, NOW() - INTERVAL '7 weeks'),
    (p9, u1,       'contributor', TRUE, NOW() - INTERVAL '7 weeks'),
    (p9, u3,       'contributor', TRUE, NOW() - INTERVAL '6 weeks'),

    -- p10: Допомога ветеранам
    (p10, admin_id, 'owner',       TRUE, NOW() - INTERVAL '12 weeks'),
    (p10, u4,       'contributor', TRUE, NOW() - INTERVAL '12 weeks'),
    (p10, u6,       'contributor', TRUE, NOW() - INTERVAL '11 weeks'),
    (p10, u3,       'contributor', TRUE, NOW() - INTERVAL '10 weeks'),
    (p10, u2,       'contributor', TRUE, NOW() - INTERVAL '8 weeks'),
    (p10, u1,       'contributor', TRUE, NOW() - INTERVAL '6 weeks'),

    -- p11: IT-майстерня
    (p11, admin_id, 'owner',       TRUE, NOW() - INTERVAL '1 week'),
    (p11, u3,       'contributor', TRUE, NOW() - INTERVAL '1 week'),

    -- p12: Прибирання берега
    (p12, admin_id, 'owner',       TRUE, NOW() - INTERVAL '5 weeks'),
    (p12, u1,       'contributor', TRUE, NOW() - INTERVAL '5 weeks'),
    (p12, u5,       'contributor', TRUE, NOW() - INTERVAL '4 weeks'),
    (p12, u6,       'contributor', TRUE, NOW() - INTERVAL '3 weeks')
  ON CONFLICT (project_id, user_id) DO NOTHING;

  -- ============================================================
  --  ЗАВДАННЯ
  --  Статус: is_done + completed_at задані явно для сіду.
  --  Для виконаних завдань — completed_at у минулому.
  --  logged_hours і price — для більшості виконаних завдань.
  -- ============================================================

  -- ── p1: Чисте місто (8 завдань, 6 виконано) ──────────────
  INSERT INTO tasks (project_id, created_by, assignee_id, title, priority, is_done, completed_at, logged_hours, price)
  VALUES
    (p1, admin_id, u1,       'Картографування зон прибирання',                  'high',   TRUE,  NOW() - INTERVAL '11 weeks', 4.0,  NULL),
    (p1, admin_id, admin_id, 'Закупівля інвентарю (рукавиці, мішки, граблі)',   'high',   TRUE,  NOW() - INTERVAL '10 weeks', 3.5,  4800.00),
    (p1, admin_id, u2,       'Акція прибирання — парк Шевченка',                'high',   TRUE,  NOW() - INTERVAL '9 weeks',  8.0,  NULL),
    (p1, admin_id, u5,       'Висадка 50 саджанців каштану',                    'medium', TRUE,  NOW() - INTERVAL '7 weeks',  6.0,  3200.00),
    (p1, admin_id, u6,       'Встановлення 12 нових урн',                       'medium', TRUE,  NOW() - INTERVAL '5 weeks',  5.0,  7500.00),
    (p1, admin_id, u1,       'Очищення озера Вирлиця від сміття',               'high',   TRUE,  NOW() - INTERVAL '3 weeks',  10.0, NULL),
    (p1, admin_id, admin_id, 'Інформаційна кампанія "Чисте місто — наш вибір"', 'medium', FALSE, NULL,                         NULL, NULL),
    (p1, admin_id, u5,       'Фотозвіт та публікація в соцмережах',             'low',    FALSE, NULL,                         NULL, NULL);

  -- ── p2: Цифрова грамотність (5 завдань, 3 виконано) ──────
  INSERT INTO tasks (project_id, created_by, assignee_id, title, priority, is_done, completed_at, logged_hours, price)
  VALUES
    (p2, admin_id, u2,       'Розробка навчальної програми (8 занять)',        'high',   TRUE,  NOW() - INTERVAL '7 weeks',  12.0, NULL),
    (p2, admin_id, u3,       'Підготовка методичних матеріалів та роздаток',   'medium', TRUE,  NOW() - INTERVAL '6 weeks',  8.0,  1200.00),
    (p2, admin_id, u2,       'Проведення занять — Бібліотека №12 (4 сесії)',   'high',   TRUE,  NOW() - INTERVAL '2 weeks',  16.0, NULL),
    (p2, admin_id, u6,       'Проведення занять — Бібліотека №7 (4 сесії)',    'high',   FALSE, NULL,                         NULL, NULL),
    (p2, admin_id, u3,       'Розробка тестів для перевірки знань',            'low',    FALSE, NULL,                         NULL, NULL);

  -- ── p3: Молодіжний центр (5 завдань, 1 виконано) ─────────
  INSERT INTO tasks (project_id, created_by, assignee_id, title, priority, is_done, completed_at, logged_hours, price)
  VALUES
    (p3, admin_id, u1,       'Дозвіл від районної адміністрації',    'high',   TRUE,  NOW() - INTERVAL '4 weeks',  3.0,  NULL),
    (p3, admin_id, admin_id, 'Закупівля будівельних матеріалів',      'high',   FALSE, NULL,                         NULL, 18500.00),
    (p3, admin_id, u1,       'Демонтаж старого покриття майданчика',  'high',   FALSE, NULL,                         NULL, NULL),
    (p3, admin_id, u5,       'Монтаж спортивного обладнання',         'medium', FALSE, NULL,                         NULL, NULL),
    (p3, admin_id, admin_id, 'Урочисте відкриття і прес-реліз',      'low',    FALSE, NULL,                         NULL, NULL);

  -- ── p4: Фестиваль мистецтва (6 завдань, всі виконано) ────
  INSERT INTO tasks (project_id, created_by, assignee_id, title, priority, is_done, completed_at, logged_hours, price)
  VALUES
    (p4, admin_id, admin_id, 'Пошук та затвердження локацій',              'high',   TRUE, NOW() - INTERVAL '14 weeks', 6.0,  NULL),
    (p4, admin_id, u3,       'Залучення 14 митців та підписання угод',      'high',   TRUE, NOW() - INTERVAL '13 weeks', 8.0,  NULL),
    (p4, admin_id, u5,       'Розробка 8 ескізів муралів',                  'high',   TRUE, NOW() - INTERVAL '11 weeks', 40.0, NULL),
    (p4, admin_id, u5,       'Нанесення муралів на брандмауери',            'high',   TRUE, NOW() - INTERVAL '8 weeks',  80.0, 24000.00),
    (p4, admin_id, u2,       'Організація майстер-класів і перформансів',   'medium', TRUE, NOW() - INTERVAL '8 weeks',  12.0, 3500.00),
    (p4, admin_id, u3,       'Медіа-покриття та звіт для спонсорів',        'medium', TRUE, NOW() - INTERVAL '7 weeks',  10.0, NULL);

  -- ── p5: Медичний патруль (6 завдань, 3 виконано) ─────────
  INSERT INTO tasks (project_id, created_by, assignee_id, title, priority, is_done, completed_at, logged_hours, price)
  VALUES
    (p5, admin_id, u4,       'Координація з лікарями-волонтерами (12 осіб)',  'high',   TRUE,  NOW() - INTERVAL '9 weeks',  5.0,  NULL),
    (p5, admin_id, admin_id, 'Закупівля медикаментів та витратних матеріалів','high',   TRUE,  NOW() - INTERVAL '8 weeks',  3.0,  9800.00),
    (p5, admin_id, u4,       'Виїзд #1 — с. Гатне (82 пацієнти)',            'high',   TRUE,  NOW() - INTERVAL '6 weeks',  14.0, NULL),
    (p5, admin_id, u4,       'Виїзд #2 — Дарницький район (110 пацієнтів)',  'high',   FALSE, NULL,                         NULL, NULL),
    (p5, admin_id, u6,       'Психологічні консультації для ветеранів (3 сесії)','medium',FALSE,NULL,                        NULL, NULL),
    (p5, admin_id, u2,       'Освітній захід "Власне здоров\'я — власна відповідальність"','low',FALSE,NULL,                NULL, NULL);

  -- ── p6: Шкільний стадіон (5 завдань, 1 виконано) ─────────
  INSERT INTO tasks (project_id, created_by, assignee_id, title, priority, is_done, completed_at, logged_hours, price)
  VALUES
    (p6, admin_id, u3,       'Технічний огляд та кошторис ремонту',   'high',   TRUE,  NOW() - INTERVAL '10 days', 4.0,  NULL),
    (p6, admin_id, admin_id, 'Збір коштів від батьків і спонсорів',   'high',   FALSE, NULL,                        NULL, NULL),
    (p6, admin_id, u1,       'Закупівля матеріалів для бігових доріжок','high', FALSE, NULL,                        NULL, 32000.00),
    (p6, admin_id, u1,       'Ремонт покриття та розмітка поля',       'high',   FALSE, NULL,                        NULL, NULL),
    (p6, admin_id, admin_id, 'Встановлення воріт та трибуни',          'medium', FALSE, NULL,                        NULL, 15000.00);

  -- ── p7: Благодійний ярмарок (5 завдань, 4 виконано) ─────
  INSERT INTO tasks (project_id, created_by, assignee_id, title, priority, is_done, completed_at, logged_hours, price)
  VALUES
    (p7, admin_id, admin_id, 'Оренда майданчика та дозволи',                          'high',   TRUE,  NOW() - INTERVAL '4 weeks',  3.0,  2800.00),
    (p7, admin_id, u2,       'Залучення 35 майстрів-продавців',                        'high',   TRUE,  NOW() - INTERVAL '3 weeks',  6.0,  NULL),
    (p7, admin_id, u5,       'Оформлення локації: банери, стенди, прапорці',           'medium', TRUE,  NOW() - INTERVAL '2 weeks',  8.0,  4200.00),
    (p7, admin_id, u6,       'Дитяча зона: аніматори, конкурси, частування',           'medium', TRUE,  NOW() - INTERVAL '5 days',  10.0, 3600.00),
    (p7, admin_id, admin_id, 'Фінансовий звіт та передача коштів до лікарні',          'high',   FALSE, NULL,                        NULL, NULL);

  -- ── p8: Дитячий табір (5 завдань, 2 виконано) ────────────
  INSERT INTO tasks (project_id, created_by, assignee_id, title, priority, is_done, completed_at, logged_hours, price)
  VALUES
    (p8, admin_id, admin_id, 'Реєстрація 45 дітей та збір медичних довідок',     'high',   TRUE,  NOW() - INTERVAL '3 weeks',  6.0,  NULL),
    (p8, admin_id, u2,       'Розробка щотижневої програми (творчість, спорт)',   'high',   TRUE,  NOW() - INTERVAL '3 weeks',  10.0, NULL),
    (p8, admin_id, u4,       'Закупівля матеріалів для творчих майстерень',       'medium', FALSE, NULL,                        NULL, 5500.00),
    (p8, admin_id, u6,       'Психологічні заняття — групи підтримки (щотижня)', 'high',   FALSE, NULL,                        NULL, NULL),
    (p8, admin_id, u5,       'Майстер-клас з малювання та ліплення',             'low',    FALSE, NULL,                        NULL, NULL);

  -- ── p9: Еко-маршрут (3 завдання, 2 виконано) ─────────────
  INSERT INTO tasks (project_id, created_by, assignee_id, title, priority, is_done, completed_at, logged_hours, price)
  VALUES
    (p9, admin_id, u1,       'Проектування маршруту та розробка карти',             'high',   TRUE,  NOW() - INTERVAL '6 weeks',  8.0,  NULL),
    (p9, admin_id, u3,       'Виготовлення та встановлення 10 інформаційних стендів','high', TRUE,  NOW() - INTERVAL '3 weeks',  12.0, 8400.00),
    (p9, admin_id, u1,       'Прибирання та висадка рослин вздовж маршруту',        'medium',FALSE, NULL,                        NULL, NULL);

  -- ── p10: Допомога ветеранам (7 завдань, 4 виконано) ──────
  INSERT INTO tasks (project_id, created_by, assignee_id, title, priority, is_done, completed_at, logged_hours, price)
  VALUES
    (p10, admin_id, u6,       'Відкриття та реєстрація 38 учасників',              'high',   TRUE,  NOW() - INTERVAL '11 weeks', 4.0,  NULL),
    (p10, admin_id, u4,       'Медичні огляди та направлення до спеціалістів',     'high',   TRUE,  NOW() - INTERVAL '9 weeks',  16.0, NULL),
    (p10, admin_id, u3,       'Юридичні консультації щодо виплат і пільг',         'high',   TRUE,  NOW() - INTERVAL '7 weeks',  12.0, NULL),
    (p10, admin_id, u6,       'Тренінг "Відновлення після стресу" (10 занять)',     'high',   TRUE,  NOW() - INTERVAL '4 weeks',  20.0, NULL),
    (p10, admin_id, u3,       'Курс перекваліфікації: Excel та Word для початківців','medium',FALSE, NULL,                        NULL, NULL),
    (p10, admin_id, admin_id, 'Ярмарок вакансій для ветеранів',                    'medium', FALSE, NULL,                        NULL, NULL),
    (p10, admin_id, u6,       'Звіт для МОН та партнерських фондів',               'low',    FALSE, NULL,                        NULL, NULL);

  -- ── p11: IT-майстерня (3 завдання, 0 виконано) ───────────
  INSERT INTO tasks (project_id, created_by, assignee_id, title, priority, is_done, completed_at, logged_hours, price)
  VALUES
    (p11, admin_id, u3,       'Розробка навчального плану (HTML, CSS, JS)',  'high',   FALSE, NULL, NULL, NULL),
    (p11, admin_id, admin_id, 'Відбір та реєстрація 20 учасників',           'high',   FALSE, NULL, NULL, NULL),
    (p11, admin_id, u3,       'Підготовка ноутбуків та хмарного середовища', 'medium', FALSE, NULL, NULL, 6000.00);

  -- ── p12: Прибирання берега (3 завдання, 1 виконано) ──────
  INSERT INTO tasks (project_id, created_by, assignee_id, title, priority, is_done, completed_at, logged_hours, price)
  VALUES
    (p12, admin_id, u1,       'Перше прибирання: зібрано 2.4 тонни сміття',    'high',   TRUE,  NOW() - INTERVAL '4 weeks',  12.0, NULL),
    (p12, admin_id, admin_id, 'Закупівля контейнерів та вивезення відходів',   'high',   FALSE, NULL,                        NULL, 4200.00),
    (p12, admin_id, u5,       'Висадка 80 прибережних рослин (верба, очерет)', 'medium', FALSE, NULL,                        NULL, 2800.00);

  -- ============================================================
  --  ТЕГИ ПРОЄКТІВ
  -- ============================================================

  INSERT INTO project_tags (project_id, tag_id) VALUES
    (p1,  tag_vol), (p1,  tag_eco), (p1,  tag_com),
    (p2,  tag_edu), (p2,  tag_com), (p2,  tag_yth),
    (p3,  tag_sport),(p3, tag_yth), (p3,  tag_com),
    (p4,  tag_art), (p4,  tag_cult),(p4,  tag_com),
    (p5,  tag_hlth),(p5,  tag_vol), (p5,  tag_com),
    (p6,  tag_sport),(p6, tag_com),
    (p7,  tag_art), (p7,  tag_com), (p7,  tag_vol),
    (p8,  tag_edu), (p8,  tag_yth), (p8,  tag_hlth),
    (p9,  tag_eco), (p9,  tag_vol),
    (p10, tag_vol), (p10, tag_hlth),(p10, tag_com),
    (p11, tag_it),  (p11, tag_edu), (p11, tag_yth),
    (p12, tag_eco), (p12, tag_vol)
  ON CONFLICT DO NOTHING;

  -- ============================================================
  --  ЛОГИ АКТИВНОСТІ (activity_logs)
  --  Записи за останні 6–10 тижнів для активних проєктів.
  -- ============================================================

  -- p1: Чисте місто — інтенсивна активність
  INSERT INTO activity_logs (project_id, user_id, log_date, hours_logged, description) VALUES
    (p1, admin_id, CURRENT_DATE - 55, 4.0, 'Картографування районів прибирання'),
    (p1, u1,       CURRENT_DATE - 55, 4.0, 'Обхід та фіксація проблемних ділянок'),
    (p1, admin_id, CURRENT_DATE - 48, 3.5, 'Закупівля інвентарю'),
    (p1, u2,       CURRENT_DATE - 41, 8.0, 'Акція прибирання — парк Шевченка'),
    (p1, u1,       CURRENT_DATE - 41, 8.0, 'Акція прибирання — парк Шевченка'),
    (p1, u5,       CURRENT_DATE - 41, 6.0, 'Акція прибирання — парк Шевченка'),
    (p1, u6,       CURRENT_DATE - 41, 5.0, 'Акція прибирання — парк Шевченка'),
    (p1, u5,       CURRENT_DATE - 34, 6.0, 'Висадка саджанців каштану'),
    (p1, u1,       CURRENT_DATE - 34, 5.0, 'Підготовка ямок під дерева'),
    (p1, u1,       CURRENT_DATE - 25, 7.0, 'Встановлення урн по вулиці Хрещатик'),
    (p1, admin_id, CURRENT_DATE - 25, 3.0, 'Координація встановлення урн'),
    (p1, u1,       CURRENT_DATE - 18, 10.0,'Прибирання берега озера Вирлиця'),
    (p1, u6,       CURRENT_DATE - 18, 8.0, 'Прибирання берега озера Вирлиця'),
    (p1, u5,       CURRENT_DATE - 18, 8.0, 'Прибирання берега озера Вирлиця'),
    (p1, admin_id, CURRENT_DATE - 4,  2.5, 'Підготовка звіту по акціям'),
    (p1, u2,       CURRENT_DATE - 2,  3.0, 'Дописи в соцмережах та PR');

  -- p2: Цифрова грамотність
  INSERT INTO activity_logs (project_id, user_id, log_date, hours_logged, description) VALUES
    (p2, u2,       CURRENT_DATE - 47, 12.0, 'Розробка навчальної програми'),
    (p2, u3,       CURRENT_DATE - 40, 8.0,  'Підготовка роздаткових матеріалів'),
    (p2, u2,       CURRENT_DATE - 28, 4.0,  'Заняття у бібліотеці №12 (група 1)'),
    (p2, u2,       CURRENT_DATE - 21, 4.0,  'Заняття у бібліотеці №12 (група 2)'),
    (p2, u2,       CURRENT_DATE - 14, 4.0,  'Заняття у бібліотеці №12 (група 3)'),
    (p2, u6,       CURRENT_DATE - 14, 4.0,  'Заняття у бібліотеці №7 (група 1)'),
    (p2, u2,       CURRENT_DATE - 7,  4.0,  'Заняття у бібліотеці №12 (група 4)'),
    (p2, admin_id, CURRENT_DATE - 3,  2.0,  'Координація розкладу занять');

  -- p5: Медичний патруль
  INSERT INTO activity_logs (project_id, user_id, log_date, hours_logged, description) VALUES
    (p5, u4,       CURRENT_DATE - 62, 5.0,  'Залучення лікарів-волонтерів'),
    (p5, admin_id, CURRENT_DATE - 55, 3.0,  'Закупівля медикаментів'),
    (p5, u4,       CURRENT_DATE - 40, 14.0, 'Виїзд до с. Гатне — огляд пацієнтів'),
    (p5, u6,       CURRENT_DATE - 40, 12.0, 'Виїзд до с. Гатне — реєстрація та записи'),
    (p5, u2,       CURRENT_DATE - 40, 8.0,  'Виїзд до с. Гатне — просвіта'),
    (p5, u1,       CURRENT_DATE - 40, 8.0,  'Виїзд до с. Гатне — логістика'),
    (p5, admin_id, CURRENT_DATE - 10, 2.0,  'Планування виїзду #2'),
    (p5, u4,       CURRENT_DATE - 3,  3.0,  'Підготовка медичного оснащення');

  -- p7: Благодійний ярмарок
  INSERT INTO activity_logs (project_id, user_id, log_date, hours_logged, description) VALUES
    (p7, admin_id, CURRENT_DATE - 35, 3.0,  'Оформлення дозволів і оренда'),
    (p7, u2,       CURRENT_DATE - 28, 6.0,  'Залучення майстрів-продавців'),
    (p7, u5,       CURRENT_DATE - 14, 8.0,  'Оформлення локації та банерів'),
    (p7, admin_id, CURRENT_DATE - 14, 4.0,  'Координація оформлення'),
    (p7, u6,       CURRENT_DATE - 5,  10.0, 'Дитяча зона та аніматори'),
    (p7, u2,       CURRENT_DATE - 5,  8.0,  'Управління торговими рядами'),
    (p7, u5,       CURRENT_DATE - 5,  7.0,  'Оформлення, фото- та відеозйомка'),
    (p7, admin_id, CURRENT_DATE - 5,  6.0,  'Організація та фінансовий облік');

  -- p9: Еко-маршрут
  INSERT INTO activity_logs (project_id, user_id, log_date, hours_logged, description) VALUES
    (p9, u1,       CURRENT_DATE - 45, 8.0,  'Проектування маршруту на місцевості'),
    (p9, admin_id, CURRENT_DATE - 45, 4.0,  'Узгодження з адміністрацією парку'),
    (p9, u3,       CURRENT_DATE - 22, 12.0, 'Виготовлення інформаційних стендів'),
    (p9, u1,       CURRENT_DATE - 15, 6.0,  'Встановлення стендів та лавок'),
    (p9, u3,       CURRENT_DATE - 15, 4.0,  'Допомога з монтажем'),
    (p9, admin_id, CURRENT_DATE - 8,  2.0,  'Перевірка та документація');

  -- p10: Допомога ветеранам
  INSERT INTO activity_logs (project_id, user_id, log_date, hours_logged, description) VALUES
    (p10, u6,      CURRENT_DATE - 76, 4.0,  'Відкриття центру та реєстрація'),
    (p10, admin_id,CURRENT_DATE - 76, 4.0,  'Організація відкриття'),
    (p10, u4,      CURRENT_DATE - 63, 16.0, 'Медичні огляди (38 учасників)'),
    (p10, u6,      CURRENT_DATE - 63, 8.0,  'Психологічне анкетування'),
    (p10, u3,      CURRENT_DATE - 49, 12.0, 'Юридичні консультації — пільги і виплати'),
    (p10, u6,      CURRENT_DATE - 35, 4.0,  'Тренінг "Відновлення після стресу" #1'),
    (p10, u6,      CURRENT_DATE - 28, 4.0,  'Тренінг "Відновлення після стресу" #2'),
    (p10, u6,      CURRENT_DATE - 21, 4.0,  'Тренінг "Відновлення після стресу" #3'),
    (p10, u6,      CURRENT_DATE - 14, 4.0,  'Тренінг "Відновлення після стресу" #4'),
    (p10, u4,      CURRENT_DATE - 7,  3.0,  'Повторні консультації — направлення'),
    (p10, admin_id,CURRENT_DATE - 2,  3.0,  'Підготовка звіту для МОН');

  -- p12: Прибирання берега
  INSERT INTO activity_logs (project_id, user_id, log_date, hours_logged, description) VALUES
    (p12, u1,       CURRENT_DATE - 28, 12.0, 'Перше велике прибирання берега'),
    (p12, u5,       CURRENT_DATE - 28, 10.0, 'Перше велике прибирання берега'),
    (p12, u6,       CURRENT_DATE - 28, 8.0,  'Перше велике прибирання берега'),
    (p12, admin_id, CURRENT_DATE - 28, 6.0,  'Організація та фіксація результатів'),
    (p12, admin_id, CURRENT_DATE - 5,  2.0,  'Координація вивезення сміттєвих контейнерів');

  -- ============================================================
  --  ЗАЯВКИ НА УЧАСТЬ (project_applications)
  -- ============================================================

  INSERT INTO project_applications (project_id, user_id, status, message, applied_at) VALUES
    -- Активні заявки (pending)
    (p1,  u3, 'pending',  'Хочу допомогти з картографуванням та GPS-трекінгом зон прибирання. Маю досвід роботи з ГІС-системами.', NOW() - INTERVAL '3 days'),
    (p5,  u5, 'pending',  'Готовий допомагати з організацією та документуванням виїздів. Маю власне авто для перевезення обладнання.', NOW() - INTERVAL '5 days'),
    (p8,  u3, 'pending',  'Хочу проводити IT-майстер-класи для дітей: Scratch, основи програмування у форматі гри.', NOW() - INTERVAL '2 days'),
    (p10, u5, 'pending',  'Готовий проводити арт-терапевтичні заняття для ветеранів — це доведений метод реабілітації.', NOW() - INTERVAL '7 days'),
    -- Схвалені заявки
    (p2,  u4, 'approved', 'Хочу долучитися до навчання — можу проводити заняття з охорони здоров\'я онлайн для пенсіонерів.', NOW() - INTERVAL '4 weeks'),
    (p9,  u4, 'approved', 'Можу допомогти з ботанічними описами для інформаційних стендів.', NOW() - INTERVAL '5 weeks'),
    -- Відхилені
    (p4,  u4, 'rejected', 'Хочу долучитися до організації фестивалю.', NOW() - INTERVAL '13 weeks')
  ON CONFLICT (project_id, user_id) DO NOTHING;

  -- ============================================================
  --  СПОВІЩЕННЯ (notifications)
  -- ============================================================

  INSERT INTO notifications (recipient_id, actor_id, project_id, type, is_read, payload, created_at) VALUES
    (admin_id, u1, p1,  'user_joined',        FALSE, '{"project_title":"Чисте місто"}',                              NOW() - INTERVAL '3 months'),
    (admin_id, u3, p1,  'contribution_added', FALSE, '{"project_title":"Чисте місто","hours":4}',                    NOW() - INTERVAL '3 days'),
    (admin_id, u5, p5,  'user_joined',        FALSE, '{"project_title":"Медичний патруль"}',                         NOW() - INTERVAL '5 days'),
    (admin_id, u3, p8,  'user_joined',        FALSE, '{"project_title":"Літній дитячий табір"}',                     NOW() - INTERVAL '2 days'),
    (admin_id, u5, p10, 'user_joined',        FALSE, '{"project_title":"Допомога ветеранам"}',                       NOW() - INTERVAL '7 days'),
    (u1, admin_id, p1,  'task_assigned',      TRUE,  '{"task_title":"Очищення озера Вирлиця","project_title":"Чисте місто"}', NOW() - INTERVAL '3 weeks'),
    (u4, admin_id, p5,  'task_assigned',      TRUE,  '{"task_title":"Виїзд #2","project_title":"Медичний патруль"}', NOW() - INTERVAL '2 weeks'),
    (u2, admin_id, p7,  'project_updated',    TRUE,  '{"project_title":"Благодійний ярмарок","field":"status"}',     NOW() - INTERVAL '1 week');

  RAISE NOTICE 'Seed завершено. Додано 12 проєктів, 6 волонтерів та повний набір даних.';

END $$;

COMMIT;
