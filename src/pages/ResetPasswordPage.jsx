import React, { useState } from 'react';
import Button from '../components/common/Button';
import styles from './AuthPage.module.css';

const STRENGTH_COLORS = ['#FF6B9D', '#FF6B9D', '#F59E0B', '#4CAF7D'];

const getStrength = (pw) => {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
};

const strengthLabels = ['', 'Слабкий', 'Середній — додайте символ', 'Надійний', 'Дуже надійний'];

// tokenStatus can be 'valid', 'expired', 'used', or 'invalid'
// in a real app this would come from the token in the URL
const ResetPasswordPage = ({ onNavigate, tokenStatus = 'valid' }) => {
  const [form,        setForm]        = useState({ password: '', confirm: '' });
  const [errors,      setErrors]      = useState({});
  const [step,        setStep]        = useState('form'); // form or success
  const [loading,     setLoading]     = useState(false);
  const [showPass,    setShowPass]    = useState(false);

  const strength = getStrength(form.password);

  // show expired screen if the token is too old
  if (tokenStatus === 'expired') {
    return (
      <div className={styles.wrap}>
        <div className={styles.blob1} /><div className={styles.blob2} />
        <div className={styles.card}>

          <div style={{ textAlign: 'center', margin: '4px 0 24px' }}>
            <div style={iconStyle('#FFF8E1')}>⏱️</div>
            <h1 className={styles.title}>Посилання застаріло</h1>
            <p className={styles.sub}>
              Термін дії посилання минув — воно дійсне лише 24 години
              після надсилання.
            </p>
          </div>
          <Button variant="primary"
            style={fullBtn}
            onClick={() => onNavigate('forgot-password')}>
            Отримати нове посилання
          </Button>
          <p className={styles.switchLink}>
            <span onClick={() => onNavigate('login')}>Повернутися до входу</span>
          </p>
        </div>
      </div>
    );
  }

  // link was already used once so we show this screen instead
  if (tokenStatus === 'used') {
    return (
      <div className={styles.wrap}>
        <div className={styles.blob1} /><div className={styles.blob2} />
        <div className={styles.card}>

          <div style={{ textAlign: 'center', margin: '4px 0 24px' }}>
            <div style={iconStyle('var(--gr3)')}>✅</div>
            <h1 className={styles.title}>Посилання вже використано</h1>
            <p className={styles.sub}>
              Цим посиланням вже скидали пароль. З міркувань безпеки
              кожне посилання можна використати лише один раз.
            </p>
          </div>
          <Button variant="primary" style={fullBtn} onClick={() => onNavigate('login')}>
            Увійти до акаунту
          </Button>
          <p className={styles.switchLink}>
            Потрібна допомога?{' '}
            <span onClick={() => onNavigate('forgot-password')}>Скинути знову</span>
          </p>
        </div>
      </div>
    );
  }

  // token doesn't match anything valid (could be tampered or just wrong)
  if (tokenStatus === 'invalid') {
    return (
      <div className={styles.wrap}>
        <div className={styles.blob1} /><div className={styles.blob2} />
        <div className={styles.card}>

          <div style={{ textAlign: 'center', margin: '4px 0 24px' }}>
            <div style={iconStyle('var(--pk3)')}>🔗</div>
            <h1 className={styles.title}>Недійсне посилання</h1>
            <p className={styles.sub}>
              Посилання для скидання пароля пошкоджене або недійсне.
              Будь ласка, створіть нове.
            </p>
          </div>
          <Button variant="primary" style={fullBtn}
            onClick={() => onNavigate('forgot-password')}>
            Спробувати знову
          </Button>
          <p className={styles.switchLink}>
            <span onClick={() => onNavigate('login')}>Повернутися до входу</span>
          </p>
        </div>
      </div>
    );
  }

  // password was changed successfully
  if (step === 'success') {
    return (
      <div className={styles.wrap}>
        <div className={styles.blob1} /><div className={styles.blob2} />
        <div className={styles.card}>

          <div style={{ textAlign: 'center', margin: '4px 0 28px' }}>
            <div style={iconStyle('var(--gr3)', 64, 28)}>🎉</div>
            <h1 className={styles.title}>Пароль змінено!</h1>
            <p className={styles.sub}>
              Ваш пароль успішно оновлено.<br />
              Тепер можна увійти з новим паролем.
            </p>
          </div>
          <Button variant="primary" style={fullBtn} onClick={() => onNavigate('login')}>
            Увійти до акаунту
          </Button>
        </div>
      </div>
    );
  }

  // main form where the user types their new password
  const validate = () => {
    const errs = {};
    if (!form.password) {
      errs.password = 'Введіть новий пароль';
    } else if (form.password.length < 8) {
      errs.password = 'Пароль має містити щонайменше 8 символів';
    } else if (strength < 2) {
      errs.password = 'Пароль надто слабкий — додайте цифри або символи';
    }
    if (!form.confirm) {
      errs.confirm = 'Підтвердіть пароль';
    } else if (form.password !== form.confirm) {
      errs.confirm = 'Паролі не збігаються';
    }
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep('success'); }, 900);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const passwordsMatch = form.confirm && form.confirm === form.password;

  return (
    <div className={styles.wrap}>
      <div className={styles.blob1} /><div className={styles.blob2} />

      <div className={styles.card}>
        <div className={styles.logoMark}>K</div>
        <h1 className={styles.title}>Новий пароль</h1>
        <p className={styles.sub}>Введіть надійний пароль для вашого акаунту</p>

        <form onSubmit={handleSubmit} noValidate>
          {/* new password field with show/hide toggle */}
          <div className={styles.formGroup}>
            <label className="input-label">Новий пароль</label>
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                type={showPass ? 'text' : 'password'}
                name="password"
                placeholder="Мін. 8 символів"
                value={form.password}
                onChange={handleChange}
                style={{
                  paddingRight: 40,
                  ...(errors.password
                    ? { borderColor: '#EF4444', boxShadow: '0 0 0 3px rgba(239,68,68,0.1)' }
                    : {}),
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                style={eyeBtn}
                aria-label={showPass ? 'Сховати пароль' : 'Показати пароль'}
              >
                {showPass ? '🙈' : '👁'}
              </button>
            </div>

            {/* strength bar, same one as on the register page */}
            <div className={styles.strengthBar}>
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={styles.strengthSegment}
                  style={{ background: i < strength ? STRENGTH_COLORS[strength - 1] : '#E5E7EB' }}
                />
              ))}
            </div>
            {form.password && (
              <p className={styles.strengthHint}>{strengthLabels[strength]}</p>
            )}
            {errors.password && <p style={errorText}>{errors.password}</p>}
          </div>

          {/* confirm field turns green when both passwords match */}
          <div className={styles.formGroup}>
            <label className="input-label">Підтвердіть пароль</label>
            <input
              className="input"
              type={showPass ? 'text' : 'password'}
              name="confirm"
              placeholder="Повторіть пароль"
              value={form.confirm}
              onChange={handleChange}
              style={
                errors.confirm
                  ? { borderColor: '#EF4444', boxShadow: '0 0 0 3px rgba(239,68,68,0.1)' }
                  : passwordsMatch
                  ? { borderColor: 'var(--gr1)', boxShadow: '0 0 0 3px rgba(76,175,125,0.12)' }
                  : {}
              }
            />
            {errors.confirm && <p style={errorText}>{errors.confirm}</p>}
            {!errors.confirm && passwordsMatch && (
              <p style={{ fontSize: 12, color: 'var(--gr1)', marginTop: 6, fontWeight: 500 }}>
                ✓ Паролі збігаються
              </p>
            )}
          </div>

          {/* small hint box reminding the user what a good password looks like */}
          <div style={{
            background: 'var(--neu)',
            borderRadius: 10,
            padding: '11px 14px',
            marginBottom: 16,
            fontSize: 12,
            color: 'var(--text2)',
            lineHeight: 1.7,
            border: '1px solid var(--border)',
          }}>
            Пароль має містити: мін. 8 символів · велику літеру · цифру · спецсимвол
          </div>

          <Button
            type="submit"
            variant="primary"
            style={fullBtn}
          >
            {loading ? 'Збереження…' : 'Зберегти новий пароль'}
          </Button>
        </form>
      </div>
    </div>
  );
};

// shared styles used by multiple screens below
const fullBtn = {
  width: '100%',
  justifyContent: 'center',
  fontSize: 15,
  padding: 13,
  borderRadius: 12,
};

const eyeBtn = {
  position: 'absolute',
  right: 12,
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: 16,
  color: 'var(--text3)',
  padding: 0,
  lineHeight: 1,
};

const errorText = {
  fontSize: 12,
  color: '#EF4444',
  marginTop: 6,
  fontWeight: 500,
};

const iconStyle = (bg, size = 60, fontSize = 24) => ({
  width: size,
  height: size,
  background: bg,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 16px',
  fontSize,
});

export default ResetPasswordPage;
