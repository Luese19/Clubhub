
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
import FirebaseSetupGuide from './components/FirebaseSetupGuide';
import { authService } from './services/authService';
import { orgService } from './services/orgService';
import type { User, Organization } from './types';

// Check if Firebase is configured
const isFirebaseConfigured = () => {
  return import.meta.env.VITE_FIREBASE_API_KEY && 
         import.meta.env.VITE_FIREBASE_API_KEY !== "your_api_key_here" &&
         import.meta.env.VITE_FIREBASE_PROJECT_ID &&
         import.meta.env.VITE_FIREBASE_PROJECT_ID !== "your_project_id";
};

// Get the appropriate dashboard route based on user role and organization
const getDashboardRoute = (user: User | null): string => {
  if (!user) return '/';
  
  switch (user.role) {
    case 'superadmin':
      return '/organizations'; // Super admin manages all organizations
    case 'admin':
    case 'student':
      // All users can access dashboard, even if not assigned to an organization yet
      return '/dashboard';
    default:
      return '/dashboard';
  }
};


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
    const initializeApp = async () => {
      // Initialize super admin
      await authService.initialize();
      
      // Set up auth state listener
      const unsubscribe = authService.onAuthStateChange(async (user) => {
        await loadUserData(user);
      });

      return unsubscribe;
    };

    let unsubscribe: (() => void) | undefined;
    
    initializeApp().then((unsub) => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [loadUserData]);

  const handleAuthSuccess = useCallback((user: User) => {
    setIsLoading(true);
    loadUserData(user);
  }, [loadUserData]);
  
  const handleLogout = useCallback(async () => {
    try {
      await authService.signOut();
      await loadUserData(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [loadUserData]);
  
  const isSuperAdmin = currentUser?.role === 'superadmin';

  // Show Firebase setup guide if not configured
  if (!isFirebaseConfigured()) {
    return <FirebaseSetupGuide />;
  }

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
              <Route path="/" element={<Navigate to={getDashboardRoute(currentUser)} />} />
              <Route path="/dashboard" element={<Dashboard currentUser={currentUser} />} />
              <Route path="/members" element={<Members currentUser={currentUser} />} />
              <Route path="/events" element={<Events currentUser={currentUser} />} />
              <Route path="/projects" element={<Projects currentUser={currentUser} />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/gallery" element={<Gallery />} />
              {isSuperAdmin && <Route path="/organizations" element={<Organizations />} />}
              <Route path="*" element={<Navigate to={getDashboardRoute(currentUser)} />} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
