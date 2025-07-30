
import React, { useState, useEffect, useCallback } from 'react';
import Header from './Header';
import { ICONS } from '../constants';
import type { ClubEvent, User } from '../types';
import { orgService } from '../services/orgService';

const EventCard: React.FC<{ 
    event: ClubEvent; 
    index: number;
    isAdmin: boolean;
    onDelete: (id: number) => void;
}> = ({ event, index, isAdmin, onDelete }) => {
    const eventDate = new Date(event.date);
    const day = eventDate.getDate();
    const month = eventDate.toLocaleString('default', { month: 'short' }).toUpperCase();
    
    return (
        <div className="flex items-start space-x-6 bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-cyan-500 transition-colors duration-300 animate-slide-in-bottom group relative"
             style={{ animationDelay: `${index * 100}ms` }}>
            <div className="flex-shrink-0 text-center font-mono bg-slate-700 rounded-lg p-4 w-24">
                <p className="text-4xl font-bold text-cyan-400">{day}</p>
                <p className="text-lg text-slate-300">{month}</p>
            </div>
            <div className="flex-grow">
                <p className="text-xs text-slate-400 font-mono mb-1">{event.time}</p>
                <h3 className="text-2xl font-bold text-white mb-2">{event.title}</h3>
                <p className="text-slate-300">{event.description}</p>
            </div>
            {isAdmin && (
                <button 
                  onClick={() => onDelete(event.id)}
                  className="absolute top-4 right-4 p-2 bg-slate-700 rounded-full text-slate-400 hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Delete event"
                >
                    {ICONS.trash}
                </button>
            )}
        </div>
    );
};

const AdminEventForm: React.FC<{ onAdd: (event: Omit<ClubEvent, 'id' | 'organizationId'>) => void }> = ({ onAdd }) => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [description, setDescription] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !date || !time || !description.trim()) return;
        onAdd({ title, date, time, description });
        setTitle('');
        setDate('');
        setTime('');
        setDescription('');
    };

    return (
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Create New Event</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Event Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-900 border-2 border-slate-700 focus:border-cyan-400 text-cyan-300 rounded-md px-3 py-2 outline-none" required />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="block text-slate-400 text-sm font-medium mb-1" htmlFor="event-date">Event Date</label>
                    <input id="event-date" type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-900 border-2 border-slate-700 focus:border-cyan-400 text-cyan-300 rounded-md px-3 py-2 outline-none" required />
                    <label className="block text-slate-400 text-sm font-medium mb-1" htmlFor="event-time">Event Time</label>
                    <input id="event-time" type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-slate-900 border-2 border-slate-700 focus:border-cyan-400 text-cyan-300 rounded-md px-3 py-2 outline-none" required />
                </div>
                <textarea placeholder="Event Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-slate-900 border-2 border-slate-700 focus:border-cyan-400 text-cyan-300 rounded-md px-3 py-2 outline-none" rows={3} required />
                <button type="submit" className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors duration-200">
                    Add Event
                </button>
            </form>
        </div>
    );
};

const Events: React.FC<{ currentUser: User }> = ({ currentUser }) => {
    const [events, setEvents] = useState<ClubEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const isAdmin = currentUser.role === 'admin' || currentUser.role === 'superadmin';
    const orgId = currentUser.organizationId;

    const fetchData = useCallback(async () => {
        if (!orgId) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const fetchedEvents = await orgService.getEvents(orgId);
            setEvents(fetchedEvents);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
        setIsLoading(false);
    }, [orgId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddEvent = async (eventData: Omit<ClubEvent, 'id' | 'organizationId'>) => {
        if (!orgId) return;
        await orgService.addEvent(orgId, eventData);
        fetchData();
    };
  
    const handleDeleteEvent = async (id: number) => {
        if (!orgId) return;
        if(window.confirm('Are you sure you want to delete this event?')) {
            await orgService.deleteEvent(id);
            fetchData();
        }
    };

  return (
    <div className="p-8">
      <Header title="Event Calendar" />
      {isAdmin && <AdminEventForm onAdd={handleAddEvent} />}
      {isLoading ? <p>Loading events...</p> : (
        <div className="space-y-6">
            {events.length === 0 && <p className="text-center text-slate-400 py-10">No events scheduled.</p>}
            {events.map((event, index) => (
            <EventCard key={event.id} event={event} index={index} isAdmin={isAdmin} onDelete={handleDeleteEvent} />
            ))}
        </div>
      )}
    </div>
  );
};

export default Events;
