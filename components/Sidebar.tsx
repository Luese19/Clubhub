
import React from 'react';
import { NavLink } from 'react-router-dom';
import { ICONS } from '../constants';
import type { User, Organization } from '../types';

const baseNavItems = [
  { path: '/', name: 'Announcements', icon: ICONS.dashboard },
  { path: '/members', name: 'Members', icon: ICONS.members },
  { path: '/events', name: 'Events', icon: ICONS.events },
  { path: '/projects', name: 'Projects', icon: ICONS.projects },
  { path: '/resources', name: 'Resources', icon: ICONS.resources },
  { path: '/gallery', name: 'Gallery', icon: ICONS.gallery },
];

const adminNavItem = {
  path: '/organizations', name: 'Organizations', icon: <div className="w-6 h-6">{ICONS.organizations}</div>
};

interface SidebarProps {
  onLogout: () => void;
  currentUser: User | null;
  currentOrg: Organization | null;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout, currentUser, currentOrg }) => {
  const baseLinkClasses = "flex items-center px-4 py-3 text-slate-300 transition-all duration-300 group relative overflow-hidden";
  const hoverClasses = "hover:text-white hover:bg-dark-800/50";
  const activeClassName = "bg-gradient-to-r from-accent-500/20 to-transparent border-r-2 border-accent-400 text-white font-medium shadow-inner-glow";
  const inactiveClassName = "border-r-2 border-transparent";
  
  const isSuperAdmin = currentUser?.role === 'admin' && !currentUser.organizationId;
  const navItems = isSuperAdmin ? [...baseNavItems, adminNavItem] : baseNavItems;

  return (
    <div className="w-72 bg-dark-850/95 backdrop-blur-sm border-r border-slate-800/50 flex flex-col h-full scrollbar-hide relative">
      {/* Sidebar glow effect */}
      <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-accent-400/50 to-transparent"></div>
      
      {/* Header Section */}
      <div className="flex items-center justify-center h-32 border-b border-slate-800/50 flex-col p-4 relative">
        {/* Logo/Title with glow */}
        <div className="relative mb-3">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-accent-300 font-mono tracking-tight">
            {currentOrg?.name || 'ClubHub'}
          </h1>
          <div className="absolute inset-0 blur-lg bg-gradient-to-r from-accent-400/30 to-accent-300/30 -z-10 rounded"></div>
        </div>
        
        {/* User Info */}
        {currentUser && (
          <div className="text-center w-full space-y-2">
            <div className="flex items-center justify-center">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize shadow-lg backdrop-blur-sm border ${
                isSuperAdmin
                  ? 'bg-gradient-to-r from-amber-500/90 to-amber-400/90 text-white border-amber-400/30'
                : currentUser.role === 'admin' 
                  ? 'bg-gradient-to-r from-purple-500/90 to-purple-400/90 text-white border-purple-400/30' 
                  : 'bg-gradient-to-r from-accent-500/90 to-accent-400/90 text-white border-accent-400/30'
              }`}>
                {isSuperAdmin ? 'Super Admin' : currentUser.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate px-2 w-full font-medium" title={currentUser.email}>
              {currentUser.email}
            </p>
          </div>
        )}
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => 
                `${baseLinkClasses} ${hoverClasses} ${isActive ? activeClassName : inactiveClassName} rounded-xl`
            }
          >
            {/* Hover effect background */}
            <div className="absolute inset-0 bg-gradient-to-r from-accent-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
            
            <div className="relative z-10 flex items-center w-full">
              <div className="mr-4 text-lg transition-transform group-hover:scale-110">{item.icon}</div>
              <span className="font-medium">{item.name}</span>
            </div>
          </NavLink>
        ))}
      </nav>
      
      {/* Logout Button */}
      <div className="px-3 py-4 border-t border-slate-800/50">
         <button 
            onClick={onLogout} 
            className={`${baseLinkClasses} ${hoverClasses} w-full rounded-xl bg-gradient-to-r from-red-500/10 to-transparent hover:from-red-500/20 hover:to-transparent border border-transparent hover:border-red-500/30 transition-all duration-300`}
         >
            <div className="relative z-10 flex items-center w-full">
              <div className="mr-4 text-lg transition-transform group-hover:scale-110">{ICONS.logout}</div>
              <span className="font-medium">Sign Out</span>
            </div>
         </button>
      </div>
    </div>
  );
};

export default Sidebar;
