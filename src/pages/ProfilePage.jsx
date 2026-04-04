import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import styles from './ProfilePage.module.css';

const SKILLS = [
  { name: 'Організація',  pct: 88, color: '#FF6B9D' },
  { name: 'Екологія',     pct: 75, color: '#4CAF7D' },
  { name: 'Освіта',       pct: 60, color: '#F59E0B' },
  { name: 'Спільнота',    pct: 92, color: '#FF6B9D' },
];

const MONTHS = ['Жовт', 'Листоп', 'Груд', 'Січ', 'Лют', 'Бер'];
const BARS   = [40, 55, 70, 50, 80, 100];

const HISTORY = [
  { icon: 'CP', iconBg: '#EAF7F0', title: 'Відновлення міського парку', meta: 'Січ 2025 → Тепер · 32г', status: 'active',    statusLabel: 'Активний'  },
  { icon: 'CL', iconBg: '#FFF0F5', title: 'Громадська бібліотека',       meta: 'Лют 2025 → Тепер · 18г', status: 'new',       statusLabel: 'Новий'     },
  { icon: 'RD', iconBg: '#EAF7F0', title: 'Кампанія з переробки – Листоп', meta: 'Листоп 2024 · 14г',   status: 'completed', statusLabel: 'Завершено' },
];

const ProfilePage = ({ onNavigate }) => (
  <div className="app-layout">
    <Sidebar activePage="profile" onNavigate={onNavigate} />

    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      <Topbar searchable />

      <div className="main-content">
        {/* Hero */}
        <div className={styles.hero}>
          <div className={styles.profileAvatar}>АК</div>
          <div className={styles.profileInfo}>
            <h2>Анна Коваленко</h2>
            <p>Ужгород, Україна · Приєдналась у січні 2025</p>
            <p className={styles.bio}>Захоплена організатор спільноти та захисник навколишнього середовища. Вірю, що малі дії творять великі зміни.</p>
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
          <Button variant="ghost" sm style={{ marginLeft: 'auto', alignSelf: 'flex-start' }}>Редагувати профіль</Button>
        </div>

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
                  <span style={{ fontSize: 11, fontWeight: 700, background: h.iconBg, padding: '3px 6px', borderRadius: 6, color: 'var(--text2)' }}>{h.icon}</span>
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

export default ProfilePage;
