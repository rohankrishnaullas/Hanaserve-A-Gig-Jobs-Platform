// LocalStorage utilities for V0.1

const STORAGE_KEYS = {
  PROVIDERS: 'gig_jobs_providers',
  REQUESTERS: 'gig_jobs_requesters',
  JOBS: 'gig_jobs_listings',
  MATCHES: 'gig_jobs_matches',
  USER_ROLE: 'gig_jobs_user_role',
  USER_SETUP_COMPLETE: 'gig_jobs_user_setup_complete',
  CONVERSATIONS: 'gig_jobs_conversations',
  USER_PROFILES: 'gig_jobs_user_profiles',
  AUTH_USERS: 'gig_jobs_auth_users',
  CURRENT_USER: 'gig_jobs_current_user'
};

export const saveProvider = (providerData) => {
  const providers = getProviders();
  const existingIndex = providers.findIndex(p => p.id === providerData.id);
  
  if (existingIndex >= 0) {
    providers[existingIndex] = providerData;
  } else {
    providers.push(providerData);
  }
  
  localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(providers));
  return providerData;
};

export const getProviders = () => {
  const data = localStorage.getItem(STORAGE_KEYS.PROVIDERS);
  return data ? JSON.parse(data) : [];
};

export const getProviderById = (id) => {
  const providers = getProviders();
  return providers.find(p => p.id === id);
};

export const saveJobRequest = (jobRequest) => {
  const jobs = getJobRequests();
  jobs.push(jobRequest);
  localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
  return jobRequest;
};

export const getJobRequests = () => {
  const data = localStorage.getItem(STORAGE_KEYS.JOBS);
  return data ? JSON.parse(data) : [];
};

export const updateJobRequest = (jobId, updates) => {
  const jobs = getJobRequests();
  const index = jobs.findIndex(j => j.id === jobId);
  if (index >= 0) {
    jobs[index] = { ...jobs[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
    return jobs[index];
  }
  return null;
};

export const saveMatch = (match) => {
  const matches = getMatches();
  matches.push(match);
  localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
  return match;
};

export const getMatches = () => {
  const data = localStorage.getItem(STORAGE_KEYS.MATCHES);
  return data ? JSON.parse(data) : [];
};

export const getMatchesForProvider = (providerId) => {
  const matches = getMatches();
  return matches.filter(m => m.providerId === providerId && m.status === 'pending');
};

export const getMatchesForJob = (jobId) => {
  const matches = getMatches();
  return matches.filter(m => m.jobId === jobId);
};

// User role preference storage
export const saveUserRole = (userId, role) => {
  const userRoles = getUserRoles();
  userRoles[userId] = role;
  localStorage.setItem(STORAGE_KEYS.USER_ROLE, JSON.stringify(userRoles));
  return role;
};

export const getUserRole = (userId) => {
  const userRoles = getUserRoles();
  return userRoles[userId] || null;
};

export const getUserRoles = () => {
  const data = localStorage.getItem(STORAGE_KEYS.USER_ROLE);
  return data ? JSON.parse(data) : {};
};

export const setUserSetupComplete = (userId, complete = true) => {
  const setupStatus = getSetupStatus();
  setupStatus[userId] = complete;
  localStorage.setItem(STORAGE_KEYS.USER_SETUP_COMPLETE, JSON.stringify(setupStatus));
};

export const isUserSetupComplete = (userId) => {
  const setupStatus = getSetupStatus();
  return setupStatus[userId] === true;
};

export const getSetupStatus = () => {
  const data = localStorage.getItem(STORAGE_KEYS.USER_SETUP_COMPLETE);
  return data ? JSON.parse(data) : {};
};

export const saveConversationRecord = (record) => {
  const records = getConversationRecords();
  records.push(record);
  localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(records));
  return record;
};

export const getConversationRecords = () => {
  const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
  return data ? JSON.parse(data) : [];
};

export const getConversationsForUser = (userId) => {
  const records = getConversationRecords();
  return records.filter(r => r.userId === userId);
};

// User profile storage
export const saveUserProfile = (userId, profileData) => {
  const profiles = getUserProfiles();
  profiles[userId] = {
    ...profiles[userId],
    ...profileData,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.USER_PROFILES, JSON.stringify(profiles));
  return profiles[userId];
};

export const getUserProfile = (userId) => {
  const profiles = getUserProfiles();
  return profiles[userId] || null;
};

export const getUserProfiles = () => {
  const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILES);
  return data ? JSON.parse(data) : {};
};

// Convenience functions for debug page
export const getAllMatches = () => getMatches();
export const getAllConversations = () => getConversationRecords();

// Authentication storage functions
// WARNING: This implementation stores passwords in plain text in localStorage
// This is acceptable for a demo/prototype, but in production:
// - Use proper backend authentication with secure password hashing (bcrypt, Argon2)
// - Never store passwords in localStorage or client-side storage
// - Use secure session tokens or JWT with httpOnly cookies
export const saveAuthUser = (userData) => {
  const users = getAuthUsers();
  const existingIndex = users.findIndex(u => 
    (u.email && userData.email && u.email === userData.email) || 
    (u.username && userData.username && u.username === userData.username)
  );
  
  if (existingIndex >= 0) {
    // For updates, ensure email and username uniqueness
    const existingUser = users[existingIndex];
    
    // Check if trying to update to an email that belongs to another user
    if (userData.email && userData.email !== existingUser.email) {
      const emailConflict = users.find((u, idx) => idx !== existingIndex && u.email === userData.email);
      if (emailConflict) {
        throw new Error('Email already exists');
      }
    }
    
    // Check if trying to update to a username that belongs to another user
    if (userData.username && userData.username !== existingUser.username) {
      const usernameConflict = users.find((u, idx) => idx !== existingIndex && u.username === userData.username);
      if (usernameConflict) {
        throw new Error('Username already exists');
      }
    }
    
    users[existingIndex] = { ...users[existingIndex], ...userData, updatedAt: new Date().toISOString() };
  } else {
    users.push({ ...userData, createdAt: new Date().toISOString() });
  }
  
  localStorage.setItem(STORAGE_KEYS.AUTH_USERS, JSON.stringify(users));
  return userData;
};

export const getAuthUsers = () => {
  const data = localStorage.getItem(STORAGE_KEYS.AUTH_USERS);
  return data ? JSON.parse(data) : [];
};

export const getAuthUserByEmail = (email) => {
  const users = getAuthUsers();
  return users.find(u => u.email === email);
};

export const getAuthUserByUsername = (username) => {
  const users = getAuthUsers();
  return users.find(u => u.username === username);
};

export const validateUserCredentials = (username, password) => {
  const user = getAuthUserByUsername(username);
  // WARNING: Plain text password comparison - not secure for production
  return user && user.password === password ? user : null;
};

export const setCurrentUser = (userData) => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userData));
};

export const getCurrentUser = () => {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
};

export const clearCurrentUser = () => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};
