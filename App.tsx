
import React, { useState, useCallback, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Members from './components/Members';
import Events from './components/Events';
import Projects from './components/Projects';
import Resources from './components/Resources';
import Gallery from './components/Gallery';
import Auth from './components/Auth';
import Organizations from './components/Organizations';
import { authService } from './services/authService.old';
import { orgService } from './services/orgService';
import type { User, Organization } from './types';


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserData = useCallback(async (user: User | null) => {
    if (user) {
      setCurrentUser(user);
      if (user.organizationId) {
        const org = await orgService.getOrganizationById(user.organizationId);
        setCurrentOrg(org || null);
      } else {
        setCurrentOrg(null);
      }
    } else {
        setCurrentUser(null);
        setCurrentOrg(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const user = authService.getCurrentUser();
    loadUserData(user);
  }, [loadUserData]);

  const handleAuthSuccess = useCallback((user: User) => {
    setIsLoading(true);
    loadUserData(user);
  }, [loadUserData]);
  
  const handleLogout = useCallback(() => {
    authService.signOut();
    loadUserData(null);
  }, [loadUserData]);
  
  const isSuperAdmin = currentUser?.role === 'admin' && !currentUser.organizationId;

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-dark-900 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark-800 via-dark-900 to-dark-950"></div>
        
        {/* Animated background elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-glow-purple/10 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        
        <div className="relative z-10 flex flex-col items-center space-y-4">
          <div className="relative">
            <svg className="animate-spin h-12 w-12 text-accent-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <div className="absolute inset-0 rounded-full bg-accent-400/20 blur-lg animate-glow-pulse"></div>
          </div>
          <p className="text-slate-400 font-medium animate-fade-in">Loading ClubHub...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  if (!currentUser.organizationId && !isSuperAdmin) {
    return (
        <div className="min-h-screen bg-dark-900 relative overflow-hidden flex items-center justify-center">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-dark-800 via-dark-900 to-dark-950"></div>
            <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-accent-500/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-glow-purple/10 rounded-full blur-3xl"></div>
            
            {/* Content */}
            <div className="relative z-10 max-w-md mx-auto text-center p-8">
                <div className="bg-dark-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
                    <div className="w-16 h-16 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Welcome to ClubHub</h1>
                    <p className="text-slate-400 mb-1">Hello, {currentUser.email}</p>
                    <p className="text-slate-500 text-sm mb-6">You're not yet assigned to an organization. Please contact an administrator to join a club.</p>
                    <button 
                        onClick={handleLogout} 
                        className="w-full bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-glow-sm transition-all duration-300 transform hover:scale-105"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-dark-900 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark-800 via-dark-900 to-dark-950"></div>
        
        {/* Subtle background patterns */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-accent-500/20 rounded-full mix-blend-multiply filter blur-xl"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-glow-purple/20 rounded-full mix-blend-multiply filter blur-xl"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-glow-pink/20 rounded-full mix-blend-multiply filter blur-xl"></div>
        </div>
        
        <div className="relative z-10 flex h-screen">
          <Sidebar onLogout={handleLogout} currentUser={currentUser} currentOrg={currentOrg} />
          <main className="flex-1 overflow-y-auto scrollbar-hide">
            <Routes>
              <Route path="/" element={<Dashboard currentUser={currentUser} />} />
              <Route path="/members" element={<Members currentUser={currentUser} />} />
              <Route path="/events" element={<Events currentUser={currentUser} />} />
              <Route path="/projects" element={<Projects currentUser={currentUser} />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/gallery" element={<Gallery />} />
              {isSuperAdmin && <Route path="/organizations" element={<Organizations />} />}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
