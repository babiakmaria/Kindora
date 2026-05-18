import React from 'react';
import Sidebar      from '../components/layout/Sidebar';
import Badge        from '../components/common/Badge';
import { PROJECTS } from '../data/data';
import styles       from './UserProfilePage.module.css';
import { ProjectIcon } from '../utils/projectIcon';

// hardcoded profiles for each contributor, key is their id
const USER_PROFILES = {
  1: {
    id: 1, initials: 'АК', name: 'Анна Коваль', color: '#FF6B9D',
    role: 'Організатор спільноти',
    phone: '+380 67 123 45 67', email: 'anna.koval@kindora.ua',
    city: 'Київ', country: 'Україна', joinedDate: '02.2024',
    hours: 24, tasks: 8,
    bio: 'Захоплена організатор спільноти та захисник навколишнього середовища. Займаюсь еко-проектами та розвитком громад понад 3 роки. Вірю, що разом ми можемо змінити світ на краще — один парк за раз.',
    currentProjects: [
      { id: 1, icon: '🌳', iconBg: '#EAF7F0', title: 'Відновлення міського парку', status: 'active', statusLabel: 'Активний', desc: 'Відновлення центрального парку з місцевими деревами.', progress: 72 },
      { id: 2, icon: '📚', iconBg: '#FFF0F5', title: 'Громадська бібліотека',       status: 'new',    statusLabel: 'Новий',    desc: 'Безкоштовна цифрова та фізична бібліотека для всіх.', progress: 38 },
    ],
    finishedProjects: [
      { id: 4, icon: '♻️', iconBg: '#EAF7F0', title: 'Кампанія з переробки', status: 'completed', statusLabel: 'Завершено', desc: 'Щомісячне прибирання та обізнаність про переробку.', progress: 100 },
    ],
  },
  2: {
    id: 2, initials: 'МП', name: 'Максим Петров', color: '#4CAF7D',
    role: 'Дизайнер та активіст',
    phone: '+380 50 987 65 43', email: 'maksym.petrov@kindora.ua',
    city: 'Львів', country: 'Україна', joinedDate: '03.2024',
    hours: 18, tasks: 6,
    bio: 'Дизайнер та активіст. Люблю поєднувати творчість із соціальними змінами. У своїх проектах намагаюсь зробити міське середовище красивішим та зручнішим.',
    currentProjects: [
      { id: 1, icon: '🌳', iconBg: '#EAF7F0', title: 'Відновлення міського парку', status: 'active', statusLabel: 'Активний', desc: 'Відновлення центрального парку з місцевими деревами.', progress: 72 },
    ],
    finishedProjects: [
      { id: 6, icon: '🏠', iconBg: '#EAF7F0', title: 'Притулок у мікрорайоні', status: 'completed', statusLabel: 'Завершено', desc: 'Ремонт і облаштування громадського центру.', progress: 100 },
    ],
  },
  3: {
    id: 3, initials: 'ОВ', name: 'Олена Василенко', color: '#8B5CF6',
    role: 'Еколог-волонтер',
    phone: '+380 63 555 44 33', email: 'olena.vasylenko@kindora.ua',
    city: 'Харків', country: 'Україна', joinedDate: '10.2023',
    hours: 31, tasks: 11,
    bio: 'Еколог за освітою, активіст за покликом. Спеціалізуюсь на аналізі ґрунту та відновленні міської зелені. Маю досвід у понад 10 волонтерських ініціативах по всій Україні.',
    currentProjects: [
      { id: 1, icon: '🌳', iconBg: '#EAF7F0', title: 'Відновлення міського парку',   status: 'active',      statusLabel: 'Активний',  desc: 'Відновлення центрального парку з місцевими деревами.', progress: 72 },
      { id: 3, icon: '🍳', iconBg: '#FFF8E1', title: 'Кулінарні навички для молоді', status: 'in-progress', statusLabel: 'В процесі', desc: 'Щотижневі кулінарні майстер-класи для підлітків.',     progress: 55 },
    ],
    finishedProjects: [
      { id: 4, icon: '♻️', iconBg: '#EAF7F0', title: 'Кампанія з переробки',  status: 'completed', statusLabel: 'Завершено', desc: 'Щомісячне прибирання та масова посадка дерев.',    progress: 100 },
      { id: 8, icon: '🎬', iconBg: '#EAF7F0', title: 'Громадські кіновечори', status: 'completed', statusLabel: 'Завершено', desc: 'Безкоштовні вуличні покази для мешканців міста.', progress: 100 },
    ],
  },
  4: {
    id: 4, initials: 'ДС', name: 'Дмитро Савченко', color: '#F59E0B',
    role: 'Логіст-координатор',
    phone: '+380 97 222 33 44', email: 'dmytro.savchenko@kindora.ua',
    city: 'Дніпро', country: 'Україна', joinedDate: '04.2024',
    hours: 14, tasks: 5,
    bio: 'Логіст і організатор ресурсів. Займаюсь закупівлею матеріалів та координацією постачання у волонтерських проектах. Переконаний, що грамотна логістика — запорука успіху.',
    currentProjects: [
      { id: 1, icon: '🌳', iconBg: '#EAF7F0', title: 'Відновлення міського парку', status: 'active', statusLabel: 'Активний', desc: 'Відновлення центрального парку з місцевими деревами.', progress: 72 },
    ],
    finishedProjects: [],
  },
  5: {
    id: 5, initials: 'ТК', name: 'Тетяна Клименко', color: '#06B6D4',
    role: 'Фотограф та SMM',
    phone: '+380 73 444 55 66', email: 'tetyana.klymenko@kindora.ua',
    city: 'Одеса', country: 'Україна', joinedDate: '05.2024',
    hours: 9, tasks: 3,
    bio: 'Фотограф та SMM-спеціаліст. Допомагаю проектам розповідати свої історії через фотографію та соціальні мережі. Вірю в силу візуальної комунікації для соціальних змін.',
    currentProjects: [
      { id: 1, icon: '🌳', iconBg: '#EAF7F0', title: 'Відновлення міського парку', status: 'active', statusLabel: 'Активний', desc: 'Відновлення центрального парку з місцевими деревами.', progress: 72 },
    ],
    finishedProjects: [
      { id: 8, icon: '🎬', iconBg: '#EAF7F0', title: 'Громадські кіновечори', status: 'completed', statusLabel: 'Завершено', desc: 'Документація та фото-звіт безкоштовних вуличних показів.', progress: 100 },
    ],
  },
};

