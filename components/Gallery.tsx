
import React from 'react';
import Header from './Header';
import { galleryItems } from '../constants';
import type { GalleryItem } from '../types';

const GalleryImageCard: React.FC<{ item: GalleryItem, index: number }> = ({ item, index }) => (
    <div className="group relative overflow-hidden rounded-lg border border-slate-700 animate-fade-in"
         style={{ animationDelay: `${index * 75}ms` }}>
        <img 
            src={item.imageUrl} 
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4">
            <h3 className="text-lg font-bold text-white transition-transform duration-300 translate-y-2 group-hover:translate-y-0">{item.title}</h3>
        </div>
    </div>
);

const Gallery: React.FC = () => {
  return (
    <div className="p-8">
      <Header title="Media Gallery" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleryItems.map((item, index) => (
          <GalleryImageCard key={item.id} item={item} index={index} />
        ))}
      </div>
    </div>
  );
};

export default Gallery;
