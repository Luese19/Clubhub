
import React, { useState, useEffect, useCallback } from 'react';
import Header from './Header';
import { ICONS } from '../constants';
import type { Announcement, ClubEvent, User } from '../types';
import { orgService } from '../services/orgService';

const AnnouncementCard: React.FC<{ 
    announcement: Announcement; 
    isAdmin: boolean;
    onDelete: (id: string) => void;
    showOrgName?: boolean;
    orgName?: string;
}> = ({ announcement, isAdmin, onDelete, showOrgName = false, orgName }) => {
    // Format the date for display
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        } catch {
            return dateString;
        }
    };

    return (
        <div className="bg-dark-800/60 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/30 hover:border-accent-400/50 transition-all duration-500 animate-fade-in group relative overflow-hidden shadow-lg hover:shadow-glow-sm">
            {/* Card glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent-400/5 via-transparent to-glow-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 pr-10 leading-tight">
                        {announcement.title}
                    </h3>
                    <span className="text-xs text-slate-500 font-mono bg-dark-900/50 px-2 py-1 rounded-lg flex-shrink-0 border border-slate-800">
                        {formatDate(announcement.createdAt)}
                    </span>
                </div>
                <p className="text-slate-300 mb-4 leading-relaxed">{announcement.content}</p>
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <p className="text-sm text-accent-400 font-medium">Posted by: {announcement.author}</p>
                        {showOrgName && orgName && (
                            <p className="text-xs text-slate-500 font-medium mt-1">Organization: {orgName}</p>
                        )}
                    </div>
                    {isAdmin && (
                        <button 
                          onClick={() => onDelete(announcement.id)}
                          className="p-2 bg-dark-700/50 backdrop-blur-sm rounded-xl text-slate-400 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 border border-transparent transition-all duration-300 opacity-0 group-hover:opacity-100 transform hover:scale-110"
                          aria-label="Delete announcement"
                        >
                            {ICONS.trash}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const UpcomingEvent: React.FC<{ event: ClubEvent }> = ({ event }) => (
    <div className="flex items-center space-x-4 p-4 bg-dark-800/40 backdrop-blur-sm rounded-xl border border-slate-700/30 hover:border-accent-400/50 transition-all duration-300 group">
        <div className="flex-shrink-0 text-center font-mono bg-gradient-to-br from-accent-500/20 to-accent-600/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-accent-400/20 group-hover:border-accent-400/40">
            <p className="text-accent-400 text-lg font-bold">{new Date(event.date).getDate()}</p>
            <p className="text-slate-400 text-xs font-medium">{new Date(event.date).toLocaleString('default', { month: 'short' }).toUpperCase()}</p>
        </div>
        <div className="flex-1">
            <h4 className="font-semibold text-white group-hover:text-accent-300 transition-colors duration-300">{event.title}</h4>
            <p className="text-sm text-slate-400">{event.time}</p>
        </div>
        <div className="w-2 h-2 bg-accent-400 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
);

const AdminAnnouncementForm: React.FC<{ 
    onAdd: (title: string, content: string, targetOrgId: string | 'all') => Promise<void>,
    currentUser: User,
    availableOrgs?: { id: string, name: string }[]
}> = ({ onAdd, currentUser, availableOrgs = [] }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [targetOrgId, setTargetOrgId] = useState<string | 'all'>(currentUser.organizationId || 'all');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const isSuperAdmin = currentUser.role === 'superadmin';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;
        
        setIsSubmitting(true);
        setMessage(null);
        
        try {
            await onAdd(title, content, targetOrgId);
            setTitle('');
            setContent('');
            setMessage({ type: 'success', text: 'Announcement posted successfully!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to post announcement' });
            setTimeout(() => setMessage(null), 5000);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-dark-800/60 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/30 mb-8 shadow-lg animate-fade-in">
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 mb-6 flex items-center">
                <div className="w-2 h-2 bg-accent-400 rounded-full mr-3"></div>
                Create Announcement
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Organization Selector - only for super admin */}
                {isSuperAdmin && (
                    <div>
                        <label htmlFor="target-org" className="block text-slate-300 text-sm font-medium mb-2">
                            Post to Organization
                        </label>
                        <select
                            id="target-org"
                            value={targetOrgId}
                            onChange={(e) => setTargetOrgId(e.target.value as string | 'all')}
                            className="w-full bg-dark-900/80 backdrop-blur-sm border border-slate-700/50 focus:border-accent-400/70 focus:ring-2 focus:ring-accent-400/20 text-white rounded-xl px-4 py-3 transition-all duration-300 outline-none shadow-inner"
                            disabled={isSubmitting}
                        >
                            <option value="all">All Organizations</option>
                            {availableOrgs.map(org => (
                                <option key={org.id} value={org.id}>{org.name}</option>
                            ))}
                        </select>
                    </div>
                )}
                
                <input 
                    type="text"
                    placeholder="Announcement Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-dark-900/80 backdrop-blur-sm border border-slate-700/50 focus:border-accent-400/70 focus:ring-2 focus:ring-accent-400/20 text-white placeholder-slate-400 rounded-xl px-4 py-3 transition-all duration-300 outline-none shadow-inner"
                    required
                    disabled={isSubmitting}
                />
                <textarea
                    placeholder="What's on your mind?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-dark-900/80 backdrop-blur-sm border border-slate-700/50 focus:border-accent-400/70 focus:ring-2 focus:ring-accent-400/20 text-white placeholder-slate-400 rounded-xl px-4 py-3 transition-all duration-300 outline-none shadow-inner resize-none"
                    rows={3}
                    required
                    disabled={isSubmitting}
                />
                
                {message && (
                    <div className={`p-3 rounded-xl text-sm font-medium ${
                        message.type === 'success' 
                            ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
                            : 'bg-red-500/10 border border-red-500/30 text-red-400'
                    }`}>
                        {message.text}
                    </div>
                )}
                
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg hover:shadow-glow-sm transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:transform-none flex items-center justify-center"
                >
                    {isSubmitting ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Posting...
                        </>
                    ) : (
                        'Post Announcement'
                    )}
                </button>
            </form>
        </div>
    );
}

