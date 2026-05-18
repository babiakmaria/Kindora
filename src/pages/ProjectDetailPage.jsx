import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import styles  from './ProjectDetailPage.module.css';
import { fetchTasks, createTask, updateTask, deleteTask, fetchProjectMembers, searchUsers, addProjectMember, removeProjectMember, fetchCalendar } from '../api/tasks';
import { ProjectIcon } from '../utils/projectIcon';

// Mock contributors (active on this project — also used by calendar lookups)
const CONTRIBUTORS = [
  { id: 1, initials: 'АК', name: 'Анна Коваль',       color: '#FF6B9D', hours: 24, tasks: 8  },
  { id: 2, initials: 'МП', name: 'Максим Петров',     color: '#4CAF7D', hours: 18, tasks: 6  },
  { id: 3, initials: 'ОВ', name: 'Олена Василенко',   color: '#8B5CF6', hours: 31, tasks: 11 },
  { id: 4, initials: 'ДС', name: 'Дмитро Савченко',   color: '#F59E0B', hours: 14, tasks: 5  },
  { id: 5, initials: 'ТК', name: 'Тетяна Клименко',   color: '#06B6D4', hours: 9,  tasks: 3  },
];


// Todos
const INITIAL_TODOS = [
  { id: 1,  title: 'Скласти план дій',         assigneeId: 1, done: true,  priority: 'high'   },
  { id: 2,  title: 'Зустріч з командою',       assigneeId: 2, done: true,  priority: 'medium' },
  { id: 3,  title: 'Підготувати інструменти',  assigneeId: 4, done: true,  priority: 'low'    },
  { id: 4,  title: 'Посадка дерев (сектор А)', assigneeId: 1, done: true,  priority: 'high'   },
  { id: 5,  title: 'Встановлення лавок',       assigneeId: 3, done: false, priority: 'high'   },
  { id: 6,  title: 'Облаштування городу',      assigneeId: 2, done: false, priority: 'medium' },
  { id: 7,  title: 'Посадка кущів',            assigneeId: 5, done: false, priority: 'medium' },
  { id: 8,  title: 'Фінальний звіт',           assigneeId: 1, done: false, priority: 'high'   },
  { id: 9,  title: 'Фото-документація',        assigneeId: 5, done: false, priority: 'low'    },
  { id: 10, title: 'Прес-реліз',               assigneeId: 3, done: false, priority: 'low'    },
];

// Helpers
const MONTH_UA   = ['Січень','Лютий','Березень','Квітень','Травень','Червень','Липень','Серпень','Вересень','Жовтень','Листопад','Грудень'];
const DAY_UA     = ['Пн','Вт','Ср','Чт','Пт','Сб','Нд'];
const PRIORITY   = { high: { color: '#FF6B9D', bg: '#FFF0F5', label: 'Важливо' }, medium: { color: '#F59E0B', bg: '#FFF8E1', label: 'Середній' }, low: { color: '#4CAF7D', bg: '#EAF7F0', label: 'Низький' } };

// Predefined project tags grouped by category
const PREDEFINED_TAGS = [
  {
    group: 'Сфера діяльності',
    tags: [
      'гуманітарна допомога', 'медицина', 'екологія та природа', 'зоозахист',
      'допомога армії', 'освіта та тренінги', 'діти та молодь',
      'допомога літнім людям', 'культура та мистецтво',
      'цифрове волонтерство', 'психологічна підтримка', 'відбудова та ремонт',
    ],
  },
  {
    group: 'Тип зайнятості',
    tags: [
      'онлайн', 'офлайн', 'довгостроковий проєкт',
      'гнучкий графік', 'вихідні дні', 'вечірній час', 'терміново',
    ],
  },
  {
    group: 'Навички / Спеціалізація',
    tags: [
      'водій / логістика', 'переклад мов', 'копірайтинг та SMM',
      'фото та відео', 'IT розробка', 'юридична допомога',
      'фінанси та бухгалтерія', 'кулінарія та кетеринг', 'фізична праця',
    ],
  },
];

const padDate      = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const daysInMonth  = (y, m)    => new Date(y, m + 1, 0).getDate();
const firstWeekday = (y, m)    => { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; };

// Format integer minutes → Ukrainian short string: 120→"2г", 90→"1г 30хв", 45→"45хв", 0→"0хв"
const formatMinutes = (totalMin) => {
  if (!totalMin || totalMin <= 0) return '0хв';
  if (totalMin < 60) return `${totalMin}хв`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m > 0 ? `${h}г ${m}хв` : `${h}г`;
};

// API shape → UI shape mappers
const mapTask = (t) => ({
  id:          t.id,
  title:       t.title,
  assigneeId:  t.assignee_id || null,
  done:        t.is_done,
  priority:    t.priority || 'medium',
  loggedHours: t.logged_hours ? Number(t.logged_hours) : null,
  price:       t.price       ? Number(t.price)        : null,
});

// e.g. 0.5 → "30хв",  1.5 → "1г 30хв",  2 → "2г"
const formatTrackedTime = (hours) => {
  if (!hours || hours <= 0) return null;
  const totalMin = Math.round(hours * 60);
  if (totalMin < 1) return null;
  if (totalMin < 60) return `${totalMin}хв`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m > 0 ? `${h}г ${m}хв` : `${h}г`;
};

const mapMember = (m) => ({
  id:       m.id,
  name:     `${m.first_name || ''} ${m.last_name || ''}`.trim(),
  initials: `${(m.first_name || '')[0] || ''}${(m.last_name || '')[0] || ''}`.toUpperCase() || '??',
  color:    m.avatar_color || '#6B7280',
  hours:    Number(m.hours_contributed) || 0,
  tasks:    Number(m.tasks_completed)   || 0,
});

