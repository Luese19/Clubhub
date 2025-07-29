
import React, { useState } from 'react';
import type { UserRole } from '../types';

interface LoginProps {
  onLoginSuccess: (role: UserRole) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network request and password check
    setTimeout(() => {
      const isAdmin = role === 'admin' && password === 'admin_pass';
      const isStudent = role === 'student' && password === 'cyberclub2024';
      
      if (isAdmin || isStudent) {
        onLoginSuccess(role);
      } else {
        setError('Access Denied: Invalid Credentials');
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center font-mono p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-lg shadow-2xl shadow-cyan-500/10 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-cyan-400 animate-text-focus-in">ClubHub</h1>
            <p className="text-slate-400 mt-2">Secure Terminal Access</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
                <label className="block text-slate-400 text-sm mb-2">&gt; Select Role:</label>
                <div className="flex items-center justify-center gap-4">
                    {(['student', 'admin'] as UserRole[]).map((r) => (
                        <label key={r} className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                            <input 
                                type="radio" 
                                name="role" 
                                value={r} 
                                checked={role === r}
                                onChange={() => setRole(r)}
                                className="hidden"
                                disabled={isLoading}
                            />
                            <span className={`px-4 py-2 rounded-md transition-all duration-200 border-2 ${role === r ? 'bg-cyan-500 border-cyan-400 text-white' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'}`}>
                                {r.charAt(0).toUpperCase() + r.slice(1)}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-slate-400 text-sm mb-2">
                &gt; Enter Access Key:
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border-2 border-slate-700 focus:border-cyan-400 text-cyan-300 rounded-md px-3 py-2 transition-colors duration-300 outline-none placeholder:text-slate-600"
                placeholder="************"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-all duration-300 flex items-center justify-center"
            >
              {isLoading ? (
                 <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Authenticating...</span>
                 </>
              ) : (
                <span>Initiate Connection</span>
              )}
            </button>

            {error && (
              <p className="mt-4 text-center text-red-400 text-sm animate-pulse">{error}</p>
            )}
          </form>
        </div>
        <p className="text-center text-slate-600 text-xs mt-6">
            Hint: student (<span className="text-slate-500">cyberclub2024</span>), admin (<span className="text-slate-500">admin_pass</span>)
        </p>
      </div>
    </div>
  );
};

export default Login;
