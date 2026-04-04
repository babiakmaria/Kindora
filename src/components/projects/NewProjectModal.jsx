import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import styles from './NewProjectModal.module.css';

const ICON_OPTIONS = [
  'CP', 'CL', 'YK', 'RD', 'AT', 'NS', 'RB', 'CF',
  'GD', 'SP', 'AR', 'ED', 'EN', 'CW', 'DA', 'BD',
];

const EMPTY_FORM = {
  title: '',
  startDate: '',
  endDate: '',
  admin: 'Анна К.',
  icon: 'GD',
  iconBg: '#EAF7F0',
};

const ICON_BG_MAP = {
  'CP': '#EAF7F0', 'CL': '#FFF0F5', 'YK': '#FFF8E1', 'RD': '#EAF7F0',
  'AT': '#FFF0F5', 'NS': '#EAF7F0', 'RB': '#FFF0F5', 'CF': '#EAF7F0',
  'GD': '#EAF7F0', 'SP': '#FFF8E1', 'AR': '#FFF0F5', 'ED': '#FFF8E1',
  'EN': '#EAF7F0', 'CW': '#FFF0F5', 'DA': '#F0F4FF', 'BD': '#FFF8E1',
};

const validate = (form) => {
  const errors = {};
  if (!form.title.trim()) {
    errors.title = 'Назва проєкту обов`язкова.';
  } else if (form.title.trim().length < 3) {
    errors.title = 'Назва проєкту має містити щонайменше 3 символи.';
  }
  if (!form.startDate) {
    errors.startDate = 'Дата початку обов`язкова.';
  }
  if (form.endDate && form.startDate && form.endDate < form.startDate) {
    errors.endDate = 'Дата завершення має бути після дати початку.';
  }
  return errors;
};

const NewProjectModal = ({ isOpen, onClose, onSubmit, currentUser = 'Анна К.' }) => {
  const [form, setForm]     = useState({ ...EMPTY_FORM, admin: currentUser });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);
    if (submitted) setErrors(validate(updated));
  };

  const handleIconSelect = (abbr) => {
    setForm((prev) => ({ ...prev, icon: abbr, iconBg: ICON_BG_MAP[abbr] || '#EAF7F0' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const newProject = {
      id: Date.now(),
      icon: form.icon,
      iconBg: form.iconBg,
      title: form.title.trim(),
      desc: `Керується ${form.admin}. Розпочато ${form.startDate}.`,
      status: 'new',
      statusLabel: 'Новий',
      category: 'Загальне',
      members: 1,
      memberColors: ['#FF6B9D'],
      progress: 0,
      due: form.endDate
        ? new Date(form.endDate).toLocaleDateString('uk-UA', { month: 'short', day: 'numeric' })
        : 'TBD',
      joined: true,
      startDate: form.startDate,
      endDate: form.endDate || null,
      admin: form.admin,
    };

    onSubmit(newProject);

    setForm({ ...EMPTY_FORM, admin: currentUser });
    setErrors({});
    setSubmitted(false);
    onClose();
  };

  const handleClose = () => {
    setForm({ ...EMPTY_FORM, admin: currentUser });
    setErrors({});
    setSubmitted(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Створити новий проєкт" size="md">
      <form onSubmit={handleSubmit} noValidate>

        {/* Project icon picker */}
        <div className={styles.field}>
          <label className={styles.label}>Іконка проєкту</label>
          <div className={styles.iconGrid}>
            {ICON_OPTIONS.map((abbr) => (
              <button
                key={abbr}
                type="button"
                className={`${styles.iconBtn} ${form.icon === abbr ? styles.iconBtnSelected : ''}`}
                style={form.icon === abbr ? { background: ICON_BG_MAP[abbr] } : {}}
                onClick={() => handleIconSelect(abbr)}
                aria-label={`Обрати іконку ${abbr}`}
              >
                {abbr}
              </button>
            ))}
          </div>
        </div>

        {/* Project name */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="proj-title">
            Назва проєкту <span className={styles.required}>*</span>
          </label>
          <input
            id="proj-title"
            name="title"
            className={`input ${errors.title ? styles.inputError : ''}`}
            placeholder="напр. Ініціатива громадського саду"
            value={form.title}
            onChange={handleChange}
            autoFocus
          />
          {errors.title && <p className={styles.errorMsg}>{errors.title}</p>}
        </div>

        {/* Date row */}
        <div className={styles.dateRow}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="proj-start">
              Дата початку <span className={styles.required}>*</span>
            </label>
            <input
              id="proj-start"
              name="startDate"
              type="date"
              className={`input ${errors.startDate ? styles.inputError : ''}`}
              value={form.startDate}
              onChange={handleChange}
            />
            {errors.startDate && <p className={styles.errorMsg}>{errors.startDate}</p>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="proj-end">
              Дата завершення <span className={styles.optional}>(необов'язково)</span>
            </label>
            <input
              id="proj-end"
              name="endDate"
              type="date"
              className={`input ${errors.endDate ? styles.inputError : ''}`}
              value={form.endDate}
              onChange={handleChange}
              min={form.startDate || undefined}
            />
            {errors.endDate && <p className={styles.errorMsg}>{errors.endDate}</p>}
          </div>
        </div>

        {/* Admin (read-only) */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="proj-admin">Адміністратор</label>
          <div className={styles.adminRow}>
            <div
              className="avatar"
              style={{
                background: 'linear-gradient(135deg,#FF6B9D,#4CAF7D)',
                width: 32, height: 32, fontSize: 11, flexShrink: 0,
              }}
            >
              {currentUser.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <input
              id="proj-admin"
              name="admin"
              className="input"
              value={form.admin}
              readOnly
              style={{ background: '#F8F9FA', color: 'var(--text2)', cursor: 'default' }}
            />
          </div>
          <p className={styles.hint}>Адміністратором проєкту за замовчуванням є поточний користувач.</p>
        </div>

        {/* Preview */}
        <div className={styles.preview}>
          <div className={styles.previewIcon} style={{ background: ICON_BG_MAP[form.icon] || '#EAF7F0' }}>
            {form.icon}
          </div>
          <div>
            <p className={styles.previewTitle}>{form.title || 'Назва вашого проєкту'}</p>
            <p className={styles.previewMeta}>
              {form.startDate ? `Початок ${form.startDate}` : 'Дата початку не вказана'}
              {form.endDate ? ` · Кінець ${form.endDate}` : ''}
            </p>
          </div>
          <span className="badge badge-pink" style={{ marginLeft: 'auto' }}>Новий</span>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={handleClose}>
            Скасувати
          </Button>
          <Button type="submit" variant="primary">
            Створити проєкт
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default NewProjectModal;
