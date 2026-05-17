import React from 'react';
import styles from './LandingPage.module.css';


const FEATURES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="10" cy="9" r="4" stroke="currentColor" strokeWidth="2"/>
        <circle cx="20" cy="9" r="4" stroke="currentColor" strokeWidth="2"/>
        <path d="M2 22c0-4 3.6-7 8-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M26 22c0-4-3.6-7-8-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M14 28v-6m0 0l-3-3m3 3l3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Розумний підбір',
    desc: 'Наш алгоритм підбирає найближчі до тебе можливості на основі твоїх інтересів, навичок та графіку — без зайвих зусиль з твого боку.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="5" width="22" height="20" rx="3" stroke="currentColor" strokeWidth="2"/>
        <path d="M3 11h22" stroke="currentColor" strokeWidth="2"/>
        <path d="M9 3v4M19 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <rect x="8" y="15" width="4" height="4" rx="1" fill="currentColor"/>
        <rect x="16" y="15" width="4" height="4" rx="1" fill="currentColor"/>
      </svg>
    ),
    title: 'Календар акцій і подій',
    desc: 'Ніколи не пропускай важливі акції — слідкуй за заходами, отримуй нагадування та долучайся до подій у зручний для тебе час.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 3C7.925 3 3 7.477 3 13c0 2.136.7 4.112 1.875 5.724L3 25l6.563-1.762A11.459 11.459 0 0014 24c6.075 0 11-4.477 11-10S20.075 3 14 3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M9 13h10M9 17h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Спільнота та історії змін',
    desc: 'Читай надихаючі історії волонтерів і ділись власним досвідом — разом ми створюємо живу карту доброти та змін.',
  },
];

const LandingPage = ({ onNavigate }) => (
  <div className={styles.page}>

    {/* navbar — sticky, links navigate to real pages */}
    <nav className={styles.navbar}>
      <div className={styles.navLogo}>
        Kind<span>ora</span>
      </div>
      <ul className={styles.navLinks} />
      <button className={styles.navCta} onClick={() => onNavigate('login')}>
        Увійти →
      </button>
    </nav>

    {/* hero — blobs are just divs with blur, they sit behind the text */}
    <section className={styles.hero}>
      <div className={styles.blobPeach} />
      <div className={styles.blobViolet} />
      <div className={styles.blobAmber} />
      <div className={styles.blobRose} />

      <div className={styles.heroInner}>
        <p className={styles.heroTagline}>Даруй. Єднайся. Зростай.</p>
        <h1 className={styles.heroTitle}>
          Змінюй світ на краще
        </h1>
        <p className={styles.heroSub}>
          Kindora об'єднує небайдужих людей із важливими справами.
          Знаходь волонтерські можливості, приєднуйся до спільнот
          та роби різницю — разом.
        </p>
        <button className={styles.heroCta} onClick={() => onNavigate('register')}>
          Розпочати →
        </button>
      </div>

      <div className={styles.heroAurora} />
    </section>

    {/* short intro before the cards — big headline on the left, text on the right */}
    <section className={styles.featIntro}>
      <div className={styles.featIntroWrap}>
        <div className={styles.fiLeft}>
          <h2 className={styles.fiHeadline}>
            Створено,<br />
            щоб ти<br />
            робив більше
          </h2>
        </div>
        <div className={styles.fiRight}>
          <p className={styles.fiDesc}>
            Kindora — це більше ніж платформа. Це простір, де кожна дія
            має значення. Ми поєднуємо зручні інструменти з людяністю,
            щоб волонтерство стало природною частиною твого повсякдення.
          </p>
          <div className={styles.fiStats}>
            {[
              { n: '3 400+', l: 'волонтерів' },
              { n: '180',    l: 'активних проєктів' },
              { n: '92%',    l: 'задоволені учасники' },
            ].map(({ n, l }) => (
              <div key={l} className={styles.fiStat}>
                <span className={styles.fiStatNum}>{n}</span>
                <span className={styles.fiStatLbl}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* 3 feature cards — no background, just icon + title + desc */}
    <section className={styles.cards}>
      <div className={styles.cardsWrap}>
        {FEATURES.map((f) => (
          <div key={f.title} className={styles.card}>
            <div className={styles.cardIcon}>{f.icon}</div>
            <h3 className={styles.cardTitle}>{f.title}</h3>
            <p className={styles.cardDesc}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* simple footer, nothing fancy */}
    <footer className={styles.footer}>
      <span className={styles.footerLogo}>Kind<span>ora</span></span>
      <p className={styles.footerCopy}>© 2026 Kindora. Зроблено з турботою про спільноти.</p>
    </footer>

  </div>
);

export default LandingPage;
