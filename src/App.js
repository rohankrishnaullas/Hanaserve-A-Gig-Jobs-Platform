import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Hana from './components/Hana';
import Profile from './components/Profile';
import JobNotifications from './components/JobNotifications';
import DebugPage from './components/DebugPage';
import Community from './components/Community';
import Login from './components/Login';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { getUserRole, getCurrentUser, setCurrentUser, clearCurrentUser } from './utils/storage';
import { logEvent, logTrace, setUserContext } from './utils/appInsights';
import apiService from './services/apiService';

// Google OAuth Client ID from environment variable
// Create a .env file and add: REACT_APP_GOOGLE_CLIENT_ID=your-client-id
// See GOOGLE_OAUTH_SETUP.md for instructions on obtaining your own Client ID
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState('hana'); // 'hana', 'profile', 'matches', 'community', 'resources', 'debug'
  const [userId, setUserId] = useState(null);
  const [currentUser, setCurrentUserState] = useState(null);

  useEffect(() => {
    // Check if already logged in this session
    const sessionLogin = sessionStorage.getItem('gig_jobs_logged_in');
    const savedUser = getCurrentUser();
    
    if (sessionLogin === 'true' && savedUser) {
      setIsLoggedIn(true);
      setCurrentUserState(savedUser);
      logTrace('User session restored', 1, { sessionId: sessionLogin });
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn || !currentUser) return;
    
    // Use existing user ID or generate new one based on auth method
    let id = currentUser.id;
    
    // For backward compatibility, check if there's an old user ID
    const oldUserId = localStorage.getItem('gig_jobs_user_id');
    if (oldUserId && !currentUser.authMethod) {
      id = oldUserId;
    } else if (!id) {
      id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem('gig_jobs_user_id', id);
    }
    
    setUserId(id);
    // Set user context in Application Insights (non-anonymized)
    setUserContext(id);

    // Check if user has a saved role (for future use)
    const savedRole = getUserRole(id);
    console.log('User role:', savedRole);
  }, [isLoggedIn, currentUser]);

  const handleLogin = (success, userData) => {
    if (success) {
      setIsLoggedIn(true);
      setCurrentUserState(userData);
      sessionStorage.setItem('gig_jobs_logged_in', 'true');
      setCurrentUser(userData);
      
      logEvent('UserLogin', { 
        timestamp: new Date().toISOString(),
        authMethod: userData?.authMethod || 'legacy',
        sessionId: sessionStorage.getItem('gig_jobs_logged_in')
      });
    }
  };

  const handleLogout = () => {
    // Clear session data
    sessionStorage.removeItem('gig_jobs_logged_in');
    clearCurrentUser(); // Clear user data from localStorage
    apiService.logout(); // Clear API tokens

    // Log the logout event
    logEvent('UserLogout', {
      timestamp: new Date().toISOString(),
      userId: userId
    });

    // Reset state
    setIsLoggedIn(false);
    setCurrentUserState(null);
    setUserId(null);
    setView('hana');
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const handleViewChange = (newView) => {
    setView(newView);
    logEvent('ViewChanged', { previousView: view, newView, userId });
  };

  const handleProviderComplete = () => {
    setView('matches');
  };

  const handleJobCreated = (jobData) => {
    // Job created successfully
    console.log('Job created:', jobData);
    logEvent('JobCreated', { jobId: jobData?.id, userId, category: jobData?.category });
    setView('matches');
  };

  // Main app with sidebar
  return (
    <div className="App">
      <Sidebar 
        currentView={view}
        onViewChange={handleViewChange}
        onDebugClick={() => setView('debug')}
        onLogout={handleLogout}
      />
      <main className="App-main-with-sidebar">
        {view === 'hana' && (
          <Hana 
            userId={userId}
            onComplete={handleProviderComplete}
            onJobCreated={handleJobCreated}
          />
        )}
        
        {view === 'matches' && (
          <JobNotifications providerId={userId} />
        )}
        
        {view === 'community' && (
          <Community />
        )}
        
        {view === 'profile' && (
          <Profile userId={userId} currentUser={currentUser} />
        )}
        
        {view === 'resources' && (
          <div className="placeholder-view">
            <h1>Resources</h1>
            <p>Helpful resources and guides coming soon...</p>
          </div>
        )}
        
        {view === 'debug' && (
          <DebugPage />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AppContent />
    </GoogleOAuthProvider>
  );
}

export default App;
