
import React, { useState, useCallback, useEffect } from 'react';
import Header from './Header';
import { ICONS } from '../constants';
import { TaskStatus } from '../types';
import type { ProjectTask, User } from '../types';
import { generateProjectIdea } from '../services/geminiService';
import { orgService } from '../services/orgService';

const TaskCard: React.FC<{ task: ProjectTask; isAdmin: boolean; onDelete: (id: number) => void }> = ({ task, isAdmin, onDelete }) => (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 cursor-grab active:cursor-grabbing group relative">
        <h4 className="font-bold text-white">{task.title}</h4>
        <p className="text-sm text-slate-400 mt-1">{task.description}</p>
        {isAdmin && (
            <button 
              onClick={() => onDelete(task.id)}
              className="absolute top-2 right-2 p-1 bg-slate-700 rounded-full text-slate-400 hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Delete task"
            >
              {ICONS.trash}
            </button>
        )}
    </div>
);

const AdminTaskForm: React.FC<{ onAddTask: (title: string, desc: string) => void }> = ({ onAddTask }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!title.trim()) return;
        onAddTask(title, description);
        setTitle('');
        setDescription('');
    };

    return (
        <form onSubmit={handleSubmit} className="p-2 space-y-2">
            <input 
                type="text" 
                placeholder="New task title..." 
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-slate-900 text-sm border-2 border-slate-700 focus:border-purple-500 text-slate-300 rounded-md px-3 py-2 outline-none"
            />
            <textarea 
                placeholder="Description (optional)..." 
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-slate-900 text-sm border-2 border-slate-700 focus:border-purple-500 text-slate-300 rounded-md px-3 py-2 outline-none"
            />
            <button type="submit" className="w-full px-4 py-2 bg-slate-700 text-sm text-white font-semibold rounded-lg hover:bg-slate-600 transition-colors duration-200">
                Add Task
            </button>
        </form>
    )
}

const statusConfig = {
    [TaskStatus.ToDo]: { title: 'To Do', color: 'border-l-red-500' },
    [TaskStatus.InProgress]: { title: 'In Progress', color: 'border-l-yellow-500' },
    [TaskStatus.Done]: { title: 'Done', color: 'border-l-green-500' },
}

const ProjectColumn: React.FC<{ 
    status: TaskStatus; 
    tasks: ProjectTask[];
    isAdmin: boolean;
    onDeleteTask: (id: number) => void;
    onAddTask?: (title: string, desc: string) => void;
}> = ({ status, tasks, isAdmin, onDeleteTask, onAddTask }) => (
    <div className={`bg-slate-850 rounded-lg p-4 flex-1 min-w-[300px]`}>
        <h3 className={`font-bold text-lg mb-4 p-2 text-white rounded-md ${statusConfig[status].color}`}>
            {statusConfig[status].title}
        </h3>
        {isAdmin && status === TaskStatus.ToDo && onAddTask && <AdminTaskForm onAddTask={onAddTask} />}
        <div className="space-y-4 mt-4">
            {tasks.map(task => <TaskCard key={task.id} task={task} isAdmin={isAdmin} onDelete={onDeleteTask} />)}
             {tasks.length === 0 && <p className="text-center text-slate-500 text-sm pt-4">No tasks here.</p>}
        </div>
    </div>
);


const Projects: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = currentUser.role === 'admin';
  const orgId = currentUser.organizationId;

  const fetchData = useCallback(async () => {
    if(!orgId) {
        setIsLoading(false);
        return;
    };
    setIsLoading(true);
    const data = await orgService.getOrgData(orgId);
    setTasks(data.tasks);
    setIsLoading(false);
  }, [orgId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddTask = useCallback(async (title: string, description: string) => {
    if(!orgId) return;
    await orgService.addTask(orgId, { title, description });
    fetchData();
  }, [orgId, fetchData]);

  const handleDeleteTask = useCallback(async (id: number) => {
    if (!orgId) return;
    if (window.confirm('Are you sure you want to delete this task?')) {
        await orgService.deleteTask(orgId, id);
        fetchData();
    }
  }, [orgId, fetchData]);

  const handleGenerateIdea = useCallback(async () => {
      if(!orgId) return;
      setIsGenerating(true);
      setError(null);
      try {
          const idea = await generateProjectIdea();
          await handleAddTask(idea.title, idea.description);
      } catch (e: any) {
          setError(e.message || 'An unknown error occurred.');
      } finally {
          setIsGenerating(false);
      }
  }, [orgId, handleAddTask]);

  const tasksByStatus = tasks.reduce((acc, task) => {
    acc[task.status] = acc[task.status] || [];
    acc[task.status].push(task);
    return acc;
  }, {} as Record<TaskStatus, ProjectTask[]>);

  if (isLoading) {
      return <div className="p-8">Loading projects...</div>
  }

  return (
    <div className="p-8 h-full flex flex-col">
      <Header title="Project Tracker">
          {isAdmin && (
              <button
                  onClick={handleGenerateIdea}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed"
              >
                  {isGenerating ? (
                       <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                       </svg>
                  ) : ICONS.sparkles}
                  <span>{isGenerating ? 'Generating...' : 'Generate AI Idea'}</span>
              </button>
          )}
      </Header>
      {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-md mb-4">{error}</div>}

      <div className="flex-grow flex gap-6 overflow-x-auto pb-4">
        {Object.values(TaskStatus).map(status => (
            <ProjectColumn 
                key={status} 
                status={status} 
                tasks={tasksByStatus[status] || []}
                isAdmin={isAdmin}
                onDeleteTask={handleDeleteTask}
                onAddTask={status === TaskStatus.ToDo ? handleAddTask : undefined}
            />
        ))}
      </div>
    </div>
  );
};

export default Projects;
