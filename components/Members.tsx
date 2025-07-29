
import React, { useState, useEffect, useCallback } from 'react';
import Header from './Header';
import { authService } from '../services/authService.old';
import type { User } from '../types';

const MemberCard: React.FC<{ 
    member: User; 
    isAdmin: boolean;
    onRemove: (email: string) => void;
}> = ({ member, isAdmin, onRemove }) => {
    return (
        <div className="bg-dark-800/60 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/30 text-center hover:shadow-glow-sm hover:border-accent-400/50 transition-all duration-500 animate-fade-in group relative overflow-hidden">
            {/* Card glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent-400/5 via-transparent to-glow-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            
            <div className="relative z-10">
                <div className="relative mb-4">
                    <img 
                        src={`https://api.dicebear.com/8.x/initials/svg?seed=${member.email}`}
                        alt={member.email}
                        className="w-20 h-20 rounded-full mx-auto border-2 border-slate-600/50 bg-dark-700 group-hover:border-accent-400/50 transition-all duration-300"
                    />
                    <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-accent-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <h3 className="text-lg font-semibold text-white truncate w-full mb-1">{member.email}</h3>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                    member.role === 'admin' 
                        ? 'bg-gradient-to-r from-purple-500/20 to-purple-400/20 text-purple-300 border border-purple-400/30' 
                        : 'bg-gradient-to-r from-accent-500/20 to-accent-400/20 text-accent-300 border border-accent-400/30'
                }`}>
                    {member.role}
                </span>
            </div>
            
            {isAdmin && (
                <button 
                  onClick={() => onRemove(member.email)}
                  className="absolute top-3 right-3 p-2 bg-dark-700/50 backdrop-blur-sm rounded-xl text-slate-400 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 border border-transparent transition-all duration-300 opacity-0 group-hover:opacity-100 transform hover:scale-110"
                  aria-label="Remove member"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                    <path d="M3.75 3.75a.75.75 0 0 0-1.5 0v8.5a.75.75 0 0 0 1.5 0v-8.5ZM12.25 3.75a.75.75 0 0 0-1.5 0v8.5a.75.75 0 0 0 1.5 0v-8.5ZM8 1.75a.75.75 0 0 1 .75.75v11a.75.75 0 0 1-1.5 0v-11A.75.75 0 0 1 8 1.75Z" />
                  </svg>
                </button>
            )}
        </div>
    );
};

const AddMemberForm: React.FC<{ onAddMember: (email: string) => void }> = ({ onAddMember }) => {
    const [email, setEmail] = useState('');
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!email.trim()) return;
        onAddMember(email);
        setEmail('');
    }

    return (
        <div className="mb-8 animate-fade-in">
            <div className="bg-dark-800/60 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/30 shadow-lg">
                <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 mb-4 flex items-center">
                    <div className="w-2 h-2 bg-accent-400 rounded-full mr-3"></div>
                    Add New Member
                </h3>
                <form onSubmit={handleSubmit} className="flex gap-4">
                    <input 
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Enter member's email address..."
                        className="flex-1 bg-dark-900/80 backdrop-blur-sm border border-slate-700/50 focus:border-accent-400/70 focus:ring-2 focus:ring-accent-400/20 text-white placeholder-slate-400 rounded-xl px-4 py-3 transition-all duration-300 outline-none shadow-inner"
                        required
                    />
                    <button 
                        type="submit" 
                        className="px-6 py-3 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-glow-sm transition-all duration-300 transform hover:scale-105 active:scale-95 whitespace-nowrap"
                    >
                        Add Member
                    </button>
                </form>
            </div>
        </div>
    );
};


const Members: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [members, setMembers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = currentUser.role === 'admin';
  const orgId = currentUser.organizationId;
  
  const fetchMembers = useCallback(async () => {
      if(!orgId) {
          setIsLoading(false);
          return;
      }
      try {
        setError('');
        setIsLoading(true);
        const orgMembers = await authService.getUsersByOrg(orgId);
        // Add the current user to the list if they are part of the org
        const allMembers = orgMembers.find((m: User) => m.email === currentUser.email) ? orgMembers : [...orgMembers, currentUser];
        setMembers(allMembers.sort((a: User, b: User) => a.role > b.role ? -1 : 1));
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
  }, [orgId, currentUser]);
  
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);
  
  const handleAddMember = async (email: string) => {
      if (!orgId) return;
      try {
        await authService.assignUserToOrg(email, orgId);
        setError(''); // Clear any previous errors
        fetchMembers(); // refresh list
      } catch (e: any) {
        setError(`Failed to add member: ${e.message}`);
      }
  };
  
  const handleRemoveMember = async (email: string) => {
      if (!orgId || email === currentUser.email) {
          setError("You cannot remove yourself from the organization.");
          return;
      }
      if(window.confirm(`Are you sure you want to remove ${email} from the organization?`)) {
          try {
            await authService.removeUserFromOrg(email, orgId);
            setError(''); // Clear any previous errors
            fetchMembers(); // refresh list
          } catch(e: any) {
            setError(`Failed to remove member: ${e.message}`);
          }
      }
  };


  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Header title="Member Directory" />
      
      {isAdmin && <AddMemberForm onAddMember={handleAddMember} />}
      
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm animate-fade-in">
          <p className="text-red-400 font-medium">{error}</p>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex items-center justify-center py-16 animate-fade-in">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent-400 border-t-transparent"></div>
            <p className="text-slate-400 font-medium">Loading members...</p>
          </div>
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <p className="text-slate-400 text-lg">No members found</p>
          <p className="text-slate-500 text-sm mt-2">Add members to see them here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {members.map((member) => (
                <MemberCard key={member.email} member={member} isAdmin={isAdmin && member.email !== currentUser.email} onRemove={handleRemoveMember} />
            ))}
        </div>
      )}
    </div>
  );
};

export default Members;
