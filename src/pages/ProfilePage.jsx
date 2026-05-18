import React, { useState, useEffect, useRef, useMemo } from 'react';
import Sidebar  from '../components/layout/Sidebar';
import Badge    from '../components/common/Badge';
import Button   from '../components/common/Button';
import styles   from './ProfilePage.module.css';
import { ProjectIcon } from '../utils/projectIcon';
import { updateProfile, fetchUserProjects, fetchUserTeam, addTeamMember, removeTeamMember } from '../api/users';
import { searchUsers } from '../api/tasks';

const BIO_MAX = 400;

const MONTHS = ['Жовт', 'Листоп', 'Груд', 'Січ', 'Лют', 'Бер'];
const BARS   = [40, 55, 70, 50, 80, 100];

// ── Helpers ──────────────────────────────────────────────────
const getInitials = (u) => {
  if (!u) return '??';
  const f = (u.first_name || '')[0] || '';
  const l = (u.last_name  || '')[0] || '';
  return (f + l).toUpperCase() || '??';
};

const getFullName = (u) => {
  if (!u) return '';
  return [u.first_name, u.last_name].filter(Boolean).join(' ');
};

const formatJoinDate = (dateStr) => {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' });
  } catch {
    return null;
  }
};

// ── Validation ───────────────────────────────────────────────
const validate = (d) => {
  const e = {};
  if (!d.first_name.trim()) e.first_name = 'Імʼя обовʼязкове.';
  if (d.first_name.trim().length > 50) e.first_name = 'Не більше 50 символів.';
  if (d.last_name.trim().length > 50)  e.last_name  = 'Не більше 50 символів.';
  if (d.city.trim().length > 50)       e.city       = 'Не більше 50 символів.';
  if (d.country.trim().length > 50)    e.country    = 'Не більше 50 символів.';
  if (d.bio.length > BIO_MAX)          e.bio        = `Не більше ${BIO_MAX} символів.`;
  return e;
};

