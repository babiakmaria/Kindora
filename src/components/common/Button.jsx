import React from 'react';

/**
 * Button
 * @param {'primary'|'secondary'|'outline'|'ghost'} variant
 * @param {boolean} sm  — small size
 */
const Button = ({ variant = 'primary', sm = false, children, onClick, style, className = '', type = 'button' }) => {
  const cls = ['btn', `btn-${variant}`, sm ? 'btn-sm' : '', className].filter(Boolean).join(' ');
  return (
    <button type={type} className={cls} onClick={onClick} style={style}>
      {children}
    </button>
  );
};

export default Button;
