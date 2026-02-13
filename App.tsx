import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { User, AuthState } from './types';
import { supabase } from './services/supabaseClient';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check for an active session on mount
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        handleSupabaseUser(session.user);
      }
      setLoading(false);
    };

    checkUser();

    // 2. Listen for Auth changes (Sign In, Sign Out, Magic Link clicked)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        handleSupabaseUser(session.user);
      } else {
        setAuth({ user: null, isAuthenticated: false });
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSupabaseUser = (supabaseUser: any) => {
    const handle = supabaseUser.email.split('@')[0];
    const nameParts = handle.includes('.') ? handle.split('.') : [handle, ''];
    const firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
    const lastName = nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : '';

    const formattedUser: User = {
      id: supabaseUser.id,
      name: `${firstName} ${lastName}`.trim() || 'Colleague',
      email: supabaseUser.email,
      avatar: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=ea580c&color=fff&size=128&bold=true`,
      status: 'online',
    };

    setAuth({
      user: formattedUser,
      isAuthenticated: true,
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuth({ user: null, isAuthenticated: false });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full gap-4">
        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Verifying Connection...</p>
      </div>
    );
  }

  // Removed the extra wrapping div h-screen bg-slate-50 to let index.html handle centering
  return (
    <>
      {!auth.isAuthenticated ? (
        <Login onLogin={() => {}} /> 
      ) : (
        <Dashboard user={auth.user!} onLogout={handleLogout} />
      )}
    </>
  );
};

export default App;