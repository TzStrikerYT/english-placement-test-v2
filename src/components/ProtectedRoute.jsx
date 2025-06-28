import React, { useState, useEffect } from 'react';
import './ProtectedRoute.css';

function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  // Check if already authenticated (stored in sessionStorage)
  useEffect(() => {
    const authStatus = sessionStorage.getItem('reportingAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    
    // You can change this password to whatever you want
    const correctPassword = 'bilingues2024';
    
    if (password === correctPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('reportingAuth', 'true');
      setError('');
      setAttempts(0);
    } else {
      setAttempts(attempts + 1);
      setError(`Incorrect password. Attempts remaining: ${3 - attempts}`);
      
      if (attempts >= 2) {
        setError('Too many failed attempts. Please refresh the page.');
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('reportingAuth');
    setPassword('');
    setError('');
    setAttempts(0);
  };

  if (!isAuthenticated) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>🔒 Protected Access</h1>
            <p>Enter password to access Reporting & Certificates</p>
          </div>
          
          <form onSubmit={handleLogin} className="auth-form">
            <div className="password-input-group">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="password-input"
                required
                autoFocus
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <button type="submit" className="login-button">
              Access Reports
            </button>
          </form>
          
          <div className="auth-footer">
            <p>Contact administrator for access credentials</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="protected-content">
      <div className="auth-bar">
        <span>🔓 Authenticated</span>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
      {children}
    </div>
  );
}

export default ProtectedRoute; 