const DEFAULT_PROFILE = {
  id: 0, initials: '?', name: 'Невідомий користувач', color: '#9CA3AF',
  role: 'Волонтер',
  phone: '—', email: '—', city: '—', country: 'Україна', joinedDate: '—',
  hours: 0, tasks: 0, bio: '',
  currentProjects: [], finishedProjects: [],
};


// renders one project in the list
const ProjectItem = ({ project, onNavigate }) => {
  const fullProject = PROJECTS.find((p) => p.id === project.id);
  const handleClick = () => {
    if (fullProject && onNavigate) onNavigate('project-detail', fullProject);
  };
  return (
    <div
      className={`${styles.projectItem} ${fullProject ? styles.projectItemClickable : ''}`}
      onClick={handleClick}
      role={fullProject ? 'button' : undefined}
      tabIndex={fullProject ? 0 : undefined}
      onKeyDown={(e) => { if (fullProject && (e.key === 'Enter' || e.key === ' ')) handleClick(); }}
    >
      <span className={styles.projectIcon} style={{ background: project.iconBg }}>
        <ProjectIcon name={project.icon} bg={project.iconBg} size={18} />
      </span>
      <div className={styles.projectBody}>
        <div className={styles.projectTop}>
          <span className={styles.projectTitle}>{project.title}</span>
          <Badge status={project.status} dot>{project.statusLabel}</Badge>
        </div>
        <p className={styles.projectDesc}>{project.desc}</p>
        {project.status !== 'completed' && (
          <div className={styles.progressWrap}>
            <div className="prog-bar" style={{ margin: '6px 0 0' }}>
              <div
                className="prog-fill"
                style={{
                  width: `${project.progress}%`,
                  background: project.status === 'active' ? 'var(--gr1)' : 'var(--pk1)',
                }}
              />
            </div>
            <span className={styles.progressLabel}>{project.progress}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

// a single label/value row for the about section
const AboutRow = ({ label, value }) => (
  <div className={styles.aboutRow}>
    <span className={styles.aboutLabel}>{label}</span>
    <span className={styles.aboutValue}>{value}</span>
  </div>
);


// the full page
const UserProfilePage = ({ onNavigate, user, currentUser, onLogout }) => {
  const profileId  = user?.id;
  const profile    = USER_PROFILES[profileId] ?? { ...DEFAULT_PROFILE, ...user };
  const totalProjects = profile.currentProjects.length + profile.finishedProjects.length;

  return (
    <div className="app-layout">
      <Sidebar activePage="" onNavigate={onNavigate} currentUser={currentUser} onLogout={onLogout} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <div className="main-content" style={{ padding: 0 }}>

          {/* pink banner at the top */}
          <div
            className={styles.banner}
            style={{ background: 'linear-gradient(135deg, var(--pk3) 0%, var(--pk4) 60%, var(--pk2) 100%)' }}
          >
            <button className={styles.backBtn} onClick={() => onNavigate('project-detail')}>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Назад до проєкту
            </button>

            {/* avatar pokes out of the banner */}
            <div className={styles.avatarWrap}>
              <div
                className={styles.avatar}
                style={{ background: `linear-gradient(135deg, ${profile.color}, ${profile.color}bb)` }}
                aria-label={`Аватар ${profile.name}`}
              >
                {profile.initials}
              </div>
            </div>
          </div>

          {/* everything below the banner */}
          <div className={styles.pageContent}>

            {/* card with name and contact info */}
            <div className={styles.profileCard}>
              <h1 className={styles.profileName}>{profile.name}</h1>
              {/* small chips with email, city, etc */}
              <div className={styles.contactBar}>
                <div className={styles.contactChip}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M2 5.5l6 4 6-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  {profile.email}
                </div>
                <div className={styles.contactDivider} />
                <div className={styles.contactChip}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 1.5C5.79 1.5 4 3.29 4 5.5c0 3.25 4 9 4 9s4-5.75 4-9c0-2.21-1.79-4-4-4z" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.5"/></svg>
                  {profile.city}, {profile.country}
                </div>
                <div className={styles.contactDivider} />
                <div className={styles.contactChip}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M2 6h12M6 2v4M10 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  З {profile.joinedDate}
                </div>
                <div className={styles.contactDivider} />
                <div className={styles.contactChip}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M8 5v3.5l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  {profile.hours}г відпрацьовано
                </div>
              </div>
            </div>

            {/* two cards side by side */}
            <div className={styles.infoGrid}>

              {/* stats about the user */}
              <div className="section-card" style={{ margin: 0 }}>
                <div className="section-head">
                  <div className="section-title">Про учасника</div>
                </div>
                <div className={styles.aboutRows}>
                  <AboutRow label="Місто"      value={`${profile.city}, ${profile.country}`} />
                  <AboutRow label="Годин"      value={`${profile.hours}г`} />
                  <AboutRow label="Завдань"    value={profile.tasks} />
                  <AboutRow label="Проєктів"   value={totalProjects} />
                  <AboutRow label="Учасник з"  value={profile.joinedDate} />
                </div>
              </div>

              {/* bio text */}
              <div className="section-card" style={{ margin: 0 }}>
                <div className="section-head">
                  <div className="section-title">Опис</div>
                </div>
                {profile.bio
                  ? <p className={styles.bio}>{profile.bio}</p>
                  : <p className={styles.bioEmpty}>Інформацію не вказано.</p>
                }
              </div>
            </div>

            {/* list of projects this user is part of */}
            <div className="section-card">
              <div className="section-head">
                <div className="section-title">Проєкти</div>
                <span className={styles.projectsTotal}>{totalProjects} всього</span>
              </div>

              {/* still ongoing */}
              <div className={styles.projectsGroup}>
                <div className={styles.groupHeader}>
                  <span className={styles.groupDot} style={{ background: 'var(--gr1)' }} />
                  <span className={styles.groupTitle}>Активні</span>
                  <span className={styles.groupCount}>{profile.currentProjects.length}</span>
                </div>
                {profile.currentProjects.length > 0
                  ? <div className={styles.projectsList}>{profile.currentProjects.map((p) => <ProjectItem key={p.id} project={p} onNavigate={onNavigate} />)}</div>
                  : <p className={styles.emptyText}>Немає активних проєктів.</p>
                }
              </div>

              <div className={styles.groupDivider} />

              {/* already done */}
              <div className={styles.projectsGroup}>
                <div className={styles.groupHeader}>
                  <span className={styles.groupDot} style={{ background: 'var(--text3)' }} />
                  <span className={styles.groupTitle}>Завершені</span>
                  <span className={styles.groupCount}>{profile.finishedProjects.length}</span>
                </div>
                {profile.finishedProjects.length > 0
                  ? <div className={styles.projectsList}>{profile.finishedProjects.map((p) => <ProjectItem key={p.id} project={p} onNavigate={onNavigate} />)}</div>
                  : <p className={styles.emptyText}>Завершених проєктів ще немає.</p>
                }
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
