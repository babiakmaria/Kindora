import React from 'react';

const COLORS = {
  active:        'badge-green',
  new:           'badge-pink',
  'in-progress': 'badge-amber',
  in_progress:   'badge-amber',
  completed:     'badge-gray',
  green:         'badge-green',
  pink:          'badge-pink',
  amber:         'badge-amber',
  gray:          'badge-gray',
};

const DOT_COLORS = {
  active:        '#4CAF7D',
  new:           '#FF6B9D',
  'in-progress': '#F59E0B',
  in_progress:   '#F59E0B',
  completed:     '#9CA3AF',
};

/**
 * Badge — status or label pill
 * @param {string} status  — maps to color variant
 * @param {string} color   — explicit color key if different from status
 * @param {boolean} dot    — show status dot
 */
const Badge = ({ children, status, color, dot = false, style }) => {
  const key = status || color || 'gray';
  const cls = `badge ${COLORS[key] || 'badge-gray'}`;
  const dotColor = DOT_COLORS[key];

  return (
    <span className={cls} style={style}>
      {dot && dotColor && (
        <span className="badge-dot" style={{ background: dotColor }} />
      )}
      {children}
    </span>
  );
};

export default Badge;
