import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import styles  from './ProjectDetailPage.module.css';
import { fetchTasks, createTask, updateTask, deleteTask, fetchProjectMembers } from '../api/tasks';

// Mock contributors (active on this project — also used by calendar lookups)
const CONTRIBUTORS = [
  { id: 1, initials: 'АК', name: 'Анна Коваль',       color: '#FF6B9D', hours: 24, tasks: 8  },
  { id: 2, initials: 'МП', name: 'Максим Петров',     color: '#4CAF7D', hours: 18, tasks: 6  },
  { id: 3, initials: 'ОВ', name: 'Олена Василенко',   color: '#8B5CF6', hours: 31, tasks: 11 },
  { id: 4, initials: 'ДС', name: 'Дмитро Савченко',   color: '#F59E0B', hours: 14, tasks: 5  },
  { id: 5, initials: 'ТК', name: 'Тетяна Клименко',   color: '#06B6D4', hours: 9,  tasks: 3  },
];

// Extra volunteers available to invite
const EXTRA_POOL = [
  { id: 6,  initials: 'ІМ', name: 'Іван Мороз',        color: '#10B981', hours: 0, tasks: 0 },
  { id: 7,  initials: 'НБ', name: 'Наталія Бондар',    color: '#F97316', hours: 0, tasks: 0 },
  { id: 8,  initials: 'РК', name: 'Роман Кравченко',   color: '#6366F1', hours: 0, tasks: 0 },
  { id: 9,  initials: 'ЮЛ', name: 'Юлія Лисенко',     color: '#EC4899', hours: 0, tasks: 0 },
  { id: 10, initials: 'СГ', name: 'Сергій Гриценко',  color: '#14B8A6', hours: 0, tasks: 0 },
];

const PRESET_COLORS = ['#FF6B9D','#4CAF7D','#8B5CF6','#F59E0B','#06B6D4','#10B981','#F97316','#6366F1','#EC4899','#14B8A6'];

// Calendar entries (April 2026)
const CALENDAR_DATA = {
  '2026-04-01': [
    { userId: 1, tasks: ['Планування'],    time: '2г'       },
    { userId: 2, tasks: ['Дизайн'],        time: '1г 30хв'  },
  ],
  '2026-04-02': [
    { userId: 3, tasks: ['Аналіз ґрунту'], time: '3г'       },
    { userId: 4, tasks: ['Закупівля'],     time: '45хв'     },
  ],
  '2026-04-03': [
    { userId: 1, tasks: ['Посадка'],       time: '4г'       },
    { userId: 2, tasks: ['Посадка'],       time: '4г'       },
    { userId: 5, tasks: ['Документація'], time: '1г'        },
  ],
  '2026-04-05': [
    { userId: 3, tasks: ['Полив'],         time: '1г 30хв'  },
  ],
  '2026-04-07': [
    { userId: 1, tasks: ['Зустріч'],       time: '1г'       },
    { userId: 2, tasks: ['Зустріч'],       time: '1г'       },
    { userId: 3, tasks: ['Зустріч'],       time: '1г'       },
  ],
  '2026-04-08': [
    { userId: 4, tasks: ['Прибирання'],   time: '2г 30хв'   },
    { userId: 5, tasks: ['Фото-звіт'],    time: '1г'        },
  ],
  '2026-04-10': [
    { userId: 1, tasks: ['Посадка дерев', 'Лавки'], time: '5г' },
    { userId: 3, tasks: ['Посадка дерев'],           time: '4г' },
  ],
  '2026-04-11': [
    { userId: 2, tasks: ['Розмітка'],     time: '2г'        },
    { userId: 4, tasks: ['Інструменти'], time: '1г'         },
  ],
  '2026-04-12': [
    { userId: 1, tasks: ['Координація'],  time: '2г'        },
    { userId: 5, tasks: ['Соц. мережі'], time: '1г 30хв'   },
  ],
  '2026-04-14': [
    { userId: 2, tasks: ['Полив'],        time: '1г'        },
    { userId: 3, tasks: ['Обрізка'],      time: '2г'        },
  ],
  '2026-04-15': [
    { userId: 1, tasks: ['Звіт'],         time: '1г 30хв'  },
    { userId: 4, tasks: ['Звіт'],         time: '1г'        },
  ],
  '2026-04-17': [
    { userId: 3, tasks: ['Посадка кущів'], time: '3г'      },
    { userId: 5, tasks: ['Полив'],          time: '45хв'   },
  ],
  '2026-04-19': [
    { userId: 1, tasks: ['Майстер-клас'],  time: '3г'      },
    { userId: 2, tasks: ['Майстер-клас'],  time: '3г'      },
    { userId: 3, tasks: ['Майстер-клас'],  time: '3г'      },
    { userId: 4, tasks: ['Майстер-клас'],  time: '3г'      },
  ],
  '2026-04-21': [
    { userId: 2, tasks: ['Огляд'],         time: '1г 30хв' },
  ],
  '2026-04-22': [
    { userId: 1, tasks: ['Координація', 'Зустріч'], time: '3г' },
    { userId: 5, tasks: ['Документація'],              time: '2г' },
  ],
  '2026-04-24': [
    { userId: 3, tasks: ['Садівництво'],   time: '2г'      },
    { userId: 4, tasks: ['Полив'],         time: '1г'      },
  ],
  '2026-04-26': [
    { userId: 1, tasks: ['Перевірка'],    time: '1г'       },
    { userId: 2, tasks: ['Звіт'],         time: '1г 30хв'  },
    { userId: 5, tasks: ['Фото'],         time: '45хв'     },
  ],
  '2026-04-28': [
    { userId: 3, tasks: ['Прибирання'],   time: '2г'       },
  ],
  '2026-04-29': [
    { userId: 1, tasks: ['Фінальний огляд'], time: '2г'   },
    { userId: 2, tasks: ['Презентація'],     time: '2г'   },
    { userId: 3, tasks: ['Презентація'],     time: '2г'   },
    { userId: 4, tasks: ['Презентація'],     time: '2г'   },
    { userId: 5, tasks: ['Презентація'],     time: '2г'   },
  ],
};

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

