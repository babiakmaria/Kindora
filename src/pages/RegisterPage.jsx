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

const RegisterPage = ({ onNavigate }) => {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
    role: 'member', agreeTerms: false,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onNavigate(form.role === 'admin' ? 'admin' : 'dashboard');
    }, 800);
  };

  const strength = getStrength(form.password);
  const strengthLabels = ['', 'Слабкий', 'Середній — додайте символ', 'Надійний', 'Дуже надійний'];

  return (
    <div className={styles.wrap}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />

      <div className={styles.card} style={{ maxWidth: 460 }}>
        <div className={styles.logoMark}>K</div>
        <h1 className={styles.title}>Створіть акаунт</h1>
        <p className={styles.sub}>Приєднуйтесь до спільноти та починайте діяти</p>

        <form onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className="input-label">Ім'я</label>
              <input className="input" name="firstName" placeholder="Анна"
                value={form.firstName} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label className="input-label">Прізвище</label>
              <input className="input" name="lastName" placeholder="Коваленко"
                value={form.lastName} onChange={handleChange} required />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className="input-label">Електронна пошта</label>
            <input className="input" type="email" name="email" placeholder="ви@приклад.com"
              value={form.email} onChange={handleChange} required />
          </div>

          <div className={styles.formGroup}>
            <label className="input-label">Пароль</label>
            <input className="input" type="password" name="password" placeholder="Мін. 8 символів"
              value={form.password} onChange={handleChange} required />
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
          </div>

          <div className={styles.formGroup}>
            <label className="input-label">Я приєднуюсь як</label>
            <div className={styles.roleRow}>
              {[
                { value: 'member', label: 'Учасник спільноти' },
                { value: 'admin',  label: 'Адміністратор' },
              ].map((opt) => (
                <div
                  key={opt.value}
                  className={`${styles.roleOption} ${form.role === opt.value ? styles.selected : ''}`}
                  onClick={() => setForm((prev) => ({ ...prev, role: opt.value }))}
                >
                  <div className={styles.roleOptionLabel}>{opt.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.checkRow}>
            <input type="checkbox" id="terms" name="agreeTerms"
              checked={form.agreeTerms} onChange={handleChange}
              style={{ accentColor: 'var(--pk1)' }} required />
            <label htmlFor="terms" style={{ fontSize: 12, color: 'var(--text2)' }}>
              Я погоджуюсь з{' '}
              <span style={{ color: 'var(--pk1)', cursor: 'pointer' }}>Умовами використання</span>{' '}
              та{' '}
              <span style={{ color: 'var(--pk1)', cursor: 'pointer' }}>Політикою конфіденційності</span>
            </label>
          </div>

          <Button type="submit" variant="primary"
            style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: 13, borderRadius: 12 }}>
            {loading ? 'Створення акаунту…' : 'Створити акаунт'}
          </Button>
        </form>

        <p className={styles.switchLink}>
          Вже є акаунт?{' '}
          <span onClick={() => onNavigate('login')}>Увійти</span>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
