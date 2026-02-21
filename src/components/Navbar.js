import React from 'react';
import './Navbar.css';

const Navbar = ({ currentRole, onRoleChange, onHomeClick, onDebugClick }) => {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand" onClick={onHomeClick}>
          <span>Hanaserve</span>
        </div>
        <div className="navbar-actions">
          <div className="role-switcher">
            <span className="role-label">I want to:</span>
            <button
              className={`role-switch-btn ${currentRole === 'provider' ? 'active' : ''}`}
              onClick={() => onRoleChange('provider')}
            >
              Work
            </button>
            <button
              className={`role-switch-btn ${currentRole === 'requester' ? 'active' : ''}`}
              onClick={() => onRoleChange('requester')}
            >
              Hire
            </button>
          </div>
          {onDebugClick && (
            <button className="debug-btn" onClick={onDebugClick} title="Debug Console">
              🔧
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


