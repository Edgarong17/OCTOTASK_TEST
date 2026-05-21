import React from 'react';
import './headerStart.css';

function HeaderStart({ vista = 'register', onNavigate }) {
  return (
    <header className="header-start" data-vista={vista}>
        <div className="logoSymbol" />
        <h1 className="headerText"><span className="headerTextOcto">OCTO</span>Task</h1>
        {vista === 'register' && (
            <button type="button" className="headerButton" onClick={() => onNavigate('login')}>
                Log In
            </button>
        )}
        {vista === 'login' && (
            <button type="button" className="headerButton" onClick={() => onNavigate('register')}>
                Create Account
            </button>
        )}
    </header>
  );
}

export default HeaderStart;