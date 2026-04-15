import React, { useState } from 'react';
import Button from '../components/common/Button';
import styles from './AuthPage.module.css';

const LoginPage = ({ onNavigate }) => {
  const [form, setForm] = useState({ email: '', password: '', remember: false });
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
      onNavigate('projects');
    }, 800);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />

      <div className={styles.card}>
        <h1 className={styles.title}>З поверненням</h1>
        <p className={styles.sub}>Увійдіть до свого акаунту Kindora</p>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className="input-label">Електронна пошта</label>
            <input
              className="input"
              type="email"
              name="email"
              placeholder="ви@приклад.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Пароль</span>
              <span
                style={{ color: 'var(--pk1)', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
                onClick={() => onNavigate('forgot-password')}
              >
                Забули пароль?
              </span>
            </label>
            <input
              className="input"
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.checkRow}>
            <input
              type="checkbox"
              id="remember"
              name="remember"
              checked={form.remember}
              onChange={handleChange}
              style={{ accentColor: 'var(--pk1)' }}
            />
            <label htmlFor="remember" style={{ fontSize: 13, color: 'var(--text2)' }}>
              Запам'ятати мене на 30 днів
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: 13, borderRadius: 12 }}
          >
            {loading ? 'Вхід…' : 'Увійти'}
          </Button>
        </form>



        <p className={styles.switchLink}>
          Немає акаунту?{' '}
          <span onClick={() => onNavigate('register')}>Створити</span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
