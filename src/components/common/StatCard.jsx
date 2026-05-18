import React from 'react';

const StatCard = ({ label, value, accent, highlight = false }) => (
  <div
    className="stat-card"
    style={accent ? { borderLeft: `4px solid ${accent}` } : undefined}
  >
    <div className="stat-label">{label}</div>
    <div className="stat-num" style={highlight ? { color: 'var(--pk1)' } : undefined}>
      {value}
    </div>
  </div>
);

export default StatCard;
