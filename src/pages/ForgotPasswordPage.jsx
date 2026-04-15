import React, { useState } from 'react';
import Button from '../components/common/Button';
import styles from './AuthPage.module.css';

const ForgotPasswordPage = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState('form'); // form or sent
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email.trim()) {
      setError('Введіть адресу електронної пошти');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Некоректний формат електронної пошти');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Demo: treat 'notfound@test.com' as unknown email
      if (email.toLowerCase() === 'notfound@test.com') {
        setError('Акаунт з такою поштою не знайдено');
        return;
      }
      setStep('sent');
    }, 900);
  };

  const handleResend = () => {
    setStep('form');
    setError('');
  };

  // show this after the email is sent successfully
  if (step === 'sent') {
    return (
      <div className={styles.wrap}>
        <div className={styles.blob1} />
        <div className={styles.blob2} />

        <div className={styles.card}>

          <div style={{ textAlign: 'center', margin: '4px 0 24px' }}>
            <h1 className={styles.title}>Перевірте пошту</h1>
            <p className={styles.sub} style={{ marginBottom: 0 }}>
              Інструкції для відновлення пароля були надіслані на
            </p>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text1)', marginTop: 4, marginBottom: 0, wordBreak: 'break-word' }}>
              {email}
            </p>
          </div>

          <div style={{
            background: 'transparent',
            border: '1px solid var(--pk2)',
            borderRadius: 12,
            padding: '14px 16px',
            marginBottom: 20,
            fontSize: 13,
            color: 'var(--text2)',
            lineHeight: 1.6,
          }}>
            Посилання дійсне протягом <strong>24 годин</strong>.
            Якщо лист не прийшов — перевірте папку «Спам» або{' '}
            <span
              style={{ color: 'var(--pk1)', fontWeight: 600, cursor: 'pointer' }}
              onClick={handleResend}
            >
              перевірте введений email
            </span>.
          </div>

          <Button
            variant="primary"
            style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: 13, borderRadius: 12 }}
            onClick={() => onNavigate('login')}
          >
            Повернутися до входу
          </Button>

          <p className={styles.switchLink} style={{ marginTop: 16 }}>
            Не отримали лист?{' '}
            <span onClick={handleResend}>Надіслати повторно</span>
          </p>
        </div>
      </div>
    );
  }

  // main email input form
  return (
    <div className={styles.wrap}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />

      <div className={styles.card}>
        <h1 className={styles.title}>Відновити пароль</h1>
        <p className={styles.sub}>
          Введіть email — ми надішлемо посилання для скидання пароля
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.formGroup}>
            <label className="input-label">Електронна пошта</label>
            <input
              className="input"
              type="email"
              placeholder="ви@приклад.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              style={error ? { borderColor: '#EF4444', boxShadow: '0 0 0 3px rgba(239,68,68,0.1)' } : {}}
              autoFocus
            />
            {error && (
              <p style={{ fontSize: 12, color: '#EF4444', marginTop: 6, fontWeight: 500 }}>
                {error}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: 13, borderRadius: 12 }}
          >
            {loading ? 'Надсилання…' : 'Надіслати посилання'}
          </Button>
        </form>

        <p className={styles.switchLink}>
          Згадали пароль?{' '}
          <span onClick={() => onNavigate('login')}>Увійти</span>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
