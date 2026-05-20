import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import styles from './NewProjectModal.module.css';
import { fetchCategories } from '../../api/projects';
import { ICON_OPTIONS, ICON_BG_MAP, ProjectIcon } from '../../utils/projectIcon';

const EMPTY_FORM = {
  title:       '',
  description: '',
  location:    '',
  startDate:   '',
  endDate:     '',
  icon:        'Leaf',
  iconBg:      '#EAF7F0',
  categoryId:  '',
};

const validate = (form) => {
  const errors = {};
  if (!form.title.trim()) {
    errors.title = 'Назва проєкту обовʼязкова.';
  } else if (form.title.trim().length < 3) {
    errors.title = 'Назва проєкту має містити щонайменше 3 символи.';
  }
  if (!form.startDate) {
    errors.startDate = 'Дата початку обовʼязкова.';
  }
  if (form.endDate && form.startDate && form.endDate < form.startDate) {
    errors.endDate = 'Дата завершення має бути після дати початку.';
  }
  if (!form.location.trim()) {
    errors.location = 'Вкажіть місцезнаходження проєкту.';
  }
  if (!form.categoryId) {
    errors.categoryId = 'Оберіть категорію.';
  }
  return errors;
};

// currentUser: the logged-in user object from App state
const NewProjectModal = ({ isOpen, onClose, onSubmit, currentUser }) => {
  const [form,       setForm]       = useState({ ...EMPTY_FORM });
  const [errors,     setErrors]     = useState({});
  const [submitted,  setSubmitted]  = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [apiError,   setApiError]   = useState('');
  const [categories, setCategories] = useState([]);

  // Load categories when modal opens
  useEffect(() => {
    if (!isOpen) return;
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, [isOpen]);

  const displayName = currentUser
    ? `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim()
    : 'Ви';

  const initials = currentUser
    ? `${(currentUser.first_name || '')[0] || ''}${(currentUser.last_name || '')[0] || ''}`.toUpperCase()
    : '?';

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);
    if (submitted) setErrors(validate(updated));
    setApiError('');
  };

  const handleIconSelect = (iconName) => {
    setForm((prev) => ({ ...prev, icon: iconName, iconBg: ICON_BG_MAP[iconName] || '#EAF7F0' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    setApiError('');
    try {
      // Pass raw API-shaped data; App.jsx calls the API and maps the response
      await onSubmit({
        title:       form.title.trim(),
        description: form.description.trim() || undefined,
        location:    form.location.trim(),
        icon:        form.icon,
        icon_bg:     form.iconBg,
        category_id: Number(form.categoryId),
        start_date:  form.startDate || undefined,
        end_date:    form.endDate   || undefined,
      });
      handleClose();
    } catch (err) {
      setApiError(err.message || 'Не вдалося створити проєкт. Спробуйте ще раз.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setForm({ ...EMPTY_FORM });
    setErrors({});
    setSubmitted(false);
    setApiError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Створити новий проєкт" size="md">
      <form onSubmit={handleSubmit} noValidate>

        {/* Icon picker */}
        <div className={styles.field}>
          <label className={styles.label}>Іконка проєкту</label>
          <div className={styles.iconGrid}>
            {ICON_OPTIONS.map(({ name, bg }) => (
              <button
                key={name}
                type="button"
                className={`${styles.iconBtn} ${form.icon === name ? styles.iconBtnSelected : ''}`}
                style={{ background: form.icon === name ? bg : undefined }}
                onClick={() => handleIconSelect(name)}
                aria-label={`Обрати іконку ${name}`}
              >
                <ProjectIcon name={name} bg={form.icon === name ? bg : '#F3F4F6'} size={18} />
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
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

        {/* Location */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="proj-location">
            Місцезнаходження <span className={styles.required}>*</span>
          </label>
          <input
            id="proj-location"
            name="location"
            className={`input ${errors.location ? styles.inputError : ''}`}
            placeholder="напр. Київ, вул. Хрещатик 1"
            value={form.location}
            onChange={handleChange}
          />
          {errors.location && <p className={styles.errorMsg}>{errors.location}</p>}
        </div>

        {/* Description */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="proj-desc">
            Опис <span className={styles.optional}>(необов'язково)</span>
          </label>
          <textarea
            id="proj-desc"
            name="description"
            className="input"
            placeholder="Короткий опис мети та діяльності проєкту"
            value={form.description}
            onChange={handleChange}
            rows={3}
            style={{ resize: 'vertical', minHeight: 72 }}
          />
        </div>

        {/* Category */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="proj-category">
            Категорія <span className={styles.required}>*</span>
          </label>
          <select
            id="proj-category"
            name="categoryId"
            className={`input ${errors.categoryId ? styles.inputError : ''}`}
            value={form.categoryId}
            onChange={handleChange}
          >
            <option value="">Оберіть категорію…</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          {errors.categoryId && <p className={styles.errorMsg}>{errors.categoryId}</p>}
        </div>

        {/* Dates */}
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
          <label className={styles.label}>Адміністратор</label>
          <div className={styles.adminRow}>
            <div
              className="avatar"
              style={{
                background: 'linear-gradient(135deg,#FF6B9D,#4CAF7D)',
                width: 32, height: 32, fontSize: 11, flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <input
              className="input"
              value={displayName}
              readOnly
              style={{ background: '#F8F9FA', color: 'var(--text2)', cursor: 'default' }}
            />
          </div>
          <p className={styles.hint}>Адміністратором проєкту за замовчуванням є поточний користувач.</p>
        </div>

        {/* Preview */}
        <div className={styles.preview}>
          <div className={styles.previewIcon} style={{ background: ICON_BG_MAP[form.icon] || '#EAF7F0' }}>
            <ProjectIcon name={form.icon} bg={ICON_BG_MAP[form.icon] || '#EAF7F0'} size={20} />
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

        {apiError && (
          <p style={{ fontSize: 13, color: '#EF4444', marginBottom: 12, fontWeight: 500 }}>
            {apiError}
          </p>
        )}

        {/* Actions */}
        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={handleClose} disabled={saving}>
            Скасувати
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Створення…' : 'Створити проєкт'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default NewProjectModal;
