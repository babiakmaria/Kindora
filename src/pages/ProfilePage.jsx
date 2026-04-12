import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Topbar  from '../components/layout/Topbar';
import Badge   from '../components/common/Badge';
import Button  from '../components/common/Button';
import styles  from './ProfilePage.module.css';

// ── Static data ──────────────────────────────────────────────
const SKILLS = [
  { name: 'Організація', pct: 88, color: '#FF6B9D' },
  { name: 'Екологія',    pct: 75, color: '#4CAF7D' },
  { name: 'Освіта',      pct: 60, color: '#F59E0B' },
  { name: 'Спільнота',   pct: 92, color: '#FF6B9D' },
];

const MONTHS = ['Жовт', 'Листоп', 'Груд', 'Січ', 'Лют', 'Бер'];
const BARS   = [40, 55, 70, 50, 80, 100];

const HISTORY = [
  { icon: '🌳', iconBg: '#EAF7F0', title: 'Відновлення міського парку',      meta: 'Січ 2025 → Тепер · 32г', status: 'active',    statusLabel: 'Активний'  },
  { icon: '📚', iconBg: '#FFF0F5', title: 'Громадська бібліотека',            meta: 'Лют 2025 → Тепер · 18г', status: 'new',       statusLabel: 'Новий'     },
  { icon: '♻️', iconBg: '#EAF7F0', title: 'Кампанія з переробки – Листоп',   meta: 'Листоп 2024 · 14г',       status: 'completed', statusLabel: 'Завершено' },
];

const INITIAL_PROFILE = {
  name:    'Анна Коваленко',
  city:    'Ужгород',
  country: 'Україна',
  bio:     'Захоплена організатор спільноти та захисник навколишнього середовища. Вірю, що малі дії творять великі зміни.',
};

const BIO_MAX = 400;

// ── Validation ───────────────────────────────────────────────
const validate = (d) => {
  const e = {};
  if (!d.name.trim())        e.name    = 'Ім\'я обов\'язкове.';
  if (d.city.length    > 50) e.city    = 'Не більше 50 символів.';
  if (d.country.length > 50) e.country = 'Не більше 50 символів.';
  if (d.bio.length > BIO_MAX) e.bio    = `Не більше ${BIO_MAX} символів.`;
  return e;
};

// ── Component ────────────────────────────────────────────────
const ProfilePage = ({ onNavigate }) => {
  const [profile,  setProfile]  = useState(INITIAL_PROFILE);
  const [editing,  setEditing]  = useState(false);
  const [draft,    setDraft]    = useState(INITIAL_PROFILE);
  const [errors,   setErrors]   = useState({});
  const [saving,   setSaving]   = useState(false);
  const [feedback, setFeedback] = useState(null); // { type, msg }

  const nameRef = useRef(null);

  // Focus name input when entering edit mode
  useEffect(() => {
    if (editing) nameRef.current?.focus();
  }, [editing]);

  // Escape key cancels editing
  useEffect(() => {
    if (!editing) return;
    const onKey = (e) => { if (e.key === 'Escape') handleCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editing]);

  const hasChanges =
    draft.name    !== profile.name    ||
    draft.city    !== profile.city    ||
    draft.country !== profile.country ||
    draft.bio     !== profile.bio;

  const handleEdit = () => {
    setDraft({ ...profile });
    setErrors({});
    setFeedback(null);
    setEditing(true);
  };

  const handleCancel = () => {
    setDraft({ ...profile });
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
    try {
      // Simulate API call (replace with real fetch/axios)
      await new Promise((res) => setTimeout(res, 900));
      setProfile({ ...draft });
      setEditing(false);
      setErrors({});
      setFeedback({ type: 'success', msg: 'Профіль успішно оновлено!' });
      setTimeout(() => setFeedback(null), 3500);
    } catch {
      setFeedback({ type: 'error', msg: 'Помилка збереження. Спробуйте ще раз.' });
    } finally {
      setSaving(false);
    }
  };

  const bioLeft = BIO_MAX - draft.bio.length;

  return (
    <div className="app-layout">
      <Sidebar activePage="profile" onNavigate={onNavigate} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <Topbar searchable />

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
            <div className={styles.profileAvatar}>АК</div>

            <div className={styles.profileInfo}>
              {editing ? (
                /* ── Edit mode ── */
                <form onSubmit={handleSave} noValidate>
                  {/* Name */}
                  <div className={styles.editField}>
                    <input
                      ref={nameRef}
                      name="name"
                      className={`input ${styles.editInput} ${errors.name ? styles.inputError : ''}`}
                      value={draft.name}
                      onChange={handleChange}
                      placeholder="Ім'я та прізвище"
                      maxLength={80}
                    />
                    {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
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
                  <p className={styles.joinDate}>Приєдналась у січні 2025</p>

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
                  <h2>{profile.name}</h2>
                  <p>{profile.city}, {profile.country} · Приєдналась у січні 2025</p>
                  <p className={styles.bio}>{profile.bio}</p>
                </>
              )}

              {/* Stats — always visible */}
              <div className={styles.statsRow}>
                {[
                  { num: '7',   lbl: 'Проєкти' },
                  { num: '84г', lbl: 'Годин внеску' },
                  { num: '43',  lbl: 'Завдань виконано' },
                  { num: '920', lbl: 'Рейтинг впливу', highlight: true },
                ].map((s) => (
                  <div key={s.lbl} className={styles.pstat}>
                    <div className={styles.pstatNum} style={s.highlight ? { color: 'var(--pk1)' } : {}}>{s.num}</div>
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
            {/* Skills */}
            <div className="section-card">
              <div className="section-head"><div className="section-title">Навички та внески</div></div>
              <div className={styles.skillBars}>
                {SKILLS.map((s) => (
                  <div key={s.name} className={styles.skillRow}>
                    <span className={styles.skillName}>{s.name}</span>
                    <div className={styles.skillTrack}>
                      <div className={styles.skillFill} style={{ width: `${s.pct}%`, background: s.color }} />
                    </div>
                    <span className={styles.skillPct}>{s.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly activity */}
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
                  <div style={{ color: 'var(--pk1)', fontWeight: 800, fontSize: 16 }}>28г</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)' }}>Цього місяця</div>
                </div>
                <div className={styles.miniStat} style={{ background: 'var(--gr3)' }}>
                  <div style={{ color: 'var(--gr1)', fontWeight: 800, fontSize: 16 }}>+23%</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)' }}>до минулого місяця</div>
                </div>
              </div>
            </div>

            {/* Participation history */}
            <div className="section-card" style={{ gridColumn: '1 / -1' }}>
              <div className="section-head"><div className="section-title">Історія участі</div></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {HISTORY.map((h) => (
                  <div key={h.title} className={styles.historyItem}>
                    <span style={{ fontSize: 20, background: h.iconBg, width: 36, height: 36, borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{h.icon}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text1)' }}>{h.title}</p>
                      <p style={{ fontSize: 11, color: 'var(--text3)' }}>{h.meta}</p>
                    </div>
                    <Badge status={h.status} dot>{h.statusLabel}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
