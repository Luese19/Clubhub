import React, { useState, useEffect, useCallback } from 'react';
import Header from './Header';
import { orgService } from '../services/orgService';
import { authService } from '../services/authService';
import type { Organization, User } from '../types';

const CreateOrgForm: React.FC<{ onOrgCreated: () => void }> = ({ onOrgCreated }) => {
    const [name, setName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await orgService.createOrganization(name, adminEmail);
            setName('');
            setAdminEmail('');
            onOrgCreated();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Create New Organization</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                    type="text"
                    placeholder="Organization Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-900 border-2 border-slate-700 focus:border-cyan-400 text-cyan-300 rounded-md px-3 py-2 outline-none"
                    required
                    disabled={isLoading}
                />
                <input 
                    type="email"
                    placeholder="Assign an Admin by email"
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    className="w-full bg-slate-900 border-2 border-slate-700 focus:border-cyan-400 text-cyan-300 rounded-md px-3 py-2 outline-none"
                    required
                    disabled={isLoading}
                />
                {error && <p className="text-sm text-red-400">{error}</p>}
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 disabled:bg-slate-600 transition-colors">
                    {isLoading ? 'Creating...' : 'Create Organization'}
                </button>
            </form>
        </div>
    );
};

const OrgCard: React.FC<{ org: Organization, index: number }> = ({ org, index }) => {
    const [members, setMembers] = useState<User[]>([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(true);

    useEffect(() => {
        const fetchOrgMembers = async () => {
            setIsLoadingMembers(true);
            try {
                const fetchedMembers = await authService.getUsersByOrg(org.id);
                setMembers(fetchedMembers);
            } catch (error) {
                console.error("Failed to fetch members for org", org.id, error);
                setMembers([]);
            } finally {
                setIsLoadingMembers(false);
            }
        };

        fetchOrgMembers();
    }, [org.id]);
    
    return (
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 animate-slide-in-bottom flex flex-col" style={{ animationDelay: `${index * 50}ms`}}>
            <div className="flex-shrink-0">
                <h3 className="font-bold text-lg text-white">{org.name}</h3>
                <p className="text-sm text-slate-400 mt-1">Admin: <span className="font-mono text-purple-400">{org.adminEmail}</span></p>
            </div>
            <div className="mt-4 border-t border-slate-700 pt-4 flex-grow">
                <h4 className="text-sm font-semibold text-slate-300 mb-2">Members ({members.length})</h4>
                {isLoadingMembers ? (
                    <p className="text-sm text-slate-500">Loading members...</p>
                ) : (
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                        {members.length > 0 ? members.map(member => (
                            <div key={member.email} className="flex justify-between items-center bg-slate-850 p-2 rounded-md">
                                <span className="text-sm text-slate-300 truncate" title={member.email}>{member.email}</span>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                                    member.role === 'admin' 
                                    ? 'bg-purple-500 text-white' 
                                    : 'bg-cyan-500 text-slate-900'
                                }`}>
                                    {member.role}
                                </span>
                            </div>
                        )) : (
                            <p className="text-sm text-slate-500">No members assigned.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const Organizations: React.FC = () => {
    const [orgs, setOrgs] = useState<Organization[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchOrgs = useCallback(async () => {
        setIsLoading(true);
        const fetchedOrgs = await orgService.getOrganizations();
        setOrgs(fetchedOrgs);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchOrgs();
    }, [fetchOrgs]);

    return (
        <div className="p-8">
            <Header title="Organization Management" />
            <CreateOrgForm onOrgCreated={fetchOrgs} />

            <h2 className="text-xl font-bold text-white mb-4 mt-8">Existing Organizations</h2>
            {isLoading ? <p>Loading organizations...</p> : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orgs.length === 0 && <p className="text-slate-400">No organizations created yet.</p>}
                    {orgs.map((org, index) => <OrgCard key={org.id} org={org} index={index} />)}
                </div>
            )}
        </div>
    );
};

export default Organizations;