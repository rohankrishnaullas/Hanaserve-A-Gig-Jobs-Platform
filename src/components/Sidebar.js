import React from 'react';
import './Sidebar.css';

const Sidebar = ({ currentView, onViewChange, onDebugClick, onLogout }) => {
  const menuItems = [
    { id: 'hana', label: 'Hana', icon: '🌸' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'matches', label: 'Matches', icon: '⭐' },
    { id: 'community', label: 'Community', icon: '👥' },
    { id: 'resources', label: 'Resources', icon: '📚' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">HS</div>
          <h2>Hanaserve</h2>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
        {/* Mobile logout button - shown as navigation item on mobile */}
        {onLogout && (
          <button
            className="sidebar-nav-item mobile-logout-nav-item"
            onClick={onLogout}
            title="Logout"
          >
            <span className="nav-icon">🚪</span>
            <span className="nav-label">Logout</span>
          </button>
        )}
      </nav>

      <div className="sidebar-help">
        <div className="help-box">
          <h4>Need Immediate Help?</h4>
          <p>Call our 24/7 support line</p>
          <a href="tel:9777662802" className="help-phone">9777662802</a>
        </div>
      </div>

      <div className="sidebar-footer">
        {onLogout && (
          <button className="logout-button desktop-logout-button" onClick={onLogout} title="Logout">
            🚪 Logout
          </button>
        )}
        {onDebugClick && (
          <button className="debug-link" onClick={onDebugClick} title="Debug Console">
            🔧 Debug
          </button>
        )}
        <p className="created-by">
          Created by<br />
          <strong>Rohan Krishna Ullas</strong><br />
          <a href="mailto:rohankrishnaullas@gmail.com" className="creator-email">
            rohankrishnaullas@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
