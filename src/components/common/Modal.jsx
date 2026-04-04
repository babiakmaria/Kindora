import React, { useEffect, useCallback } from 'react';
import styles from './Modal.module.css';

/**
 * Reusable Modal
 *
 * @param {boolean}  isOpen    — controls visibility
 * @param {function} onClose   — called when backdrop or × is clicked
 * @param {string}   title     — modal header text
 * @param {node}     children  — modal body content
 * @param {string}   size      — 'sm' | 'md' (default) | 'lg'
 */
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  // Close on Escape key
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={`${styles.panel} ${styles[size]}`}>
        {/* Header */}
        <div className={styles.header}>
          <h2 id="modal-title" className={styles.title}>{title}</h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Закрити"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13"
                stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
