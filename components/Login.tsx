import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Domain validation to ensure only corporate emails are used
    if (!email.trim().toLowerCase().endsWith('@acertax.com')) {
      setError('Unauthorized domain. Please use your @acertax.com email.');
      return;
    }

    setLoading(true);

    // Standard Supabase Email/Password Authentication
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
    // Note: onAuthStateChange in App.tsx will handle the redirect if successful
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-700">
        <div className="p-10 flex flex-col items-center">
          
          {/* Acertax Logo Section */}
          <div className="mb-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-orange-600 rounded-3xl flex items-center justify-center shadow-xl shadow-orange-200 mb-6 group transition-all duration-500 hover:scale-110">
              <svg className="w-10 h-10 text-white transform group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Acertax Connect</h1>
            <p className="text-slate-400 font-semibold text-[10px] uppercase tracking-[0.25em] mt-3">Employee Workspace</p>
          </div>

          <div className="w-full">
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Corporate Email</label>
                <div className="relative group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@acertax.com"
                    autoFocus
                    required
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-orange-600 focus:bg-white focus:ring-4 focus:ring-orange-100 outline-none transition-all text-slate-800 font-medium placeholder:text-slate-300"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-orange-600 focus:bg-white focus:ring-4 focus:ring-orange-100 outline-none transition-all text-slate-800 font-medium placeholder:text-slate-300"
                  />
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-[13px] rounded-2xl flex items-center gap-3 animate-in shake duration-300">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl shadow-xl shadow-orange-100 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    "Login to Workspace"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Policy Footer */}
        <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
          <p className="text-[9px] text-slate-400 font-bold leading-relaxed max-w-[280px] mx-auto uppercase tracking-wider">
            Authorized for Acertax Inc. employees only. Corporate IT security policies apply.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;