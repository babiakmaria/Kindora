import React from 'react';

const Avatar = ({ initials = '?', gradient, size = 36, style }) => {
  const defaultGradient = 'linear-gradient(135deg, #FF6B9D, #4CAF7D)';
  return (
    <div
      className="avatar"
      style={{
        background: gradient || defaultGradient,
        width: size,
        height: size,
        fontSize: size * 0.35,
        ...style,
      }}
    >
      {initials}
    </div>
  );
};

export default Avatar;
