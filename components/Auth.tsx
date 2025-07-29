
import React, { useState } from 'react';
import type { User } from '../types';
import { authService } from '../services/authService';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
}

type AuthMode = 'signin' | 'signup';

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        const user = mode === 'signin'
            ? await authService.signIn(email, password)
            : await authService.signUp(email, password);
        onAuthSuccess(user);
    } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
        setIsLoading(false);
    }
  };
  
  const toggleMode = () => {
      setMode(prevMode => prevMode === 'signin' ? 'signup' : 'signin');
      setError('');
      setEmail('');
      setPassword('');
  }

  return (
    <div className="min-h-screen bg-dark-900 relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-800 via-dark-900 to-dark-950"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-glow-purple/10 rounded-full blur-3xl"></div>
      <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-glow-pink/10 rounded-full blur-3xl animate-float"></div>
      
      <div className="relative z-10 w-full max-w-md animate-scale-in">
        <div className="bg-dark-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl shadow-accent-500/10 p-8 relative overflow-hidden">
          {/* Card glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent-400/5 via-transparent to-glow-purple/5 rounded-3xl"></div>
          
          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="relative mb-4">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-400 via-accent-300 to-accent-500 font-mono tracking-tight">
                  ClubHub
                </h1>
                <div className="absolute inset-0 blur-lg bg-gradient-to-r from-accent-400/30 to-accent-300/30 -z-10 rounded"></div>
              </div>
              <p className="text-slate-400 font-medium">
                {mode === 'signin' ? 'Welcome back to your digital space' : 'Join your club community'}
              </p>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-slate-300 text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-dark-900/80 backdrop-blur-sm border border-slate-700/50 focus:border-accent-400/70 focus:ring-2 focus:ring-accent-400/20 text-white placeholder-slate-400 rounded-xl px-4 py-3 transition-all duration-300 outline-none shadow-inner"
                  placeholder="you@school.edu"
                  disabled={isLoading}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-slate-300 text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-dark-900/80 backdrop-blur-sm border border-slate-700/50 focus:border-accent-400/70 focus:ring-2 focus:ring-accent-400/20 text-white placeholder-slate-400 rounded-xl px-4 py-3 transition-all duration-300 outline-none shadow-inner"
                  placeholder="Enter your password"
                  disabled={isLoading}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-glow-sm transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:transform-none flex items-center justify-center"
              >
                {isLoading ? (
                   <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Please wait...</span>
                   </>
                ) : (
                  <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                )}
              </button>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm">
                  <p className="text-center text-red-400 text-sm font-medium">{error}</p>
                </div>
              )}
            </form>
            
            {/* Toggle Mode */}
            <div className="text-center mt-8 pt-6 border-t border-slate-700/50">
                <button 
                  onClick={toggleMode} 
                  disabled={isLoading} 
                  className="text-sm text-accent-400 hover:text-accent-300 transition-colors duration-300 font-medium disabled:opacity-50"
                >
                    {mode === 'signin' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </button>
            </div>
          </div>
        </div>
        
        {/* Info Note */}
        <div className="text-center mt-6 px-4">
          <p className="text-slate-500 text-xs leading-relaxed bg-dark-800/30 backdrop-blur-sm rounded-lg p-3 border border-slate-800/50">
            <span className="text-accent-400 font-medium">Note:</span> This is a private club. Please keep all discussions respectful and on-topic.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
