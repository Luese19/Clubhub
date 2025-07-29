
import React, { useState } from 'react';
import Header from './Header';
import { resources } from '../constants';
import type { Resource } from '../types';

const ResourceCard: React.FC<{ resource: Resource, index: number }> = ({ resource, index }) => (
    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-purple-500 transition-colors duration-300 animate-slide-in-bottom"
         style={{ animationDelay: `${index * 50}ms` }}>
        <h3 className="text-xl font-bold text-white">{resource.title}</h3>
        <p className="text-slate-300 my-2">{resource.description}</p>
        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 font-mono text-sm">
            Learn More &rarr;
        </a>
    </div>
);

const Resources: React.FC = () => {
    const [filter, setFilter] = useState('All');
    const categories = ['All', ...Array.from(new Set(resources.map(r => r.category)))];

    const filteredResources = filter === 'All'
        ? resources
        : resources.filter(r => r.category === filter);

    return (
        <div className="p-8">
            <Header title="Resources" />
            
            <div className="mb-8 flex items-center gap-2 flex-wrap">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setFilter(category)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
                            filter === category 
                                ? 'bg-cyan-500 text-white' 
                                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource, index) => (
                    <ResourceCard key={resource.id} resource={resource} index={index} />
                ))}
            </div>
        </div>
    );
};

export default Resources;
