// ── Projects ──────────────────────────────────────────────
export const PROJECTS = [
  {
    id: 1,
    icon: 'TreePine',
    iconBg: '#EAF7F0',
    title: 'Відновлення міського парку',
    desc: 'Відновлення центрального парку з місцевими деревами, еко-лавками та громадським городом.',
    status: 'active',
    statusLabel: 'Активний',
    category: 'Довкілля',
    members: 47,
    memberColors: ['#4CAF7D', '#FF6B9D', '#F59E0B', '#8B5CF6'],
    progress: 72,
    due: '15 квіт.',
    joined: true,
  },
  {
    id: 2,
    icon: 'BookOpen',
    iconBg: '#FFF0F5',
    title: 'Громадська бібліотека',
    desc: 'Безкоштовна цифрова та фізична бібліотека для кожного мешканця мікрорайону.',
    status: 'new',
    statusLabel: 'Новий',
    category: 'Освіта',
    members: 31,
    memberColors: ['#FF6B9D', '#06B6D4', '#F59E0B'],
    progress: 38,
    due: '1 трав.',
    joined: false,
  },
  {
    id: 3,
    icon: 'ChefHat',
    iconBg: '#FFF8E1',
    title: 'Кулінарні навички для молоді',
    desc: 'Щотижневі кулінарні майстер-класи для підлітків з основ харчування та практичного приготування їжі.',
    status: 'in-progress',
    statusLabel: 'В процесі',
    category: 'Соціальне',
    members: 22,
    memberColors: ['#F59E0B', '#8B5CF6', '#4CAF7D'],
    progress: 55,
    due: '30 черв.',
    joined: true,
  },
  {
    id: 4,
    icon: 'Recycle',
    iconBg: '#EAF7F0',
    title: 'Кампанія з переробки',
    desc: 'Щомісячне прибирання мікрорайону та кампанія з обізнаності про переробку для всіх вікових груп.',
    status: 'active',
    statusLabel: 'Активний',
    category: 'Довкілля',
    members: 89,
    memberColors: ['#4CAF7D', '#1A1A2E', '#FF6B9D', '#06B6D4'],
    progress: 90,
    due: '31 бер.',
    joined: false,
  },
  {
    id: 5,
    icon: 'PencilLine',
    iconBg: '#FFF0F5',
    title: 'Позашкільне репетиторство',
    desc: 'Волонтерське репетиторство для учнів початкової школи з математики та читання.',
    status: 'active',
    statusLabel: 'Активний',
    category: 'Освіта',
    members: 18,
    memberColors: ['#FF6B9D', '#4CAF7D'],
    progress: 61,
    due: '1 лип.',
    joined: false,
  },
  {
    id: 6,
    icon: 'Home',
    iconBg: '#EAF7F0',
    title: 'Притулок у мікрорайоні',
    desc: 'Відремонтувати старий громадський центр та перетворити на затишний безпечний простір для відвідувань.',
    status: 'new',
    statusLabel: 'Новий',
    category: 'Соціальне',
    members: 12,
    memberColors: ['#8B5CF6', '#F59E0B'],
    progress: 15,
    due: '1 вер.',
    joined: false,
  },
  {
    id: 7,
    icon: 'Flower2',
    iconBg: '#FFF0F5',
    title: 'Бджолиний сад на даху',
    desc: 'Перетворити невикористаний дах на бджолиний сад та майстерню для запилювачів.',
    status: 'in-progress',
    statusLabel: 'В процесі',
    category: 'Довкілля',
    members: 28,
    memberColors: ['#F59E0B', '#4CAF7D', '#FF6B9D'],
    progress: 48,
    due: '15 серп.',
    joined: false,
  },
  {
    id: 8,
    icon: 'Film',
    iconBg: '#EAF7F0',
    title: 'Громадські кіновечори',
    desc: 'Безкоштовні вуличні покази кожної першої суботи, підібрані мешканцями.',
    status: 'completed',
    statusLabel: 'Завершено',
    category: 'Культура',
    members: 104,
    memberColors: ['#06B6D4', '#FF6B9D', '#F59E0B', '#8B5CF6'],
    progress: 100,
    due: 'Завершено',
    joined: true,
  },
];

// ── Dashboard stats ──────────────────────────────────────
export const USER_STATS = [
  { label: 'Приєднано проєктів', value: '7',   change: '↑ 2 цього місяця' },
  { label: 'Витрачено годин',    value: '84',  change: '↑ 12 цього тижня' },
  { label: 'Виконано завдань',   value: '43',  change: '↑ 5 сьогодні' },
];

export const ADMIN_STATS = [
  { label: 'Всього проєктів',      value: '24',    change: '↑ 3 цього місяця',        accent: '#FF6B9D' },
  { label: 'Всього користувачів',  value: '1 284', change: '↑ 47 цього тижня',        accent: '#4CAF7D' },
  { label: 'Очікують заявки',      value: '18',    change: 'Потребує перегляду',       accent: '#F59E0B' },
  { label: 'Відсоток завершення',  value: '89%',   change: '↑ 4% до минулого місяця', accent: '#8B5CF6' },
];

// ── Admin – pending applications ─────────────────────────
export const APPLICATIONS = [
  { id: 1, initials: 'ТП', name: 'Томас Павлов',    gradient: 'linear-gradient(135deg,#8B5CF6,#06B6D4)', project: 'Відновлення міського парку', time: '2 години тому' },
  { id: 2, initials: 'ОВ', name: 'Олена Василенко', gradient: 'linear-gradient(135deg,#F59E0B,#FF6B9D)', project: 'Громадська бібліотека',        time: '5 годин тому' },
];

// ── Features for landing page ────────────────────────────
export const FEATURES = [
  { icon: 'OP', bg: '#FFF0F5', title: 'Організовуйте проєкти',      desc: 'Створюйте структуровані проєкти з цілями, термінами та командними ролями.' },
  { icon: 'JC', bg: '#EAF7F0', title: 'Приєднуйтесь і співпрацюйте', desc: 'Переглядайте відкриті ініціативи, подавайте заявки та співпрацюйте з учасниками спільноти.' },
  { icon: 'TP', bg: '#FFF8E1', title: 'Відстежуйте прогрес',         desc: 'Візуалізуйте свій внесок за допомогою дашбордів, стрічок активності та етапів.' },
  { icon: 'SN', bg: '#FFF0F5', title: 'Будьте в курсі',              desc: 'Отримуйте оновлення про важливі для вас проєкти, активність команди та події в реальному часі.' },
];

// ── User sidebar nav ─────────────────────────────────────
export const USER_NAV = [
  { label: 'Мої проєкти',   path: 'projects' },
  { label: 'Огляд',         path: 'explore' },
  { label: 'Аналітика',     path: 'admin-analytics' },
];
export const USER_NAV_BOTTOM = [
  { label: 'Сповіщення', path: 'notifications' },
];

// ── Admin sidebar nav ────────────────────────────────────
export const ADMIN_NAV = [
  { label: 'Дашборд',       path: 'admin' },
  { label: 'Всі проєкти',   path: 'admin-projects' },
  { label: 'Користувачі',   path: 'admin-users' },
  { label: 'Заявки',        path: 'admin-apps' },
];
