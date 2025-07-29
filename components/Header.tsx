
import React from 'react';

interface HeaderProps {
  title: string;
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, children }) => {
  return (
    <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800/30">
      <div className="relative">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 tracking-tight">
          {title}
        </h1>
        <div className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-accent-400 to-accent-600 rounded-full"></div>
      </div>
      <div className="flex items-center space-x-3">{children}</div>
    </div>
  );
};

export default Header;
