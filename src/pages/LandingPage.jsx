import React from 'react';
import Button from '../components/common/Button';
import { FEATURES } from '../data/data';
import styles from './LandingPage.module.css';

const HeroVisual = () => (
  <div className={styles.heroVisual}>
    <div className={styles.hvRow}>
      {[
        { bg: '#FFF0F5', num: '24',   lbl: 'Активні проєкти',      bar: 72,  barColor: '#FF6B9D' },
        { bg: '#EAF7F0', num: '1 284',lbl: 'Учасники спільноти',   bar: 85,  barColor: '#4CAF7D' },
        { bg: '#F8F9FA', num: '89%',  lbl: 'Відсоток завершення',  bar: 89,  barColor: '#F59E0B' },
      ].map((c) => (
        <div key={c.lbl} className={styles.hvCard} style={{ background: c.bg }}>
          <div className={styles.hvNum}>{c.num}</div>
          <div className={styles.hvLbl}>{c.lbl}</div>
          <div className={styles.hvProgress}>
            <div className={styles.hvBar} style={{ width: `${c.bar}%`, background: c.barColor }} />
          </div>
        </div>
      ))}
    </div>

    <div className={styles.trendingSection}>
      <p className={styles.trendingLabel}>Популярні проєкти</p>
      {[
        { abbr: 'CP', abbrBg: '#EAF7F0', title: 'Відновлення міського парку', meta: 'Довкілля · 47 учасників', badge: 'Відкритий', badgeCls: 'badge-green' },
        { abbr: 'CL', abbrBg: '#FFF0F5', title: 'Громадська бібліотека',       meta: 'Освіта · 31 учасник',    badge: 'Новий',     badgeCls: 'badge-pink'  },
      ].map((p) => (
        <div key={p.title} className={styles.trendingItem}>
          <span className={styles.trendingIcon} style={{ background: p.abbrBg, fontSize: 11, fontWeight: 700, color: 'var(--text2)' }}>{p.abbr}</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text1)' }}>{p.title}</p>
            <p style={{ fontSize: 11, color: 'var(--text3)' }}>{p.meta}</p>
          </div>
          <span className={`badge ${p.badgeCls}`}>{p.badge}</span>
        </div>
      ))}
    </div>
  </div>
);

const LandingPage = ({ onNavigate }) => (
  <div>
    {/* Hero */}
    <section className={styles.hero}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div style={{ position: 'relative', zIndex: 2 }}>
        <span className={styles.heroBadge}>Громадська платформа</span>
        <h1 className={styles.heroTitle}>
          Втілюй громадські<br />
          <span>проєкти в життя</span>
        </h1>
        <p className={styles.heroSub}>
          Kindora допомагає командам знаходити, приєднуватись та керувати
          соціальними й громадськими ініціативами — все в одному зручному місці.
        </p>
        <div className={styles.heroCtas}>
          <Button variant="primary" onClick={() => onNavigate('register')} style={{ fontSize: 15, padding: '13px 28px' }}>
            Почати зараз
          </Button>
          <Button variant="ghost" onClick={() => onNavigate('explore')} style={{ fontSize: 15, padding: '13px 28px' }}>
            Переглянути проєкти →
          </Button>
        </div>
      </div>
      <HeroVisual />
    </section>

    {/* Features */}
    <section className={styles.features}>
      {FEATURES.map((f) => (
        <div key={f.title} className={styles.featCard}>
          <div className={styles.featIcon} style={{ background: f.bg }}>{f.icon}</div>
          <p className={styles.featTitle}>{f.title}</p>
          <p className={styles.featDesc}>{f.desc}</p>
        </div>
      ))}
    </section>

    {/* CTA banner */}
    <section className={styles.ctaBanner}>
      <h2 className={styles.ctaTitle}>Готові змінювати світ?</h2>
      <p className={styles.ctaSub}>Приєднайтесь до тисяч будівничих спільнот, які вже використовують Kindora.</p>
      <Button variant="primary" onClick={() => onNavigate('register')} style={{ fontSize: 15, padding: '14px 32px' }}>
        Почати сьогодні
      </Button>
    </section>

    {/* Footer */}
    <footer className={styles.footer}>
      <div className={styles.footerLogo}>
        Kindora
      </div>
      <p style={{ fontSize: 12, color: '#9CA3AF' }}>© 2026 Kindora. Зроблено з турботою про спільноти.</p>
    </footer>
  </div>
);

export default LandingPage;
