
import React, { useState } from 'react';
import './Login.css';
import Footer from './Footer';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import apiService from '../services/apiService';
import {
  saveAuthUser,
  getAuthUserByUsername,
  getAuthUserByEmail,
  validateUserCredentials,
  setCurrentUser
} from '../utils/storage';

const Login = ({ onLogin }) => {
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Try backend API first
      try {
        const response = await apiService.googleAuth(credentialResponse.credential);
        const userData = {
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.fullName,
          picture: response.data.user.profilePictureUrl,
          authMethod: 'google',
          loginAt: new Date().toISOString(),
          backendUser: response.data.user
        };

        saveAuthUser(userData);
        setCurrentUser(userData);
        onLogin(true, userData);
        return;
      } catch (apiError) {
        console.warn('Backend auth failed, using local auth:', apiError.message);
      }

      // Fallback to local auth if backend unavailable
      const decoded = jwtDecode(credentialResponse.credential);
      const userData = {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        authMethod: 'google',
        loginAt: new Date().toISOString()
      };

      saveAuthUser(userData);
      setCurrentUser(userData);
      onLogin(true, userData);
    } catch (error) {
      console.error('Google login error:', error);
      setError('Failed to sign in with Google. Please try again.');
    }
  };

  const handleGoogleError = () => {
    setError('Google sign-in was cancelled or failed. Please try again.');
  };

  const handleTraditionalLogin = async (e) => {
    e.preventDefault();
    setError('');

    // For login, use email field (which is set from the login form's email input)
    const loginEmail = isCreatingAccount ? email : username; // In login mode, username field holds email
    if (!loginEmail || !password) {
      setError('Please enter both email and password');
      return;
    }

    // Try backend API first
    try {
      const response = await apiService.login(loginEmail, password);
      const userData = {
        id: response.data.user.id,
        email: response.data.user.email,
        name: response.data.user.fullName,
        username: username,
        authMethod: 'traditional',
        loginAt: new Date().toISOString(),
        backendUser: response.data.user
      };
      setCurrentUser(userData);
      onLogin(true, userData);
      return;
    } catch (apiError) {
      console.warn('Backend login failed:', apiError.message);
      // Fall through to local auth
    }

    // Fallback to local auth if backend unavailable
    const user = validateUserCredentials(username, password);
    if (user) {
      const userData = {
        ...user,
        loginAt: new Date().toISOString()
      };
      setCurrentUser(userData);
      onLogin(true, userData);
    } else {
      setError('Incorrect username or password');
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 5) {
      setError('Password must be at least 5 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Try backend API first
    try {
      const response = await apiService.register(email, password, username);
      const userData = {
        id: response.data.user.id,
        username,
        email,
        authMethod: 'traditional',
        createdAt: new Date().toISOString(),
        backendUser: response.data.user
      };

      saveAuthUser(userData);
      setSuccess('Account created successfully! You can now sign in.');

      // Clear form and switch to login mode
      setTimeout(() => {
        setIsCreatingAccount(false);
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setSuccess('');
      }, 2000);
      return;
    } catch (apiError) {
      console.warn('Backend registration failed:', apiError.message);
      // Fall through to local registration
    }

    // Fallback to local registration if backend unavailable
    // Check for duplicate username
    const existingUserByUsername = getAuthUserByUsername(username);
    if (existingUserByUsername) {
      setError('Username already exists. Please choose a different username.');
      return;
    }

    // Check for duplicate email
    const existingUserByEmail = getAuthUserByEmail(email);
    if (existingUserByEmail) {
      setError('Email already exists. Please use a different email or sign in.');
      return;
    }

    const userData = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      username,
      email,
      password,
      authMethod: 'traditional',
      createdAt: new Date().toISOString()
    };

    saveAuthUser(userData);
    setSuccess('Account created successfully! You can now sign in.');

    // Clear form and switch to login mode
    setTimeout(() => {
      setIsCreatingAccount(false);
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setSuccess('');
    }, 2000);
  };

  return (
    <div className="login-root">
      <div className="login-left">
        <img src="/HanaserveLogo.svg" alt="Hanaserve Logo" className="login-logo" />
        <div className="login-core-text">
          <h1 className="hanaserve-title">Hanaserve</h1>
          <p className="core-desc">Empowering you to find, hire, and work on your terms.<br/>Voice-Enabled Gig Marketplace.</p>
        </div>
      </div>
      <div className="login-right">
        <div className="login-box">
          <h2 className="login-title">
            {isCreatingAccount ? 'Create Account' : 'Sign in to Hanaserve'}
          </h2>
          
          {!isCreatingAccount && (
            <>
              <div className="google-login-container">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  theme="filled_blue"
                  size="large"
                  width="100%"
                />
              </div>
              
              <div className="divider">
                <span>OR</span>
              </div>
            </>
          )}

          <form onSubmit={isCreatingAccount ? handleCreateAccount : handleTraditionalLogin}>
            {isCreatingAccount ? (
              <>
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                  />
                </div>
              </>
            ) : (
              <div className="form-group">
                <label htmlFor="username">Email</label>
                <input
                  type="email"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter email"
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            </div>

            {isCreatingAccount && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                />
              </div>
            )}

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <button type="submit" className="login-button">
              {isCreatingAccount ? 'Create Account' : 'Log In'}
            </button>
          </form>

          <div className="toggle-mode">
            {isCreatingAccount ? (
              <p>
                Already have an account?{' '}
                <button 
                  type="button"
                  className="toggle-link" 
                  onClick={() => {
                    setIsCreatingAccount(false);
                    setError('');
                    setSuccess('');
                  }}
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{' '}
                <button 
                  type="button"
                  className="toggle-link" 
                  onClick={() => {
                    setIsCreatingAccount(true);
                    setError('');
                    setSuccess('');
                  }}
                >
                  Create Account
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
