import type { Organization, Announcement, ClubEvent, ProjectTask, TaskStatus, User } from '../types';
import { authService } from './authService';

const ORG_STORAGE_KEY = 'clubhub_organizations';
const ORG_DATA_STORAGE_KEY = 'clubhub_org_data';

interface OrgData {
    announcements: Announcement[];
    events: ClubEvent[];
    tasks: ProjectTask[];
}

type AllOrgData = Record<string, OrgData>;

const getOrgs = (): Organization[] => {
    const orgs = localStorage.getItem(ORG_STORAGE_KEY);
    return orgs ? JSON.parse(orgs) : [];
}

const saveOrgs = (orgs: Organization[]) => {
    localStorage.setItem(ORG_STORAGE_KEY, JSON.stringify(orgs));
}

const getAllOrgData = (): AllOrgData => {
    const data = localStorage.getItem(ORG_DATA_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
}

const saveAllOrgData = (data: AllOrgData) => {
    localStorage.setItem(ORG_DATA_STORAGE_KEY, JSON.stringify(data));
}

export const orgService = {
    // === Organization Management ===
    getOrganizations: (): Promise<Organization[]> => Promise.resolve(getOrgs()),

    getOrganizationById: (orgId: string): Promise<Organization | undefined> => {
        return Promise.resolve(getOrgs().find(o => o.id === orgId));
    },

    createOrganization: async (name: string, adminEmail: string): Promise<Organization> => {
        const orgs = getOrgs();
        if (orgs.find(o => o.name.toLowerCase() === name.toLowerCase())) {
            throw new Error('An organization with this name already exists.');
        }

        const newOrg: Organization = {
            id: Date.now().toString(),
            name,
            adminEmail
        };

        // Create initial data for the org
        const allData = getAllOrgData();
        allData[newOrg.id] = { announcements: [], events: [], tasks: [] };

        // Save org and data
        saveOrgs([...orgs, newOrg]);
        saveAllOrgData(allData);

        // Make the specified user an admin of this new org
        await authService.makeUserOrgAdmin(adminEmail, newOrg.id);

        return newOrg;
    },

    // === Content Management ===
    getOrgData: (orgId: string): Promise<OrgData> => {
        const allData = getAllOrgData();
        return Promise.resolve(allData[orgId] || { announcements: [], events: [], tasks: [] });
    },

    // Announcements
    addAnnouncement: (orgId: string, data: Omit<Announcement, 'id' | 'organizationId'>): Promise<Announcement> => {
        const allData = getAllOrgData();
        const newAnnouncement: Announcement = { ...data, id: Date.now(), organizationId: orgId };
        allData[orgId].announcements.unshift(newAnnouncement);
        saveAllOrgData(allData);
        return Promise.resolve(newAnnouncement);
    },
    deleteAnnouncement: (orgId: string, announcementId: number): Promise<void> => {
        const allData = getAllOrgData();
        allData[orgId].announcements = allData[orgId].announcements.filter(a => a.id !== announcementId);
        saveAllOrgData(allData);
        return Promise.resolve();
    },

    // Events
    addEvent: (orgId: string, data: Omit<ClubEvent, 'id' | 'organizationId'>): Promise<ClubEvent> => {
        const allData = getAllOrgData();
        const newEvent: ClubEvent = { ...data, id: Date.now(), organizationId: orgId };
        allData[orgId].events.push(newEvent);
        allData[orgId].events.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        saveAllOrgData(allData);
        return Promise.resolve(newEvent);
    },
    deleteEvent: (orgId: string, eventId: number): Promise<void> => {
        const allData = getAllOrgData();
        allData[orgId].events = allData[orgId].events.filter(e => e.id !== eventId);
        saveAllOrgData(allData);
        return Promise.resolve();
    },

    // Tasks
    addTask: (orgId: string, data: Omit<ProjectTask, 'id' | 'organizationId' | 'status'>): Promise<ProjectTask> => {
        const allData = getAllOrgData();
        const newTask: ProjectTask = { ...data, id: Date.now(), organizationId: orgId, status: 'To Do' as TaskStatus };
        allData[orgId].tasks.unshift(newTask);
        saveAllOrgData(allData);
        return Promise.resolve(newTask);
    },
    deleteTask: (orgId: string, taskId: number): Promise<void> => {
        const allData = getAllOrgData();
        allData[orgId].tasks = allData[orgId].tasks.filter(t => t.id !== taskId);
        saveAllOrgData(allData);
        return Promise.resolve();
    },
     updateTaskStatus: (orgId: string, taskId: number, newStatus: TaskStatus): Promise<void> => {
        const allData = getAllOrgData();
        const taskIndex = allData[orgId].tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            allData[orgId].tasks[taskIndex].status = newStatus;
        }
        saveAllOrgData(allData);
        return Promise.resolve();
    }
};
