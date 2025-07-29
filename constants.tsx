
import React from 'react';
import type { Resource, GalleryItem } from './types';

export const resources: Resource[] = [
  { id: 1, title: 'Burp Suite', description: 'The premier toolkit for web application security testing.', url: '#', category: 'Security Tools' },
  { id: 2, title: 'Hashcat', description: 'The world\'s fastest and most advanced password recovery utility.', url: '#', category: 'Security Tools' },
  { id: 3, title: 'React Docs', description: 'The official documentation for the React library.', url: '#', category: 'Development' },
  { id: 4, title: 'Tailwind CSS', description: 'A utility-first CSS framework for rapid UI development.', url: '#', category: 'Development' },
  { id: 5, title: 'Behance', description: 'A great source of inspiration for multimedia projects.', url: '#', category: 'Inspiration' },
  { id: 6, title: 'OWASP Top 10', description: 'A standard awareness document for web application security.', url: '#', category: 'Guides' },
];

export const galleryItems: GalleryItem[] = [
  { id: 1, title: 'Project Showcase 2023', imageUrl: 'https://picsum.photos/seed/gallery1/500/300' },
  { id: 2, title: 'Workshop Session', imageUrl: 'https://picsum.photos/seed/gallery2/500/300' },
  { id: 3, title: 'Team Building Event', imageUrl: 'https://picsum.photos/seed/gallery3/500/300' },
  { id: 4, title: 'Hackathon Winners', imageUrl: 'https://picsum.photos/seed/gallery4/500/300' },
  { id: 5, title: 'Club Fair Booth', imageUrl: 'https://picsum.photos/seed/gallery5/500/300' },
  { id: 6, title: 'Code Night', imageUrl: 'https://picsum.photos/seed/gallery6/500/300' },
];

export const ICONS = {
    dashboard: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2z"></path></svg>,
    members: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 10a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>,
    events: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>,
    projects: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>,
    resources: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>,
    gallery: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>,
    logout: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>,
    sparkles: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10.868 2.884c.321-.772 1.415-.772 1.736 0l1.681 4.06c.064.155.19.284.351.35l4.06 1.682c.772.321.772 1.415 0 1.736l-4.06 1.681a.604.604 0 0 1-.351.351l-1.681 4.06c-.321.772-1.415.772-1.736 0l-1.681-4.06a.604.604 0 0 1-.351-.351l-4.06-1.681c-.772-.321-.772-1.415 0-1.736l4.06-1.682a.604.604 0 0 1 .351-.35l1.681-4.06Z" clipRule="evenodd" /></svg>,
    trash: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 1 0 .53 1.437c.84-.263 1.68-.404 2.535-.443v.001h4.5v-.001c.855.039 1.695.18 2.535.443a.75.75 0 0 0 .53-1.437c-.785-.248-1.57-.391-2.365-.468v-.443A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.043 2.5.124V5.75a.75.75 0 0 1-1.5 0v-.876c-.33-.016-.662-.024-1-.024s-.67.008-1 .024v.876a.75.75 0 0 1-1.5 0V4.124C8.327 4.043 9.16 4 10 4ZM8.28 6.03a.75.75 0 0 0-1.06-1.06L6.5 5.69V15.25a.75.75 0 0 0 1.5 0V6.19l.28-.28ZM11.72 6.03a.75.75 0 1 1 1.06-1.06l.72.72v9.06a.75.75 0 1 1-1.5 0V6.19l-.28-.28Z" clipRule="evenodd" /></svg>,
    organizations: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM10 11c-1.66 0-3 1.34-3 3v1h6v-1c0-1.66-1.34-3-3-3Z" /><path d="M3.205 14.795a.75.75 0 0 1 .658-.445h.174c.289.022.57.094.84.212a3.001 3.001 0 0 0 2.246 0c.27-.118.55-.19.84-.212h.173a.75.75 0 0 1 .659.445l.267.534a.75.75 0 0 1-.335.943l-.348.174a2.998 2.998 0 0 0-1.564 1.564l-.174.348a.75.75 0 0 1-.943.335l-.534-.267ZM16.795 14.795a.75.75 0 0 0-.658-.445h-.174c-.289.022-.57.094-.84.212a3.001 3.001 0 0 1-2.246 0c-.27-.118-.55-.19-.84-.212h-.173a.75.75 0 0 0-.659.445l-.267.534a.75.75 0 0 0 .335.943l.348.174a2.998 2.998 0 0 1 1.564 1.564l.174.348a.75.75 0 0 0 .943.335l.534-.267Z" /></svg>,
};