const Dashboard: React.FC<{ currentUser: User }> = ({ currentUser }) => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [deletedAnnouncements, setDeletedAnnouncements] = useState<Announcement[]>([]);
    const [events, setEvents] = useState<ClubEvent[]>([]);
    const [availableOrgs, setAvailableOrgs] = useState<{ id: string, name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showHistory, setShowHistory] = useState(false);

    const isAdmin = currentUser.role === 'admin' || currentUser.role === 'superadmin';
    const isSuperAdmin = currentUser.role === 'superadmin';
    const orgId = currentUser.organizationId;

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch organizations for super admin
            if (isSuperAdmin) {
                const orgs = await orgService.getOrganizations();
                setAvailableOrgs(orgs.map(org => ({ id: org.id, name: org.name })));
                
                // For super admin, get all announcements across organizations
                const allAnnouncements: Announcement[] = [];
                const allEvents: ClubEvent[] = [];
                
                for (const org of orgs) {
                    try {
                        const [orgAnnouncements, orgEvents] = await Promise.all([
                            orgService.getAnnouncements(org.id),
                            orgService.getEvents(org.id)
                        ]);
                        allAnnouncements.push(...orgAnnouncements);
                        allEvents.push(...orgEvents);
                    } catch (error) {
                        console.warn(`Failed to fetch data for org ${org.name}:`, error);
                    }
                }
                
                setAnnouncements(allAnnouncements);
                setEvents(allEvents);
                
                // Fetch deleted announcements across all organizations (admin only)
                const allDeletedAnnouncements: Announcement[] = [];
                for (const org of orgs) {
                    try {
                        const orgDeletedAnnouncements = await orgService.getDeletedAnnouncements(org.id);
                        allDeletedAnnouncements.push(...orgDeletedAnnouncements);
                    } catch (error) {
                        console.warn(`Failed to fetch deleted announcements for org ${org.name}:`, error);
                    }
                }
                setDeletedAnnouncements(allDeletedAnnouncements);
            } else if (orgId) {
                // Regular users (both admin and students) - fetch their organization's data
                const [fetchedAnnouncements, fetchedEvents] = await Promise.all([
                    orgService.getAnnouncements(orgId),
                    orgService.getEvents(orgId)
                ]);
                setAnnouncements(fetchedAnnouncements);
                setEvents(fetchedEvents);
                
                // Fetch deleted announcements only for admins
                if (isAdmin) {
                    try {
                        const fetchedDeletedAnnouncements = await orgService.getDeletedAnnouncements(orgId);
                        setDeletedAnnouncements(fetchedDeletedAnnouncements);
                    } catch (error) {
                        console.warn('Failed to fetch deleted announcements:', error);
                        setDeletedAnnouncements([]);
                    }
                }
            } else {
                // User has no organization assigned - show empty state
                setAnnouncements([]);
                setEvents([]);
                setDeletedAnnouncements([]);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setIsLoading(false);
    }, [orgId, isSuperAdmin, isAdmin]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const handleAddAnnouncement = async (title: string, content: string, targetOrgId: string | 'all') => {
        const newAnnouncementData = {
            title,
            content,
            author: currentUser.email
        };
        
        if (targetOrgId === 'all' && isSuperAdmin) {
            // Post to all organizations
            if (availableOrgs.length === 0) {
                throw new Error('No organizations available');
            }
            
            const promises = availableOrgs.map(org => 
                orgService.addAnnouncement(org.id, newAnnouncementData)
            );
            
            await Promise.all(promises);
        } else {
            // Post to specific organization
            const targetId = targetOrgId === 'all' ? (orgId || '') : targetOrgId;
            if (!targetId) {
                throw new Error('No organization selected');
            }
            await orgService.addAnnouncement(targetId, newAnnouncementData);
        }
        
        fetchData(); // Re-fetch
    };

    const handleDeleteAnnouncement = async (id: string) => {
        if(!orgId) return;
        if(window.confirm('Are you sure you want to delete this announcement?')) {
            await orgService.deleteAnnouncement(id, currentUser.email);
            fetchData(); // Re-fetch
        }
    };

    const handleRestoreAnnouncement = async (id: string) => {
        if(!orgId) return;
        if(window.confirm('Are you sure you want to restore this announcement?')) {
            await orgService.restoreAnnouncement(id);
            fetchData(); // Re-fetch
        }
    };
    
    if (isLoading) {
        return (
            <div className="p-8 min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent-400 border-t-transparent"></div>
                    <p className="text-slate-400 font-medium">Loading announcements...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <Header title="Announcements" />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Admin Form - Only for admins */}
                    {isAdmin && (
                        <AdminAnnouncementForm 
                            onAdd={handleAddAnnouncement} 
                            currentUser={currentUser}
                            availableOrgs={availableOrgs}
                        />
                    )}
                    
                    {/* No announcements message */}
                    {announcements.length === 0 && (
                        <div className="text-center py-16 animate-fade-in">
                            <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5H9l5-5h1zm0-12h5l-5-5H9l5 5h1z" />
                                </svg>
                            </div>
                            <p className="text-slate-400 text-lg">No announcements yet</p>
                            <p className="text-slate-500 text-sm mt-2">
                                {isAdmin ? 'Create your first announcement above' : 'Check back later for updates from your administrators'}
                            </p>
                        </div>
                    )}
                    
                    {/* Announcements - Visible to all users */}
                    {announcements.map((ann) => {
                        const orgInfo = availableOrgs.find(org => org.id === ann.organizationId);
                        return (
                            <div key={ann.id} className="animate-fade-in">
                                <AnnouncementCard 
                                    announcement={ann} 
                                    isAdmin={isAdmin} 
                                    onDelete={handleDeleteAnnouncement}
                                    showOrgName={isSuperAdmin}
                                    orgName={orgInfo?.name}
                                />
                            </div>
                        );
                    })}
                    
                    {/* History Section for Admins */}
                    {isAdmin && deletedAnnouncements.length > 0 && (
                        <div className="mt-12 animate-fade-in">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-400 to-slate-300 flex items-center">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full mr-3"></div>
                                    Announcement History ({deletedAnnouncements.length})
                                </h3>
                                <button
                                    onClick={() => setShowHistory(!showHistory)}
                                    className="px-4 py-2 bg-dark-800/60 backdrop-blur-sm border border-slate-700/50 hover:border-slate-600/50 text-slate-400 hover:text-slate-300 rounded-xl transition-all duration-300 text-sm font-medium"
                                >
                                    {showHistory ? 'Hide History' : 'Show History'}
                                </button>
                            </div>
                            
                            {showHistory && (
                                <div className="space-y-4">
                                    {deletedAnnouncements.map((ann) => {
                                        const orgInfo = availableOrgs.find(org => org.id === ann.organizationId);
                                        return (
                                            <div key={ann.id} className="animate-fade-in">
                                                <div className="bg-dark-800/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/20 opacity-60 relative overflow-hidden group">
                                                    <div className="absolute top-2 right-2 flex items-center space-x-2">
                                                        <button
                                                            onClick={() => handleRestoreAnnouncement(ann.id)}
                                                            className="text-xs bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:text-green-300 px-2 py-1 rounded-full border border-green-500/30 hover:border-green-500/50 transition-all duration-300 opacity-0 group-hover:opacity-100"
                                                            title="Restore announcement"
                                                        >
                                                            Restore
                                                        </button>
                                                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full border border-red-500/30">
                                                            Deleted
                                                        </span>
                                                    </div>
                                                    <div className="pr-24">
                                                        <h4 className="text-lg font-semibold text-slate-300 mb-2">{ann.title}</h4>
                                                        <p className="text-slate-400 mb-3">{ann.content}</p>
                                                        <div className="flex items-center justify-between text-sm">
                                                            <div className="flex flex-col">
                                                                <span className="text-slate-500">Posted by: {ann.author}</span>
                                                                {isSuperAdmin && orgInfo && (
                                                                    <span className="text-slate-500 text-xs mt-1">Organization: {orgInfo.name}</span>
                                                                )}
                                                            </div>
                                                            <span className="text-slate-500">
                                                                Created: {new Date(ann.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        {ann.deletedAt && (
                                                            <div className="mt-2 text-xs text-red-400">
                                                                Deleted on {new Date(ann.deletedAt).toLocaleDateString()} by {ann.deletedBy}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-dark-800/60 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/30 shadow-lg sticky top-8 animate-fade-in">
                        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 mb-6 flex items-center">
                            <div className="w-2 h-2 bg-accent-400 rounded-full mr-3"></div>
                            Upcoming Events
                        </h3>
                        <div className="space-y-4">
                            {events.length > 0 
                                ? events.slice(0, 3).map(event => <UpcomingEvent key={event.id} event={event} />)
                                : (
                                    <div className="text-center py-8">
                                        <div className="w-12 h-12 bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <p className="text-slate-400 text-sm">No upcoming events</p>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