// ── Component ────────────────────────────────────────────────
const ProfilePage = ({ onNavigate, currentUser, onLogout, onUserUpdate }) => {
  // Profile draft for the edit form — seeded from currentUser
  const initDraft = useMemo(() => ({
    first_name: currentUser?.first_name || '',
    last_name:  currentUser?.last_name  || '',
    city:       currentUser?.city       || '',
    country:    currentUser?.country    || '',
    bio:        currentUser?.bio        || '',
  }), []); // eslint-disable-line react-hooks/exhaustive-deps

  const [draft,    setDraft]    = useState(initDraft);
  const [editing,  setEditing]  = useState(false);
  const [errors,   setErrors]   = useState({});
  const [saving,   setSaving]   = useState(false);
  const [feedback, setFeedback] = useState(null); // { type, msg }

  // Remote data
  const [userProjects, setUserProjects] = useState([]);
  const [dataLoading,  setDataLoading]  = useState(true);

  // Team state — persisted in the DB via /api/users/me/team
  const [team,              setTeam]              = useState([]);
  const [editingTeam,       setEditingTeam]       = useState(false);
  const [teamSearch,        setTeamSearch]        = useState('');
  const [teamResults,       setTeamResults]       = useState([]);
  const [teamSearchLoading, setTeamSearchLoading] = useState(false);
  const teamSectionRef = useRef(null);

  const firstNameRef = useRef(null);

  // ── Fetch projects + team for this user ───────────────────
  useEffect(() => {
    if (!currentUser?.id) return;
    setDataLoading(true);
    Promise.all([
      fetchUserProjects(currentUser.id).catch(() => []),
      fetchUserTeam(currentUser.id).catch(() => []),
    ]).then(([pr, tm]) => {
      setUserProjects(pr);
      setTeam(tm.map((m) => ({
        id:       m.id,
        name:     `${m.first_name || ''} ${m.last_name || ''}`.trim(),
        initials: `${(m.first_name || '')[0] || ''}${(m.last_name || '')[0] || ''}`.toUpperCase() || '??',
        color:    m.avatar_color || '#6B7280',
      })));
    }).finally(() => setDataLoading(false));
  }, [currentUser?.id]);

  // ── Debounced user search for team editing ─────────────────
  useEffect(() => {
    const q = teamSearch.trim();
    if (q.length < 2) { setTeamResults([]); return; }
    const timer = setTimeout(async () => {
      setTeamSearchLoading(true);
      try {
        const rows = await searchUsers(q);
        setTeamResults(rows.map((m) => ({
          id:       m.id,
          name:     `${m.first_name || ''} ${m.last_name || ''}`.trim(),
          initials: `${(m.first_name || '')[0] || ''}${(m.last_name || '')[0] || ''}`.toUpperCase() || '??',
          color:    m.avatar_color || '#6B7280',
        })));
      } catch {
        setTeamResults([]);
      } finally {
        setTeamSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [teamSearch]);

  // ── Close team edit panel on outside click ─────────────────
  useEffect(() => {
    if (!editingTeam) return;
    const handler = (e) => {
      if (teamSectionRef.current && !teamSectionRef.current.contains(e.target)) {
        setEditingTeam(false);
        setTeamSearch('');
        setTeamResults([]);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [editingTeam]);

  // Focus first input when entering edit mode
  useEffect(() => {
    if (editing) firstNameRef.current?.focus();
  }, [editing]);

  // Escape key cancels editing
  useEffect(() => {
    if (!editing) return;
    const onKey = (e) => { if (e.key === 'Escape') handleCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editing]); // eslint-disable-line react-hooks/exhaustive-deps

  // Derived display values (always from currentUser — never from URL/props ID)
  const displayName = getFullName(currentUser) || 'Користувач';
  const initials    = getInitials(currentUser);
  const joinDate    = formatJoinDate(currentUser?.created_at);
  const avatarColor = currentUser?.avatar_color || '#FF6B9D';

  // Stats — project count comes from the fetched membership list so it
  // includes both projects the user created and projects they joined.
  // Falls back to user_stats view count while the list is still loading.
  const totalProjects = dataLoading
    ? Number(currentUser?.active_projects_count) || 0
    : userProjects.length;
  const totalHours    = Number(currentUser?.total_logged_hours) || 0;
  const totalTasks    = Number(currentUser?.total_tasks)        || 0;

  const hasChanges =
    draft.first_name !== (currentUser?.first_name || '') ||
    draft.last_name  !== (currentUser?.last_name  || '') ||
    draft.city       !== (currentUser?.city       || '') ||
    draft.country    !== (currentUser?.country    || '') ||
    draft.bio        !== (currentUser?.bio        || '');

  // ── Handlers ──────────────────────────────────────────────
  const handleEdit = () => {
    setDraft({
      first_name: currentUser?.first_name || '',
      last_name:  currentUser?.last_name  || '',
      city:       currentUser?.city       || '',
      country:    currentUser?.country    || '',
      bio:        currentUser?.bio        || '',
    });
    setErrors({});
    setFeedback(null);
    setEditing(true);
  };

  const handleCancel = () => {
    setDraft({
      first_name: currentUser?.first_name || '',
      last_name:  currentUser?.last_name  || '',
      city:       currentUser?.city       || '',
      country:    currentUser?.country    || '',
      bio:        currentUser?.bio        || '',
    });
    setErrors({});
    setEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...draft, [name]: value };
    setDraft(updated);
    if (Object.keys(errors).length) setErrors(validate(updated));
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    const errs = validate(draft);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    setFeedback(null);
    try {
      const updated = await updateProfile({
        first_name: draft.first_name.trim(),
        last_name:  draft.last_name.trim(),
        city:       draft.city.trim()    || null,
        country:    draft.country.trim() || null,
        bio:        draft.bio.trim()     || null,
      });
      // Merge into App-level currentUser so Sidebar name updates too
      if (onUserUpdate) onUserUpdate(updated);
      setEditing(false);
      setErrors({});
      setFeedback({ type: 'success', msg: 'Профіль успішно оновлено!' });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message || 'Помилка збереження. Спробуйте ще раз.' });
    } finally {
      setSaving(false);
    }
  };

  const bioLeft = BIO_MAX - draft.bio.length;

  // ── Team helpers ───────────────────────────────────────────
  const isAdmin  = currentUser?.system_role === 'admin';
  const isOnTeam = (id) => team.some((m) => m.id === id);

  const addMember = async (person) => {
    if (isOnTeam(person.id)) return;
    setTeam((prev) => [...prev, person]); // optimistic add
    try {
      await addTeamMember(person.id);
    } catch {
      setTeam((prev) => prev.filter((m) => m.id !== person.id)); // revert
    }
  };

  const removeMember = async (id) => {
    const snapshot = team.find((m) => m.id === id);
    setTeam((prev) => prev.filter((m) => m.id !== id)); // optimistic remove
    try {
      await removeTeamMember(id);
    } catch {
      if (snapshot) setTeam((prev) => [...prev, snapshot]); // revert
    }
  };

  // ── Projects history display ───────────────────────────────
  const STATUS_LABELS = {
    new: 'Новий', active: 'Активний', in_progress: 'В процесі',
    completed: 'Завершено', archived: 'Архів',
  };
  const displayProjects = userProjects.slice(0, 5).map((p) => ({
    icon:        p.icon    || 'Leaf',
    iconBg:      p.icon_bg || '#EAF7F0',
    title:       p.title,
    meta:        [
      p.start_date ? new Date(p.start_date).toLocaleDateString('uk-UA', { month: 'short', year: 'numeric' }) : null,
      p.end_date   ? new Date(p.end_date).toLocaleDateString('uk-UA', { month: 'short', year: 'numeric' }) : 'Тепер',
    ].filter(Boolean).join(' → '),
    status:      p.status || 'new',
    statusLabel: STATUS_LABELS[p.status] || 'Новий',
  }));

  return (
    <div className="app-layout">
      <Sidebar
        activePage="profile"
        onNavigate={onNavigate}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <div className="main-content">

          {/* ── Feedback banner ── */}
          {feedback && (
            <div className={`${styles.feedback} ${feedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError}`}>
              <span>{feedback.type === 'success' ? '✓' : '✕'}</span>
              {feedback.msg}
            </div>
          )}

          {/* ── Hero ── */}
          <div className={styles.hero}>
            <div className={styles.profileAvatar} style={{ background: avatarColor }}>
              {initials}
            </div>

            <div className={styles.profileInfo}>
              {editing ? (
                /* ── Edit mode ── */
                <form onSubmit={handleSave} noValidate>
                  {/* First + Last name */}
                  <div className={styles.editRowTwo}>
                    <div className={styles.editField}>
                      <input
                        ref={firstNameRef}
                        name="first_name"
                        className={`input ${styles.editInputSm} ${errors.first_name ? styles.inputError : ''}`}
                        value={draft.first_name}
                        onChange={handleChange}
                        placeholder="Імʼя"
                        maxLength={50}
                      />
                      {errors.first_name && <span className={styles.fieldError}>{errors.first_name}</span>}
                    </div>
                    <div className={styles.editField}>
                      <input
                        name="last_name"
                        className={`input ${styles.editInputSm} ${errors.last_name ? styles.inputError : ''}`}
                        value={draft.last_name}
                        onChange={handleChange}
                        placeholder="Прізвище"
                        maxLength={50}
                      />
                      {errors.last_name && <span className={styles.fieldError}>{errors.last_name}</span>}
                    </div>
                  </div>

                  {/* City + Country */}
                  <div className={styles.editRowTwo}>
                    <div className={styles.editField}>
                      <input
                        name="city"
                        className={`input ${styles.editInputSm} ${errors.city ? styles.inputError : ''}`}
                        value={draft.city}
                        onChange={handleChange}
                        placeholder="Місто"
                        maxLength={50}
                      />
                      {errors.city && <span className={styles.fieldError}>{errors.city}</span>}
                    </div>
                    <div className={styles.editField}>
                      <input
                        name="country"
                        className={`input ${styles.editInputSm} ${errors.country ? styles.inputError : ''}`}
                        value={draft.country}
                        onChange={handleChange}
                        placeholder="Країна"
                        maxLength={50}
                      />
                      {errors.country && <span className={styles.fieldError}>{errors.country}</span>}
                    </div>
                  </div>

                  {/* Join date — static */}
                  {joinDate && <p className={styles.joinDate}>Приєднався(-лась) у {joinDate}</p>}

                  {/* Bio */}
                  <div className={styles.editField}>
                    <textarea
                      name="bio"
                      className={`${styles.editTextarea} ${errors.bio ? styles.inputError : ''}`}
                      value={draft.bio}
                      onChange={handleChange}
                      placeholder="Розкажіть про себе…"
                      rows={3}
                    />
                    <div className={styles.charRow}>
                      {errors.bio
                        ? <span className={styles.fieldError}>{errors.bio}</span>
                        : <span />}
                      <span className={`${styles.charCount} ${bioLeft < 50 ? styles.charWarn : ''}`}>
                        {draft.bio.length}/{BIO_MAX}
                      </span>
                    </div>
                  </div>
                </form>
              ) : (
                /* ── View mode ── */
                <>
                  <h2>{displayName}</h2>
                  <p>
                    {[currentUser?.city, currentUser?.country].filter(Boolean).join(', ')}
                    {joinDate ? ` · Приєднався(-лась) у ${joinDate}` : ''}
                  </p>
                  {currentUser?.bio && <p className={styles.bio}>{currentUser.bio}</p>}
                </>
              )}

              {/* Stats — always visible */}
              <div className={styles.statsRow}>
                {[
                  { num: totalProjects,       lbl: 'Проєкти'         },
                  { num: `${totalHours}г`,    lbl: 'Годин внеску'    },
                  { num: totalTasks,          lbl: 'Завдань виконано' },
                ].map((s) => (
                  <div key={s.lbl} className={styles.pstat}>
                    <div className={styles.pstatNum}>{s.num}</div>
                    <div className={styles.pstatLbl}>{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Action buttons ── */}
            <div className={styles.heroActions}>
              {editing ? (
                <>
                  <Button
                    variant="primary"
                    sm
                    onClick={handleSave}
                    disabled={saving || !hasChanges}
                  >
                    {saving ? (
                      <><span className={styles.spinner} /> Збереження…</>
                    ) : (
                      'Зберегти'
                    )}
                  </Button>
                  <Button variant="ghost" sm onClick={handleCancel} disabled={saving}>
                    Скасувати
                  </Button>
                </>
              ) : (
                <Button variant="ghost" sm onClick={handleEdit}>
                  Редагувати профіль
                </Button>
              )}
            </div>
          </div>

          {/* ── Cards grid ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* Team */}
            <div className="section-card" ref={teamSectionRef}>
              <div className="section-head">
                <div className="section-title">Команда</div>
                {isAdmin && (
                  <button
                    className={`${styles.teamEditBtn} ${editingTeam ? styles.teamEditBtnActive : ''}`}
                    onClick={() => { setEditingTeam((v) => !v); setTeamSearch(''); setTeamResults([]); }}
                    title={editingTeam ? 'Закрити редагування' : 'Редагувати команду'}
                  >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M9 1.5a1.414 1.414 0 012 2L4 11H1.5V8.5L9 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )}
              </div>

              {/* Member list */}
              {team.length > 0 ? (
                <div className={styles.teamList}>
                  {team.map((member) => (
                    <div key={member.id} className={styles.teamMember}>
                      <div className={styles.teamAvatar} style={{ background: member.color }}>
                        {member.initials}
                      </div>
                      <span className={styles.teamMemberName}>{member.name}</span>
                      {editingTeam && (
                        <button
                          className={styles.teamRemoveBtn}
                          onClick={() => removeMember(member.id)}
                          title="Видалити з команди"
                        >×</button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--text3)', padding: '4px 0 8px' }}>
                  Команда ще порожня.
                </p>
              )}

              {/* Search panel — visible only in edit mode */}
              {editingTeam && (
                <div className={styles.teamSearchPanel}>
                  <div className={styles.teamSearchWrap}>
                    <svg className={styles.teamSearchIcon} width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    <input
                      className={styles.teamSearchInput}
                      placeholder="Пошук за іменем або поштою…"
                      value={teamSearch}
                      onChange={(e) => setTeamSearch(e.target.value)}
                      autoFocus
                    />
                    {teamSearch && (
                      <button className={styles.teamSearchClear} onClick={() => { setTeamSearch(''); setTeamResults([]); }}>×</button>
                    )}
                  </div>

                  {/* Results */}
                  {teamSearch.trim().length >= 2 && (
                    <div className={styles.teamSearchResults}>
                      {teamSearchLoading ? (
                        <div className={styles.teamSearchEmpty}>Пошук…</div>
                      ) : teamResults.length > 0 ? (
                        teamResults.map((person) => {
                          const already = isOnTeam(person.id);
                          return (
                            <button
                              key={person.id}
                              className={`${styles.teamResultItem} ${already ? styles.teamResultActive : ''}`}
                              onClick={() => already ? removeMember(person.id) : addMember(person)}
                            >
                              <div className={styles.teamAvatar} style={{ background: person.color, width: 28, height: 28, fontSize: 10 }}>
                                {person.initials}
                              </div>
                              <span className={styles.teamMemberName}>{person.name}</span>
                              {already ? (
                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                                  <path d="M1 4L3.5 6.5L9 1" stroke="var(--pk1)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              ) : (
                                <span className={styles.teamResultAdd}>+</span>
                              )}
                            </button>
                          );
                        })
                      ) : (
                        <div className={styles.teamSearchEmpty}>Нікого не знайдено</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Monthly activity — kept as decorative until activity API is wired */}
            <div className="section-card">
              <div className="section-head"><div className="section-title">Місячна активність</div></div>
              <div className={styles.chartRow}>
                {BARS.map((h, i) => (
                  <div
                    key={i}
                    className={styles.bar}
                    style={{ height: `${h}%`, background: h === 100 ? 'var(--gr1)' : h >= 70 ? 'var(--pk2)' : 'var(--pk3)' }}
                  />
                ))}
              </div>
              <div className={styles.chartLabels}>
                {MONTHS.map((m) => <span key={m}>{m}</span>)}
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <div className={styles.miniStat} style={{ background: 'var(--pk3)' }}>
                  <div style={{ color: 'var(--pk1)', fontWeight: 800, fontSize: 16 }}>{totalHours}г</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)' }}>Всього годин</div>
                </div>
                <div className={styles.miniStat} style={{ background: 'var(--gr3)' }}>
                  <div style={{ color: 'var(--gr1)', fontWeight: 800, fontSize: 16 }}>{totalProjects}</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)' }}>Проєктів</div>
                </div>
              </div>
            </div>

            {/* Participation history */}
            <div className="section-card" style={{ gridColumn: '1 / -1' }}>
              <div className="section-head"><div className="section-title">Історія участі</div></div>
              {dataLoading ? (
                <p style={{ fontSize: 13, color: 'var(--text3)', padding: '8px 0' }}>Завантаження…</p>
              ) : displayProjects.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {displayProjects.map((h, i) => (
                    <div key={i} className={styles.historyItem}>
                      <span style={{
                        background: h.iconBg, width: 36, height: 36,
                        borderRadius: 8, display: 'inline-flex', alignItems: 'center',
                        justifyContent: 'center', flexShrink: 0,
                      }}>
                        <ProjectIcon name={h.icon} bg={h.iconBg} size={18} />
                      </span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text1)' }}>{h.title}</p>
                        <p style={{ fontSize: 11, color: 'var(--text3)' }}>{h.meta}</p>
                      </div>
                      <Badge status={h.status} dot>{h.statusLabel}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--text3)', padding: '8px 0' }}>
                  Ви ще не брали участі в жодному проєкті.
                </p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
