
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { User, AuthState } from './types';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });

  const handleLogin = (user: User) => {
    setAuth({
      user,
      isAuthenticated: true,
    });
    localStorage.setItem('acertax_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setAuth({ user: null, isAuthenticated: false });
    localStorage.removeItem('acertax_user');
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('acertax_user');
    if (savedUser) {
      setAuth({
        user: JSON.parse(savedUser),
        isAuthenticated: true,
      });
    }
  }, []);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50">
      {!auth.isAuthenticated ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard user={auth.user!} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default App;
