
import React, { useState, useEffect, useCallback } from 'react';
import Header from './Header';
import { ICONS } from '../constants';
import type { Announcement, ClubEvent, User } from '../types';
import { orgService } from '../services/orgService';

const AnnouncementCard: React.FC<{ 
    announcement: Announcement; 
    isAdmin: boolean;
    onDelete: (id: number) => void;
}> = ({ announcement, isAdmin, onDelete }) => (
    <div className="bg-dark-800/60 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/30 hover:border-accent-400/50 transition-all duration-500 animate-fade-in group relative overflow-hidden shadow-lg hover:shadow-glow-sm">
        {/* Card glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent-400/5 via-transparent to-glow-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
        
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 pr-10 leading-tight">
                    {announcement.title}
                </h3>
                <span className="text-xs text-slate-500 font-mono bg-dark-900/50 px-2 py-1 rounded-lg flex-shrink-0 border border-slate-800">
                    {announcement.date}
                </span>
            </div>
            <p className="text-slate-300 mb-4 leading-relaxed">{announcement.content}</p>
            <div className="flex items-center justify-between">
                <p className="text-sm text-accent-400 font-medium">Posted by: {announcement.author}</p>
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

const AdminAnnouncementForm: React.FC<{ onAdd: (title: string, content: string) => void }> = ({ onAdd }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;
        onAdd(title, content);
        setTitle('');
        setContent('');
    };

    return (
        <div className="bg-dark-800/60 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/30 mb-8 shadow-lg animate-fade-in">
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 mb-6 flex items-center">
                <div className="w-2 h-2 bg-accent-400 rounded-full mr-3"></div>
                Create Announcement
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                    type="text"
                    placeholder="Announcement Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-dark-900/80 backdrop-blur-sm border border-slate-700/50 focus:border-accent-400/70 focus:ring-2 focus:ring-accent-400/20 text-white placeholder-slate-400 rounded-xl px-4 py-3 transition-all duration-300 outline-none shadow-inner"
                    required
                />
                <textarea
                    placeholder="What's on your mind?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-dark-900/80 backdrop-blur-sm border border-slate-700/50 focus:border-accent-400/70 focus:ring-2 focus:ring-accent-400/20 text-white placeholder-slate-400 rounded-xl px-4 py-3 transition-all duration-300 outline-none shadow-inner resize-none"
                    rows={3}
                    required
                />
                <button 
                    type="submit" 
                    className="px-6 py-3 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-glow-sm transition-all duration-300 transform hover:scale-105 active:scale-95"
                >
                    Post Announcement
                </button>
            </form>
        </div>
    );
}

const Dashboard: React.FC<{ currentUser: User }> = ({ currentUser }) => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [events, setEvents] = useState<ClubEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const isAdmin = currentUser.role === 'admin';
    const orgId = currentUser.organizationId;

    const fetchData = useCallback(async () => {
        if (!orgId) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const [fetchedAnnouncements, fetchedEvents] = await Promise.all([
                orgService.getAnnouncements(orgId),
                orgService.getEvents(orgId)
            ]);
            setAnnouncements(fetchedAnnouncements);
            setEvents(fetchedEvents);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setIsLoading(false);
    }, [orgId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const handleAddAnnouncement = async (title: string, content: string) => {
        if (!orgId) return;
        const newAnnouncementData = {
            title,
            content,
            author: currentUser.email,
            date: new Date().toISOString().split('T')[0]
        };
        await orgService.addAnnouncement(orgId, newAnnouncementData);
        fetchData(); // Re-fetch
    };

    const handleDeleteAnnouncement = async (id: number) => {
        if(!orgId) return;
        if(window.confirm('Are you sure you want to delete this announcement?')) {
            await orgService.deleteAnnouncement(id);
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
                    {isAdmin && <AdminAnnouncementForm onAdd={handleAddAnnouncement} />}
                    
                    {announcements.length === 0 && !isAdmin && (
                        <div className="text-center py-16 animate-fade-in">
                            <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5H9l5-5h1zm0-12h5l-5-5H9l5 5h1z" />
                                </svg>
                            </div>
                            <p className="text-slate-400 text-lg">No announcements yet</p>
                            <p className="text-slate-500 text-sm mt-2">Check back later for updates</p>
                        </div>
                    )}
                    
                    {announcements.map((ann) => (
                        <div key={ann.id} className="animate-fade-in">
                             <AnnouncementCard announcement={ann} isAdmin={isAdmin} onDelete={handleDeleteAnnouncement} />
                        </div>
                    ))}
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