const padDate  = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const daysInMonth  = (y, m) => new Date(y, m + 1, 0).getDate();
const firstWeekday = (y, m) => { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; };
const getContributor = (id) => CONTRIBUTORS.find((c) => c.id === id); // calendar only

// API shape → UI shape mappers
const mapTask = (t) => ({
  id:          t.id,
  title:       t.title,
  assigneeId:  t.assignee_id || null,
  done:        t.is_done,
  priority:    t.priority || 'medium',
  loggedHours: t.logged_hours ? Number(t.logged_hours) : null,
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
            {entries.slice(0, 4).map((e, i) => {
              const c = getContributor(e.userId);
              return c ? (
                <div
                  key={i}
                  className={styles.contribDot}
                  style={{ background: c.color }}
                  title={c.name}
                />
              ) : null;
            })}
            {entries.length > 4 && (
              <span className={styles.moreCount}>+{entries.length - 4}</span>
            )}
          </div>

          {entries[0].tasks[0] && (
            <div className={styles.taskTag}>{entries[0].tasks[0]}</div>
          )}

          <div className={styles.timeBadge}>{entries[0].time}</div>
        </>
      )}
    </div>
  );
};

// Day detail panel — rendered below the grid, never inside a cell
const DayDetailPanel = ({ dateStr, entries, onClose }) => {
  const date   = new Date(dateStr);
  const label  = `${date.getDate()} ${MONTH_UA[date.getMonth()]} ${date.getFullYear()}`;
  const totalTime = entries.reduce((sum, e) => {
    const match = e.time.match(/(\d+)г/);
    return sum + (match ? parseInt(match[1], 10) : 0);
  }, 0);

  return (
    <div className={styles.dayDetail}>
      <div className={styles.dayDetailHeader}>
        <div className={styles.dayDetailTitle}>
          <span className={styles.dayDetailDate}>{label}</span>
          <span className={styles.dayDetailSummary}>
            {entries.length} {entries.length === 1 ? 'учасник' : entries.length < 5 ? 'учасники' : 'учасників'}
            {totalTime > 0 && ` · ${totalTime}г загалом`}
          </span>
        </div>
        <button className={styles.dayDetailClose} onClick={onClose} aria-label="Закрити">×</button>
      </div>

      <div className={styles.dayDetailEntries}>
        {entries.map((entry, i) => {
          const c = getContributor(entry.userId);
          return c ? (
            <div key={i} className={styles.dayDetailEntry}>
              <div className={styles.detailAvatar} style={{ background: c.color }}>
                {c.initials}
              </div>
              <div className={styles.detailInfo}>
                <div className={styles.detailName}>{c.name}</div>
                <div className={styles.detailTasks}>
                  {entry.tasks.map((t, j) => (
                    <span key={j} className={styles.detailTask}>{t}</span>
                  ))}
                </div>
              </div>
              <div className={styles.detailTime}>{entry.time}</div>
            </div>
          ) : null;
        })}
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
const ProjectDetailPage = ({ onNavigate, project, fromPage, currentUser, onLogout, onUpdateProject }) => {
  const proj = project ?? {
    icon: '🌳', iconBg: '#EAF7F0',
    title: 'Відновлення міського парку',
    desc:  'Відновлення центрального парку з місцевими деревами, еко-лавками та громадським городом.',
    status: 'active', statusLabel: 'Активний',
    category: 'Довкілля', progress: 72, due: '15 квіт.',
  };

  const projectId = proj.id || null;

  const [year,          setYear]          = useState(2026);
  const [month,         setMonth]         = useState(3); // April = index 3
  const [selectedDate,  setSelectedDate]  = useState(null);
  const [todos,         setTodos]         = useState([]);
  const [members,       setMembers]       = useState([]);
  const [tasksLoading,  setTasksLoading]  = useState(false);
  const [taskError,     setTaskError]     = useState('');
  const [isCompleted,   setIsCompleted]   = useState(proj.status === 'completed');

  // Time-tracking popup
  const [completingTask, setCompletingTask] = useState(null); // { id, title } | null
  const [trackValue,     setTrackValue]     = useState('');   // raw input
  const [trackUnit,      setTrackUnit]      = useState('hours'); // 'hours' | 'minutes'
  const [completing,     setCompleting]     = useState(false);

  // Inline add-todo form state
  const [addingTodo,      setAddingTodo]      = useState(false);
  const [draftTitle,      setDraftTitle]      = useState('');
  const [draftAssigneeId, setDraftAssigneeId] = useState('');
  const [draftPriority,   setDraftPriority]   = useState('medium');

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

  // Tags state
  const [tags,         setTags]         = useState(['Довкілля', 'Волонтерство']);
  const [tagInput,     setTagInput]     = useState('');
  const [addingTag,    setAddingTag]    = useState(false);
  const tagInputRef = useRef(null);

  const handleAddTag = () => {
    const val = tagInput.trim();
    if (val && !tags.includes(val)) setTags((prev) => [...prev, val]);
    setTagInput('');
    setAddingTag(false);
  };

  const handleTagKey = (e) => {
    if (e.key === 'Enter') handleAddTag();
    if (e.key === 'Escape') { setTagInput(''); setAddingTag(false); }
  };

  const removeTag = (tag) => setTags((prev) => prev.filter((t) => t !== tag));

  // Contributor popover state
  const [activeContribs,   setActiveContribs]   = useState(CONTRIBUTORS);
  const [customContribs,   setCustomContribs]   = useState([]);
  const [contribPopupOpen, setContribPopupOpen] = useState(false);
  const [contribSearch,    setContribSearch]    = useState('');
  const [newName,          setNewName]          = useState('');
  const [newColor,         setNewColor]         = useState(PRESET_COLORS[0]);

  const popupRef  = useRef(null);
  const addBtnRef = useRef(null);

  useEffect(() => {
    if (!contribPopupOpen) return;
    const handler = (e) => {
      if (
        popupRef.current  && !popupRef.current.contains(e.target) &&
        addBtnRef.current && !addBtnRef.current.contains(e.target)
      ) {
        setContribPopupOpen(false);
        setContribSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [contribPopupOpen]);

  const fullPool    = [...CONTRIBUTORS, ...EXTRA_POOL, ...customContribs];
  const isActive    = (id) => activeContribs.some((c) => c.id === id);
  const toggleContrib = (person) =>
    setActiveContribs((prev) =>
      isActive(person.id) ? prev.filter((c) => c.id !== person.id) : [...prev, person]
    );

  const createContrib = () => {
    if (!newName.trim()) return;
    const words    = newName.trim().split(' ');
    const initials = words.map((w) => w[0]?.toUpperCase() ?? '').join('').slice(0, 2);
    const person   = { id: Date.now(), initials, name: newName.trim(), color: newColor, hours: 0, tasks: 0 };
    setCustomContribs((prev) => [...prev, person]);
    setActiveContribs((prev) => [...prev, person]);
    setNewName('');
    setNewColor(PRESET_COLORS[0]);
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

    // Optimistic update + close popup immediately
    setTodos((prev) => prev.map((t) =>
      t.id === id ? { ...t, done: true, loggedHours: hoursToLog } : t
    ));
    setCompletingTask(null);

    if (!projectId) return;

    setCompleting(true);
    try {
      await updateTask(projectId, id, {
        is_done: true,
        ...(hoursToLog !== null ? { hours_logged: hoursToLog } : {}),
      });
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
    setTaskError('');
    setAddingTodo(true);
  };

  const cancelAdd = () => { setAddingTodo(false); setTaskError(''); };

  const handleAddTodo = async () => {
    if (!draftTitle.trim()) return;
    setTaskError('');

    if (!projectId) {
      // Mock mode (no real project loaded yet)
      setTodos((prev) => [
        ...prev,
        { id: String(Date.now()), title: draftTitle.trim(), assigneeId: draftAssigneeId || null, done: false, priority: draftPriority },
      ]);
      setAddingTodo(false);
      return;
    }

    try {
      const created = await createTask(projectId, {
        title:       draftTitle.trim(),
        assignee_id: draftAssigneeId || null,
        priority:    draftPriority,
      });
      setTodos((prev) => [...prev, mapTask(created)]);
      setAddingTodo(false);
    } catch (err) {
      setTaskError(err.message || 'Не вдалося створити задачу');
    }
  };

  const doneCount    = todos.filter((t) => t.done).length;
  const totalTodos   = todos.length;
  const todoProgress = totalTodos > 0 ? Math.round((doneCount / totalTodos) * 100) : 0;

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
    cells.push({ day: d, dateStr, entries: CALENDAR_DATA[dateStr] || null, isToday, isPast });
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
                  {proj.icon}
                </div>
                <div>
                  <div className={styles.projectTitleRow}>
                    <div className={styles.projectTitle}>{proj.title}</div>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => onNavigate('projects')}
                      title="Видалити проєкт"
                    >
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M2 3.5h9M5 3.5V2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M5.5 6v3.5M7.5 6v3.5M2.5 3.5l.5 7a.5.5 0 00.5.5h5a.5.5 0 00.5-.5l.5-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Видалити
                    </button>
                  </div>
                  <div className={styles.projectDesc}>{proj.desc}</div>

                  {/* tags row */}
                  <div className={styles.tagsRow}>
                    {tags.map((tag) => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                        <button className={styles.tagRemove} onClick={() => removeTag(tag)} title="Видалити тег">×</button>
                      </span>
                    ))}

                    {addingTag ? (
                      <input
                        ref={tagInputRef}
                        className={styles.tagInput}
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKey}
                        onBlur={handleAddTag}
                        placeholder="Новий тег…"
                        autoFocus
                        maxLength={24}
                      />
                    ) : (
                      <button className={styles.tagAdd} onClick={() => setAddingTag(true)} title="Додати тег">+</button>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Contributors row */}
            <div className={styles.contribSection}>
              <div className={styles.contribLabel}>Учасники</div>
              <div className={styles.contribRow}>
                {activeContribs.map((c) => (
                  <ContribAvatar key={c.id} contributor={c} size={38} onNavigate={onNavigate} />
                ))}
                <button
                  ref={addBtnRef}
                  className={`${styles.addContrib} ${contribPopupOpen ? styles.addContribActive : ''}`}
                  title="Додати учасника"
                  onClick={() => { setContribPopupOpen((v) => !v); setContribSearch(''); }}
                >+</button>
              </div>

              {contribPopupOpen && (
                <div ref={popupRef} className={styles.contribPopup}>

                  {/* Search */}
                  <div className={styles.cpSearchWrap}>
                    <svg className={styles.cpSearchIcon} width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    <input
                      className={styles.cpSearchInput}
                      placeholder="Пошук учасника…"
                      value={contribSearch}
                      onChange={(e) => setContribSearch(e.target.value)}
                      autoFocus
                    />
                    {contribSearch && (
                      <button className={styles.cpClear} onClick={() => setContribSearch('')}>×</button>
                    )}
                  </div>

                  {/* Pool list */}
                  <div className={styles.cpList}>
                    {fullPool
                      .filter((p) => p.name.toLowerCase().includes(contribSearch.toLowerCase()))
                      .map((person) => {
                        const active = isActive(person.id);
                        return (
                          <button
                            key={person.id}
                            className={`${styles.cpItem} ${active ? styles.cpItemActive : ''}`}
                            onClick={() => toggleContrib(person)}
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
                      })}
                    {fullPool.filter((p) => p.name.toLowerCase().includes(contribSearch.toLowerCase())).length === 0 && (
                      <div className={styles.cpEmpty}>Нікого не знайдено</div>
                    )}
                  </div>

                  <div className={styles.cpDivider} />

                  {/* Create new */}
                  <div className={styles.cpCreate}>
                    <div className={styles.cpCreateLabel}>Новий учасник</div>
                    <input
                      className={styles.cpCreateInput}
                      placeholder="Ім'я та прізвище…"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && createContrib()}
                    />
                    <div className={styles.cpColors}>
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          className={`${styles.cpColor} ${newColor === c ? styles.cpColorActive : ''}`}
                          style={{ background: c }}
                          onClick={() => setNewColor(c)}
                          title={c}
                        />
                      ))}
                    </div>
                    <button
                      className={styles.cpCreateBtn}
                      onClick={createContrib}
                      disabled={!newName.trim()}
                    >
                      + Додати учасника
                    </button>
                  </div>

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
                  {CONTRIBUTORS.map((c) => (
                    <div key={c.id} className={styles.legendItem}>
                      <div className={styles.legendDot} style={{ background: c.color }} />
                      <span>{c.initials}</span>
                    </div>
                  ))}
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
              {selectedDate && CALENDAR_DATA[selectedDate] && (
                <DayDetailPanel
                  dateStr={selectedDate}
                  entries={CALENDAR_DATA[selectedDate]}
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
