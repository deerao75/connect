
import React, { useState } from 'react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);

  const handleGoogleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    if (!showEmailInput) {
      setShowEmailInput(true);
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError('Please enter your corporate email.');
      return;
    }

    if (!trimmedEmail.endsWith('@acertax.com')) {
      setError('Unauthorized domain. Please use your @acertax.com Gmail ID.');
      return;
    }

    setLoading(true);
    
    // Simulate Secure SSO Handshake
    setTimeout(() => {
      const handle = trimmedEmail.split('@')[0];
      const nameParts = handle.includes('.') ? handle.split('.') : [handle, ''];
      const firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
      const lastName = nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : '';
      
      const mockUser: User = {
        id: `goog_${Math.random().toString(36).substr(2, 9)}`,
        name: `${firstName} ${lastName}`.trim(),
        email: trimmedEmail,
        avatar: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=ea580c&color=fff&size=128&bold=true`,
        status: 'online',
      };
      
      onLogin(mockUser);
      setLoading(false);
    }, 1800);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden">
      <div className="p-10 flex flex-col items-center">
        {/* Acertax Logo Section */}
        <div className="mb-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-orange-600 rounded-3xl flex items-center justify-center shadow-xl shadow-orange-200 mb-6 group transition-all duration-500 hover:scale-110">
            <svg className="w-10 h-10 text-white transform group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Acertax Connect</h1>
          <p className="text-slate-400 font-semibold text-xs uppercase tracking-[0.2em] mt-3">Employee Workspace</p>
        </div>

        <div className="w-full space-y-6">
          {!showEmailInput ? (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-slate-800">Welcome Back</h3>
                <p className="text-sm text-slate-500">Sign in with your corporate Gmail ID to start chatting with colleagues.</p>
              </div>
              
              <button
                onClick={() => setShowEmailInput(true)}
                className="w-full flex items-center justify-center gap-4 py-4 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95 group"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6 bg-white rounded-full p-0.5" />
                <span>Continue with Google</span>
              </button>
              
              <div className="flex items-center gap-3 justify-center py-2">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping"></span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Enterprise SSO Secure</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleGoogleLogin} className="space-y-5 animate-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Acertax Gmail ID</label>
                <div className="relative group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. j.doe@acertax.com"
                    autoFocus
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-orange-600 focus:bg-white focus:ring-4 focus:ring-orange-100 outline-none transition-all text-slate-800 font-medium placeholder:text-slate-300"
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                    </svg>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl flex items-center gap-3 animate-bounce-short">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">{error}</span>
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl shadow-xl shadow-orange-100 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    "Authorize & Connect"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowEmailInput(false); setError(''); }}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold py-2 transition-colors uppercase tracking-widest"
                >
                  Back
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      
      {/* Policy Footer */}
      <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
        <p className="text-[10px] text-slate-400 font-medium leading-relaxed max-w-[280px] mx-auto">
          Authorized for Acertax Inc. employees. By signing in, you agree to the Corporate IT Security Policy.
        </p>
      </div>
    </div>
  );
};

export default Login;
