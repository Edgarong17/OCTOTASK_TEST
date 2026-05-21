import React from 'react';
import './Background.css';

function Background({ children, isAuthenticated }) {
  const content = children;

  return (
    <div className="background-wrapper">
      <div className={`background-layer${isAuthenticated ? ' background-layer-authenticated' : ''}`} />
      <div className="background-content">{content}</div>
    </div>
  );
}

export default Background;