// Sub-components

// Contributor avatar with tooltip
const ContribAvatar = ({ contributor, size = 36, onNavigate }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={styles.contribWrap}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={styles.contribAvatar}
        style={{
          background: contributor.color,
          width: size,
          height: size,
          fontSize: size * 0.36,
          cursor: onNavigate ? 'pointer' : 'default',
        }}
        onClick={() => onNavigate && onNavigate('user-profile', contributor)}
        role={onNavigate ? 'button' : undefined}
        tabIndex={onNavigate ? 0 : undefined}
        aria-label={onNavigate ? `Переглянути профіль ${contributor.name}` : undefined}
        onKeyDown={(e) => { if (onNavigate && (e.key === 'Enter' || e.key === ' ')) onNavigate('user-profile', contributor); }}
      >
        {contributor.initials}
      </div>
      {hovered && (
        <div className={styles.tooltip}>
          <div className={styles.tooltipName}>{contributor.name}</div>
          <div className={styles.tooltipMeta}>{contributor.hours}г · {contributor.tasks} завдань</div>
          {onNavigate && <div className={styles.tooltipHint}>Натисніть для перегляду профілю</div>}
        </div>
      )}
    </div>
  );
};

// Single calendar day cell — controlled, no local popup
const DayCell = ({ day, dateStr, entries, isToday, isPast, isSelected, onSelect }) => {
  const hasActivity = entries && entries.length > 0;

  return (
    <div
      className={[
        styles.dayCell,
        isToday     ? styles.today    : '',
        isPast      ? styles.pastDay  : '',
        hasActivity ? styles.activeDay : '',
        isSelected  ? styles.selected  : '',
      ].join(' ')}
      onClick={() => hasActivity && onSelect(isSelected ? null : dateStr)}
    >
      <div className={styles.dayNum}>{day}</div>

      {hasActivity && (
        <>
          <div className={styles.dotRow}>
            {entries.slice(0, 4).map((e, i) => (
              <div
                key={i}
                className={styles.contribDot}
                style={{ background: e.color }}
                title={e.name}
              />
            ))}
            {entries.length > 4 && (
              <span className={styles.moreCount}>+{entries.length - 4}</span>
            )}
          </div>

          {(() => {
            const dayMinutes = entries.reduce((s, e) => s + (e.totalMinutes || 0), 0);
            const dayPrice   = entries.reduce((s, e) => s + (e.totalPrice   || 0), 0);
            return (
              <div className={styles.daySummary}>
                {dayMinutes > 0 && (
                  <span className={styles.timeBadge}>{formatMinutes(dayMinutes)}</span>
                )}
                {dayPrice > 0 && (
                  <span className={styles.priceBadge}>₴{dayPrice.toLocaleString('uk-UA')}</span>
                )}
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
};

// Day detail panel — rendered below the grid, never inside a cell
const DayDetailPanel = ({ dateStr, entries, onClose }) => {
  const date       = new Date(dateStr + 'T00:00:00');
  const label      = `${date.getDate()} ${MONTH_UA[date.getMonth()]} ${date.getFullYear()}`;
  const totalMin   = entries.reduce((sum, e) => sum + (e.totalMinutes || 0), 0);
  const totalPrice = entries.reduce((sum, e) => sum + (e.totalPrice   || 0), 0);

  return (
    <div className={styles.dayDetail}>
      <div className={styles.dayDetailHeader}>
        <div className={styles.dayDetailTitle}>
          <span className={styles.dayDetailDate}>{label}</span>
          <span className={styles.dayDetailSummary}>
            {entries.length} {entries.length === 1 ? 'учасник' : entries.length < 5 ? 'учасники' : 'учасників'}
            {totalMin   > 0 && ` · ${formatMinutes(totalMin)} загалом`}
            {totalPrice > 0 && ` · ₴${totalPrice.toLocaleString('uk-UA')}`}
          </span>
        </div>
        <button className={styles.dayDetailClose} onClick={onClose} aria-label="Закрити">×</button>
      </div>

      <div className={styles.dayDetailEntries}>
        {entries.map((entry, i) => (
          <div key={i} className={styles.dayDetailEntry}>
            <div className={styles.detailAvatar} style={{ background: entry.color }}>
              {entry.initials}
            </div>
            <div className={styles.detailInfo}>
              <div className={styles.detailName}>{entry.name}</div>
              <div className={styles.detailTasks}>
                {entry.tasks.map((t, j) => (
                  <span key={j} className={styles.detailTask}>{t}</span>
                ))}
              </div>
            </div>
            <div className={styles.detailMeta}>
              {entry.totalMinutes > 0 && (
                <span className={styles.detailTime}>{formatMinutes(entry.totalMinutes)}</span>
              )}
              {entry.totalPrice > 0 && (
                <span className={styles.detailPrice}>₴{entry.totalPrice.toLocaleString('uk-UA')}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Time-tracking popup ──────────────────────────────────────
const TimeTrackingPopup = ({ task, onConfirm, onCancel }) => {
  const [value, setValue]   = useState('');
  const [unit,  setUnit]    = useState('minutes');
  const [error, setError]   = useState('');
  const inputRef            = useRef(null);

  useEffect(() => {
    // Focus input when popup opens
    setTimeout(() => inputRef.current?.focus(), 50);

    // Escape closes
    const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const computeHours = () => {
    const n = parseFloat(value);
    if (!value || isNaN(n) || n <= 0) return null;
    return unit === 'minutes' ? +(n / 60).toFixed(4) : n;
  };

  const handleConfirm = () => {
    const hours = computeHours();
    if (value) {
      // Value was entered — validate it
      const n = parseFloat(value);
      if (isNaN(n) || n <= 0) { setError('Введіть коректне число'); return; }
      const maxVal = unit === 'minutes' ? 1440 : 24;
      if (n > maxVal) { setError(`Максимум ${maxVal} ${unit === 'minutes' ? 'хвилин' : 'годин'}`); return; }
    }
    onConfirm(hours); // null if no time entered
  };

  const handleSkip = () => onConfirm(null);

  return (
    <div className={styles.timePopupOverlay} onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className={styles.timePopup}>
        {/* Header */}
        <div className={styles.timePopupHeader}>
          <span className={styles.timePopupIcon}>⏱</span>
          <div>
            <div className={styles.timePopupHeading}>Трекінг часу</div>
            <div className={styles.timePopupTaskName} title={task.title}>{task.title}</div>
          </div>
          <button className={styles.timePopupClose} onClick={onCancel} aria-label="Закрити">×</button>
        </div>

        {/* Time input */}
        <div className={styles.addFormRow} style={{ marginTop: 14 }}>
          <span className={styles.addFormLabel}>Витрачений час <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(необов'язково)</span></span>
          <div className={styles.timeInputRow}>
            <input
              ref={inputRef}
              type="number"
              min="1"
              step="1"
              className={styles.timeInput}
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm(); }}
              placeholder="0"
            />
            <div className={styles.unitToggle}>
              <button
                type="button"
                className={`${styles.unitBtn} ${unit === 'minutes' ? styles.unitBtnActive : ''}`}
                onClick={() => setUnit('minutes')}
              >хв</button>
              <button
                type="button"
                className={`${styles.unitBtn} ${unit === 'hours' ? styles.unitBtnActive : ''}`}
                onClick={() => setUnit('hours')}
              >год</button>
            </div>
          </div>
          {error && <p className={styles.timeError}>{error}</p>}
        </div>

        {/* Actions */}
        <div className={styles.timePopupActions}>
          <button type="button" className={styles.addFormCancel} onClick={onCancel}>
            Скасувати
          </button>
          <button type="button" className={styles.skipBtn} onClick={handleSkip}>
            Без трекінгу
          </button>
          <button type="button" className={styles.addFormConfirm} onClick={handleConfirm}>
            Підтвердити
          </button>
        </div>
      </div>
    </div>
  );
};

// Todo item
const TodoItem = ({ todo, onToggle, onDelete, members = [], disabled = false }) => {
  const assignee = members.find((m) => m.id === todo.assigneeId) || null;
  const p        = PRIORITY[todo.priority] || PRIORITY.medium;
  return (
    <div className={`${styles.todoItem} ${todo.done ? styles.todoDone : ''} ${disabled ? styles.todoDisabled : ''}`}>
      <button
        className={`${styles.checkbox} ${todo.done ? styles.checkboxDone : ''}`}
        onClick={() => !disabled && onToggle && onToggle(todo.id)}
        disabled={disabled}
        aria-label="Позначити виконаним"
      >
        {todo.done && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      <div className={styles.todoBody}>
        <div className={styles.todoTitleRow}>
          <span className={styles.todoTitle}>{todo.title}</span>
          {todo.done && formatTrackedTime(todo.loggedHours) && (
            <span className={styles.todoTimeTag}>
              ⏱ {formatTrackedTime(todo.loggedHours)}
            </span>
          )}
        </div>
        <div className={styles.todoMeta}>
          {assignee && (
            <div className={styles.todoAssignee}>
              <div className={styles.todoAva} style={{ background: assignee.color }}>
                {assignee.initials}
              </div>
              <span>{assignee.name.split(' ')[0]}</span>
            </div>
          )}
          <span className={styles.priorityTag} style={{ color: p.color, background: p.bg }}>
            {p.label}
          </span>
          {todo.price > 0 && (
            <span className={styles.todoPriceTag}>
              ₴ {todo.price.toLocaleString('uk-UA')}
            </span>
          )}
        </div>
      </div>

      {onDelete && (
        <button
          className={styles.todoDelete}
          onClick={(e) => { e.stopPropagation(); onDelete(todo.id); }}
          aria-label="Видалити задачу"
          title="Видалити"
        >
          ×
        </button>
      )}
    </div>
  );
};

// Main page
const ProjectDetailPage = ({ onNavigate, project, fromPage, currentUser, onLogout, onUpdateProject, onSyncProject, onDeleteProject }) => {
  const proj = project ?? {
    icon: '🌳', iconBg: '#EAF7F0',
    title: 'Відновлення міського парку',
    desc:  'Відновлення центрального парку з місцевими деревами, еко-лавками та громадським городом.',
    status: 'active', statusLabel: 'Активний',
    category: 'Довкілля', progress: 72, due: '15 квіт.',
  };

  const projectId = proj.id || null;
  const isAdmin   = currentUser?.system_role === 'admin';
  const isOwner   = currentUser?.id != null && currentUser.id === proj.createdBy;

  const today0         = new Date();
  const [year,          setYear]          = useState(today0.getFullYear());
  const [month,         setMonth]         = useState(today0.getMonth()); // 0-based
  const [selectedDate,  setSelectedDate]  = useState(null);
  const [calendarData,  setCalendarData]  = useState({});
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [todos,         setTodos]         = useState([]);
  const [members,       setMembers]       = useState([]);
  const [tasksLoading,  setTasksLoading]  = useState(false);
  const [taskError,     setTaskError]     = useState('');
  const [isCompleted,   setIsCompleted]   = useState(proj.status === 'completed');

  // Delete confirmation dialog
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Time-tracking popup
  const [completingTask, setCompletingTask] = useState(null); // { id, title } | null
  const [trackValue,     setTrackValue]     = useState('');   // raw input
  const [trackUnit,      setTrackUnit]      = useState('hours'); // 'hours' | 'minutes'
  const [trackPrice,     setTrackPrice]     = useState('');   // optional price in UAH
  const [completing,     setCompleting]     = useState(false);

  // Inline add-todo form state
  const [addingTodo,      setAddingTodo]      = useState(false);
  const [draftTitle,      setDraftTitle]      = useState('');
  const [draftAssigneeId, setDraftAssigneeId] = useState('');
  const [draftPriority,   setDraftPriority]   = useState('medium');
  const [draftPrice,      setDraftPrice]      = useState('');

  // Load tasks + members from API when project is known; fall back to mock otherwise
  useEffect(() => {
    if (!projectId) {
      setTodos(INITIAL_TODOS);
      setMembers(CONTRIBUTORS.map(mapMember));
      return;
    }
    setTasksLoading(true);
    setTaskError('');
    Promise.all([
      fetchTasks(projectId).catch(() => null),
      fetchProjectMembers(projectId).catch(() => null),
    ]).then(([rawTasks, rawMembers]) => {
      if (rawTasks)   setTodos(rawTasks.map(mapTask));
      else            setTodos(INITIAL_TODOS);
      if (rawMembers) setMembers(rawMembers.map(mapMember));
      else            setMembers(CONTRIBUTORS.map(mapMember));
    }).finally(() => setTasksLoading(false));
  }, [projectId]);

  // Fetch calendar data whenever projectId, year or month changes
  useEffect(() => {
    if (!projectId) { setCalendarData({}); return; }
    setCalendarLoading(true);
    fetchCalendar(projectId, year, month + 1) // month + 1: API uses 1-based months
      .then((data) => setCalendarData(data || {}))
      .catch(() => setCalendarData({}))
      .finally(() => setCalendarLoading(false));
  }, [projectId, year, month]);

  // Tags state — seeded from the project object so they survive navigation
  const [tags,         setTags]         = useState(() => proj.tags?.length ? proj.tags : []);
  const [tagPopupOpen, setTagPopupOpen] = useState(false);
  const tagPopupRef = useRef(null);
  const tagAddBtnRef = useRef(null);

  const removeTag = (tag) => setTags((prev) => prev.filter((t) => t !== tag));
  const toggleTag = (tag) => setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);

  // Close tag popup on outside click
  useEffect(() => {
    if (!tagPopupOpen) return;
    const handler = (e) => {
      if (
        tagPopupRef.current  && !tagPopupRef.current.contains(e.target) &&
        tagAddBtnRef.current && !tagAddBtnRef.current.contains(e.target)
      ) setTagPopupOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [tagPopupOpen]);

  // Contributor popover state
  const [contribPopupOpen,  setContribPopupOpen]  = useState(false);
  const [contribSearch,     setContribSearch]     = useState('');
  const [searchResults,     setSearchResults]     = useState([]);
  const [searchLoading,     setSearchLoading]     = useState(false);
  const [memberError,       setMemberError]       = useState('');

  const popupRef  = useRef(null);
  const addBtnRef = useRef(null);

  // Close popup on outside click
  useEffect(() => {
    if (!contribPopupOpen) return;
    const handler = (e) => {
      if (
        popupRef.current  && !popupRef.current.contains(e.target) &&
        addBtnRef.current && !addBtnRef.current.contains(e.target)
      ) {
        setContribPopupOpen(false);
        setContribSearch('');
        setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [contribPopupOpen]);

  // Debounced user search — fires 300 ms after the user stops typing
  useEffect(() => {
    const q = contribSearch.trim();
    if (q.length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const rows = await searchUsers(q);
        setSearchResults(rows.map(mapMember));
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [contribSearch]);

  // Whether a user is already a member of this project
  const isMemberOf = (userId) => members.some((m) => m.id === userId);

  // Add or remove a member via API (optimistic update, revert on error)
  const toggleMember = async (person) => {
    if (!projectId) return;
    setMemberError('');
    if (isMemberOf(person.id)) {
      // Optimistic remove
      setMembers((prev) => prev.filter((m) => m.id !== person.id));
      try {
        await removeProjectMember(projectId, person.id);
      } catch (err) {
        setMembers((prev) => [...prev, person]); // revert
        setMemberError(err.message || 'Не вдалося видалити учасника');
      }
    } else {
      // Optimistic add
      setMembers((prev) => [...prev, person]);
      try {
        await addProjectMember(projectId, person.id);
      } catch (err) {
        setMembers((prev) => prev.filter((m) => m.id !== person.id)); // revert
        setMemberError(err.message || 'Не вдалося додати учасника');
      }
    }
  };

  const prevMonth = () => { setSelectedDate(null); if (month === 0) { setMonth(11); setYear((y) => y - 1); } else setMonth((m) => m - 1); };
  const nextMonth = () => { setSelectedDate(null); if (month === 11) { setMonth(0); setYear((y) => y + 1); } else setMonth((m) => m + 1); };

  const toggleTodo = (id) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    if (!todo.done) {
      // Open time-tracking popup instead of completing immediately
      setCompletingTask({ id: todo.id, title: todo.title });
      setTrackValue('');
      setTrackUnit('hours');
      setTrackPrice('');
      return;
    }

    // Already done → uncomplete directly, no popup
    handleUncomplete(id, todo);
  };

  const handleUncomplete = async (id, todo) => {
    setTodos((prev) => prev.map((t) => t.id === id ? { ...t, done: false } : t));
    if (!projectId) return;
    try {
      await updateTask(projectId, id, { is_done: false });
      // Refresh calendar so the dot disappears from the cell immediately
      fetchCalendar(projectId, year, month + 1)
        .then((data) => setCalendarData(data || {}))
        .catch(() => {});
    } catch {
      setTodos((prev) => prev.map((t) => t.id === id ? { ...t, done: true } : t));
    }
  };

  // Confirm popup — complete with optional time
  const handleCompleteConfirm = async () => {
    if (!completingTask) return;
    const { id, title } = completingTask;

    const rawVal = parseFloat(trackValue);
    const hoursToLog = rawVal > 0
      ? (trackUnit === 'minutes' ? +(rawVal / 60).toFixed(4) : rawVal)
      : null;

    const priceToLog = trackPrice && parseFloat(trackPrice) > 0 ? parseFloat(trackPrice) : null;

    // Optimistic update + close popup immediately
    setTodos((prev) => prev.map((t) =>
      t.id === id ? { ...t, done: true, loggedHours: hoursToLog, ...(priceToLog !== null ? { price: priceToLog } : {}) } : t
    ));
    setCompletingTask(null);

    if (!projectId) return;

    setCompleting(true);
    try {
      await updateTask(projectId, id, {
        is_done: true,
        ...(hoursToLog  !== null ? { hours_logged: hoursToLog } : {}),
        ...(priceToLog  !== null ? { price: priceToLog }        : {}),
      });
      // Refresh calendar so the completed task appears on today's cell immediately
      if (projectId) {
        fetchCalendar(projectId, year, month + 1)
          .then((data) => setCalendarData(data || {}))
          .catch(() => {});
      }
    } catch (err) {
      setTodos((prev) => prev.map((t) => t.id === id ? { ...t, done: false } : t));
      setTaskError(err.message || 'Помилка завершення задачі');
    } finally {
      setCompleting(false);
    }
  };

  // Cancel — close popup, task stays unchanged
  const handleCompleteCancel = () => setCompletingTask(null);

  // Complete project — mark as 'completed' via API, disable task editing
  const handleCompleteProject = async () => {
    setIsCompleted(true);
    if (!projectId || !onUpdateProject) return;
    try {
      await onUpdateProject(projectId, { status: 'completed' });
    } catch (err) {
      console.error('Не вдалося завершити проєкт:', err.message);
      setIsCompleted(false);
    }
  };

  const handleDeleteTodo = async (id) => {
    // Optimistic removal
    setTodos((prev) => prev.filter((t) => t.id !== id));
    if (!projectId) return;
    try {
      await deleteTask(projectId, id);
    } catch (err) {
      // Restore on failure (re-fetch to be safe)
      fetchTasks(projectId).then((rows) => setTodos(rows.map(mapTask))).catch(() => {});
    }
  };

  const openAddForm = () => {
    setDraftTitle('');
    setDraftAssigneeId(members[0]?.id || '');
    setDraftPriority('medium');
    setDraftPrice('');
    setTaskError('');
    setAddingTodo(true);
  };

  const cancelAdd = () => { setAddingTodo(false); setTaskError(''); setDraftPrice(''); };

  const handleAddTodo = async () => {
    if (!draftTitle.trim()) return;
    setTaskError('');

    if (!projectId) {
      // Mock mode (no real project loaded yet)
      setTodos((prev) => [
        ...prev,
        { id: String(Date.now()), title: draftTitle.trim(), assigneeId: draftAssigneeId || null, done: false, priority: draftPriority, price: draftPrice ? Number(draftPrice) : null },
      ]);
      setAddingTodo(false);
      return;
    }

    try {
      const created = await createTask(projectId, {
        title:       draftTitle.trim(),
        assignee_id: draftAssigneeId || null,
        priority:    draftPriority,
        price:       draftPrice ? Number(draftPrice) : null,
      });
      const parsedPrice = draftPrice ? Number(draftPrice) : null;
      setTodos((prev) => [...prev, { ...mapTask(created), price: parsedPrice }]);
      setAddingTodo(false);
    } catch (err) {
      setTaskError(err.message || 'Не вдалося створити задачу');
    }
  };

  const doneCount    = todos.filter((t) => t.done).length;
  const totalTodos   = todos.length;
  const todoProgress = totalTodos > 0 ? Math.round((doneCount / totalTodos) * 100) : 0;

  // Push tag changes back up to App state so they survive navigation
  useEffect(() => {
    if (!projectId || !onSyncProject) return;
    onSyncProject(projectId, { tags });
  }, [tags]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep project card progress + status in sync with the live task list
  useEffect(() => {
    if (!projectId || !onSyncProject || isCompleted) return;
    let derivedStatus = null;
    let derivedLabel  = null;
    if (totalTodos > 0 && doneCount === 0) {
      derivedStatus = 'in_progress';
      derivedLabel  = 'В процесі';
    } else if (doneCount > 0) {
      derivedStatus = 'active';
      derivedLabel  = 'Активний';
    }
    onSyncProject(projectId, {
      progress: todoProgress,
      ...(derivedStatus ? { status: derivedStatus, statusLabel: derivedLabel } : {}),
    });
  }, [todoProgress, doneCount, totalTodos, projectId, isCompleted]); // eslint-disable-line react-hooks/exhaustive-deps

  // Build calendar grid
  const totalDays = daysInMonth(year, month);
  const startDay  = firstWeekday(year, month);
  const today     = new Date();
  const cells     = [];

  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) {
    const dateStr  = padDate(year, month, d);
    const isToday  = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
    const isPast   = new Date(year, month, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    cells.push({ day: d, dateStr, entries: calendarData[dateStr] || null, isToday, isPast });
  }

  return (
    <div className="app-layout">
      <Sidebar activePage="projects" onNavigate={onNavigate} currentUser={currentUser} onLogout={onLogout} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className={styles.pageBody}>

          {/* ── Header ─────────────────────────────────── */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <button
                className={styles.backBtn}
                onClick={() => onNavigate(fromPage || 'projects')}
              >
                ← Назад
              </button>

              <div className={styles.projectMeta}>
                <div className={styles.projectIcon} style={{ background: proj.iconBg }}>
                  <ProjectIcon name={proj.icon} bg={proj.iconBg} size={22} />
                </div>
                <div>
                  <div className={styles.projectTitleRow}>
                    <div className={styles.projectTitle}>{proj.title}</div>
                    {isOwner && (
                      <button
                        className={styles.deleteBtn}
                        onClick={() => setShowDeleteConfirm(true)}
                        title="Видалити проєкт"
                      >
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                          <path d="M2 3.5h9M5 3.5V2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M5.5 6v3.5M7.5 6v3.5M2.5 3.5l.5 7a.5.5 0 00.5.5h5a.5.5 0 00.5-.5l.5-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Видалити
                      </button>
                    )}
                  </div>
                  <div className={styles.projectDesc}>{proj.desc}</div>

                  {/* tags row */}
                  <div className={styles.tagsRow}>
                    {tags.map((tag) => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                        {isOwner && (
                          <button className={styles.tagRemove} onClick={() => removeTag(tag)} title="Видалити тег">×</button>
                        )}
                      </span>
                    ))}

                    {isOwner && (
                      <div className={styles.tagPickerWrap}>
                        <button
                          ref={tagAddBtnRef}
                          className={`${styles.tagAdd} ${tagPopupOpen ? styles.tagAddActive : ''}`}
                          onClick={() => setTagPopupOpen((v) => !v)}
                          title="Додати тег"
                        >+</button>

                        {tagPopupOpen && (
                          <div ref={tagPopupRef} className={styles.tagPopup}>
                            {PREDEFINED_TAGS.map(({ group, tags: groupTags }) => (
                              <div key={group} className={styles.tagGroup}>
                                <div className={styles.tagGroupLabel}>{group}</div>
                                <div className={styles.tagGroupList}>
                                  {groupTags.map((t) => {
                                    const active = tags.includes(t);
                                    return (
                                      <button
                                        key={t}
                                        className={`${styles.tagOption} ${active ? styles.tagOptionActive : ''}`}
                                        onClick={() => toggleTag(t)}
                                      >
                                        {active && (
                                          <svg width="9" height="7" viewBox="0 0 9 7" fill="none" style={{ flexShrink: 0 }}>
                                            <path d="M1 3.5L3 5.5L8 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                          </svg>
                                        )}
                                        {t}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Contributors row */}
            <div className={styles.contribSection}>
              <div className={styles.contribLabel}>Учасники</div>
              <div className={styles.contribRow}>
                {members.map((c) => (
                  <ContribAvatar key={c.id} contributor={c} size={38} onNavigate={onNavigate} />
                ))}
                {isOwner && (
                  <button
                    ref={addBtnRef}
                    className={`${styles.addContrib} ${contribPopupOpen ? styles.addContribActive : ''}`}
                    title="Додати учасника"
                    onClick={() => {
                      setContribPopupOpen((v) => !v);
                      setContribSearch('');
                      setSearchResults([]);
                      setMemberError('');
                    }}
                  >+</button>
                )}
              </div>

              {isOwner && contribPopupOpen && (
                <div ref={popupRef} className={styles.contribPopup}>

                  {/* Search input */}
                  <div className={styles.cpSearchWrap}>
                    <svg className={styles.cpSearchIcon} width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    <input
                      className={styles.cpSearchInput}
                      placeholder="Пошук за іменем або поштою…"
                      value={contribSearch}
                      onChange={(e) => setContribSearch(e.target.value)}
                      autoFocus
                    />
                    {contribSearch && (
                      <button className={styles.cpClear} onClick={() => { setContribSearch(''); setSearchResults([]); }}>×</button>
                    )}
                  </div>

                  {/* Results list */}
                  <div className={styles.cpList}>
                    {/* While typing < 2 chars: show current members so admin can remove them */}
                    {contribSearch.trim().length < 2 ? (
                      members.length > 0 ? (
                        members.map((person) => (
                          <button
                            key={person.id}
                            className={`${styles.cpItem} ${styles.cpItemActive}`}
                            onClick={() => toggleMember(person)}
                          >
                            <div className={styles.cpAvatar} style={{ background: person.color }}>
                              {person.initials}
                            </div>
                            <span className={styles.cpName}>{person.name}</span>
                            <span className={`${styles.cpCheck} ${styles.cpCheckOn}`}>
                              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className={styles.cpEmpty}>Немає учасників</div>
                      )
                    ) : searchLoading ? (
                      <div className={styles.cpEmpty}>Пошук…</div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((person) => {
                        const active = isMemberOf(person.id);
                        return (
                          <button
                            key={person.id}
                            className={`${styles.cpItem} ${active ? styles.cpItemActive : ''}`}
                            onClick={() => toggleMember(person)}
                          >
                            <div className={styles.cpAvatar} style={{ background: person.color }}>
                              {person.initials}
                            </div>
                            <span className={styles.cpName}>{person.name}</span>
                            <span className={`${styles.cpCheck} ${active ? styles.cpCheckOn : ''}`}>
                              {active && (
                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </span>
                          </button>
                        );
                      })
                    ) : (
                      <div className={styles.cpEmpty}>Нікого не знайдено</div>
                    )}
                  </div>

                  {/* Error message */}
                  {memberError && (
                    <p style={{ fontSize: 11, color: '#EF4444', padding: '6px 12px', margin: 0 }}>
                      {memberError}
                    </p>
                  )}

                </div>
              )}
            </div>
          </div>

          {/* ── Main area ──────────────────────────────── */}
          <div className={styles.mainArea}>

            {/* Calendar */}
            <div className={styles.calendarCard}>
              <div className={styles.calendarHead}>
                <button className={styles.navBtn} onClick={prevMonth}>‹</button>
                <div className={styles.calendarTitle}>
                  {MONTH_UA[month]} {year}
                </div>
                <button className={styles.navBtn} onClick={nextMonth}>›</button>

                <div className={styles.calLegend}>
                  {members.map((c) => (
                    <div key={c.id} className={styles.legendItem}>
                      <div className={styles.legendDot} style={{ background: c.color }} />
                      <span>{c.initials}</span>
                    </div>
                  ))}
                  {calendarLoading && (
                    <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 6 }}>
                      Завантаження…
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.calGrid}>
                {/* Day headers */}
                {DAY_UA.map((d) => (
                  <div key={d} className={styles.dayHeader}>{d}</div>
                ))}

                {/* Day cells */}
                {cells.map((cell, i) =>
                  cell === null ? (
                    <div key={`empty-${i}`} className={styles.emptyCell} />
                  ) : (
                    <DayCell
                      key={cell.dateStr}
                      day={cell.day}
                      dateStr={cell.dateStr}
                      entries={cell.entries}
                      isToday={cell.isToday}
                      isPast={cell.isPast}
                      isSelected={selectedDate === cell.dateStr}
                      onSelect={setSelectedDate}
                    />
                  )
                )}
              </div>

              {/* Day detail panel — below the grid, one at a time */}
              {selectedDate && calendarData[selectedDate] && (
                <DayDetailPanel
                  dateStr={selectedDate}
                  entries={calendarData[selectedDate]}
                  onClose={() => setSelectedDate(null)}
                />
              )}
            </div>

            {/* Right sidebar – Todo */}
            <div className={styles.sidebar}>
              <div className={styles.sidebarHead}>
                <div className={styles.sidebarTitle}>До виконання</div>
                <span className={styles.todoCounter}>{doneCount}/{totalTodos}</span>
                {isCompleted ? (
                  <div className={styles.completedBadge}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <circle cx="5" cy="5" r="4.5" fill="#4CAF7D" />
                      <path d="M2.5 5L4 6.5L7.5 3" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Завершено
                  </div>
                ) : totalTodos > 0 && doneCount === totalTodos ? (
                  <button className={styles.completeProjectBtn} onClick={handleCompleteProject}>
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M1.5 5.5L4 8L9.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Завершити
                  </button>
                ) : null}
              </div>

              {/* Todo progress */}
              <div className={styles.todoProgress}>
                <div className={styles.todoProgressTrack}>
                  <div
                    className={styles.todoProgressFill}
                    style={{ width: `${todoProgress}%` }}
                  />
                </div>
                <span className={styles.todoProgressPct}>{todoProgress}%</span>
              </div>

              <div className={styles.todoList}>
                {tasksLoading && (
                  <p style={{ fontSize: 12, color: 'var(--text3)', padding: '8px 0', textAlign: 'center' }}>
                    Завантаження…
                  </p>
                )}
                {todos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={isCompleted ? undefined : toggleTodo}
                    onDelete={projectId && !isCompleted ? handleDeleteTodo : null}
                    members={members}
                    disabled={isCompleted}
                  />
                ))}
              </div>

              {addingTodo ? (
                <div className={styles.addForm}>
                  {/* Task name */}
                  <input
                    className={styles.addFormInput}
                    placeholder="Назва завдання..."
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddTodo(); if (e.key === 'Escape') cancelAdd(); }}
                    autoFocus
                  />

                  {/* Assignee */}
                  <div className={styles.addFormRow}>
                    <span className={styles.addFormLabel}>Виконавець</span>
                    <div className={styles.assigneeOptions}>
                      {/* No assignee option */}
                      <button
                        className={`${styles.assigneeOpt} ${!draftAssigneeId ? styles.assigneeOptActive : ''}`}
                        style={!draftAssigneeId ? { outline: '3px solid var(--text3)', outlineOffset: '2px' } : {}}
                        onClick={() => setDraftAssigneeId('')}
                        title="Без виконавця"
                        type="button"
                      >
                        <div className={styles.assigneeOptAva} style={{ background: 'var(--neu)', color: 'var(--text3)', fontSize: 10 }}>
                          —
                        </div>
                      </button>
                      {members.map((c) => (
                        <button
                          key={c.id}
                          className={`${styles.assigneeOpt} ${draftAssigneeId === c.id ? styles.assigneeOptActive : ''}`}
                          style={draftAssigneeId === c.id ? { outline: `3px solid ${c.color}`, outlineOffset: '2px' } : {}}
                          onClick={() => setDraftAssigneeId(c.id)}
                          title={c.name}
                          type="button"
                        >
                          <div className={styles.assigneeOptAva} style={{ background: c.color }}>
                            {c.initials}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Priority */}
                  <div className={styles.addFormRow}>
                    <span className={styles.addFormLabel}>Пріоритет</span>
                    <div className={styles.priorityOptions}>
                      {Object.entries(PRIORITY).map(([key, p]) => (
                        <button
                          key={key}
                          type="button"
                          className={`${styles.priorityOpt} ${draftPriority === key ? styles.priorityOptActive : ''}`}
                          style={draftPriority === key ? { color: p.color, background: p.bg, borderColor: p.color } : {}}
                          onClick={() => setDraftPriority(key)}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div className={styles.addFormRow}>
                    <span className={styles.addFormLabel}>
                      Сума <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(необов'язково)</span>
                    </span>
                    <div className={styles.priceInputRow}>
                      <span className={styles.priceCurrency}>₴</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        className={styles.priceInput}
                        placeholder="0"
                        value={draftPrice}
                        onChange={(e) => setDraftPrice(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddTodo(); if (e.key === 'Escape') cancelAdd(); }}
                      />
                      <span className={styles.priceUnit}>UAH</span>
                    </div>
                  </div>

                  {/* Error */}
                  {taskError && (
                    <p style={{ fontSize: 12, color: '#EF4444', margin: '4px 0', fontWeight: 500 }}>
                      {taskError}
                    </p>
                  )}

                  {/* Actions */}
                  <div className={styles.addFormActions}>
                    <button type="button" className={styles.addFormCancel} onClick={cancelAdd}>
                      Скасувати
                    </button>
                    <button
                      type="button"
                      className={styles.addFormConfirm}
                      onClick={handleAddTodo}
                      disabled={!draftTitle.trim()}
                    >
                      Додати завдання
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className={styles.addTodoBtn}
                  onClick={!isCompleted ? openAddForm : undefined}
                  disabled={isCompleted}
                  style={isCompleted ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                >
                  + Додати завдання
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Delete confirmation dialog ──────────────────────── */}
      {showDeleteConfirm && (
        <div className={styles.timePopupOverlay} onClick={() => setShowDeleteConfirm(false)}>
          <div className={styles.deleteConfirmCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.deleteConfirmIcon}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M3 6h16M8 6V4a1 1 0 011-1h4a1 1 0 011 1v2M9.5 10v6M12.5 10v6M4 6l1 13a1 1 0 001 1h10a1 1 0 001-1l1-13" stroke="#E11D48" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className={styles.deleteConfirmTitle}>Видалити проєкт?</div>
            <div className={styles.deleteConfirmSub}>«{proj.title}» буде безповоротно видалено.</div>
            <div className={styles.deleteConfirmActions}>
              <button
                className={styles.addFormCancel}
                onClick={() => setShowDeleteConfirm(false)}
              >
                Скасувати
              </button>
              <button
                className={styles.deleteConfirmBtn}
                onClick={async () => {
                  setShowDeleteConfirm(false);
                  if (onDeleteProject) await onDeleteProject(projectId);
                  onNavigate(fromPage || 'projects');
                }}
              >
                Видалити
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Time-tracking completion popup ─────────────────── */}
      {completingTask && (
        <div className={styles.timePopupOverlay} onClick={handleCompleteCancel}>
          <div className={styles.timePopupCard} onClick={(e) => e.stopPropagation()}>

            <div className={styles.timePopupHeader}>
              <span className={styles.timePopupTitle}>Завершення задачі</span>
              <button className={styles.timePopupClose} onClick={handleCompleteCancel} aria-label="Закрити">
                ×
              </button>
            </div>

            <div className={styles.timePopupTaskName}>{completingTask.title}</div>

            <div className={styles.addFormRow}>
              <label className={styles.addFormLabel}>Скільки часу витрачено? (необов'язково)</label>
              <div className={styles.timeInputRow}>
                <input
                  className={styles.timeInput}
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0"
                  value={trackValue}
                  onChange={(e) => setTrackValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCompleteConfirm();
                    if (e.key === 'Escape') handleCompleteCancel();
                  }}
                  autoFocus
                />
                <div className={styles.unitToggle}>
                  <button
                    type="button"
                    className={`${styles.unitBtn} ${trackUnit === 'minutes' ? styles.unitBtnActive : ''}`}
                    onClick={() => setTrackUnit('minutes')}
                  >
                    Хв
                  </button>
                  <button
                    type="button"
                    className={`${styles.unitBtn} ${trackUnit === 'hours' ? styles.unitBtnActive : ''}`}
                    onClick={() => setTrackUnit('hours')}
                  >
                    Год
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.addFormRow}>
              <label className={styles.addFormLabel}>Сума (необов'язково)</label>
              <div className={styles.priceInputRow}>
                <span className={styles.priceCurrency}>₴</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  className={styles.priceInput}
                  placeholder="0"
                  value={trackPrice}
                  onChange={(e) => setTrackPrice(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCompleteConfirm();
                    if (e.key === 'Escape') handleCompleteCancel();
                  }}
                />
                <span className={styles.priceUnit}>UAH</span>
              </div>
            </div>

            <div className={styles.timePopupActions}>
              <button type="button" className={styles.timePopupCancel} onClick={handleCompleteCancel}>
                Скасувати
              </button>
              <button
                type="button"
                className={styles.timePopupConfirm}
                onClick={handleCompleteConfirm}
                disabled={completing}
              >
                Підтвердити
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;
