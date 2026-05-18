import React from 'react';

const COLOR_MAP = {
  active:        '#4CAF7D',
  new:           '#FF6B9D',
  'in-progress': '#F59E0B',
  in_progress:   '#F59E0B',
  completed:     '#9CA3AF',
};

/**
 * ProgressBar
 * @param {number} value  — 0-100
 * @param {string} status — maps to color
 * @param {string} color  — explicit hex override
 */
const ProgressBar = ({ value = 0, status, color }) => {
  const fillColor = color || COLOR_MAP[status] || '#4CAF7D';

  return (
    <div>
      <div className="prog-lbl">
        <span>Прогрес</span>
        <span style={{ fontWeight: 600, color: 'var(--text1)' }}>{value}%</span>
      </div>
      <div className="prog-bar">
        <div className="prog-fill" style={{ width: `${value}%`, background: fillColor }} />
      </div>
    </div>
  );
};

export default ProgressBar;
