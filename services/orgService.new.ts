import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase.config';
import type { Organization, Announcement, ClubEvent, ProjectTask, TaskStatus } from '../types';

export const orgService = {
  // === Organization Management ===
  getOrganizations: async (): Promise<Organization[]> => {
    try {
      const orgsSnapshot = await getDocs(collection(db, 'organizations'));
      return orgsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Organization));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch organizations');
    }
  },

  getOrganizationById: async (orgId: string): Promise<Organization | undefined> => {
    try {
      const orgDoc = await getDoc(doc(db, 'organizations', orgId));
      if (orgDoc.exists()) {
        return { id: orgDoc.id, ...orgDoc.data() } as Organization;
      }
      return undefined;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch organization');
    }
  },

  createOrganization: async (name: string, adminEmail: string): Promise<Organization> => {
    try {
      // Check if organization with this name already exists
      const existingOrgsQuery = query(
        collection(db, 'organizations'),
        where('name', '==', name)
      );
      const existingOrgs = await getDocs(existingOrgsQuery);
      
      if (!existingOrgs.empty) {
        throw new Error('An organization with this name already exists.');
      }

      const orgData = {
        name,
        adminEmail,
        createdAt: Timestamp.now()
      };

      const orgRef = await addDoc(collection(db, 'organizations'), orgData);
      
      return {
        id: orgRef.id,
        name,
        adminEmail
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create organization');
    }
  },

  // === Announcements ===
  getAnnouncements: async (orgId: string): Promise<Announcement[]> => {
    try {
      const announcementsQuery = query(
        collection(db, 'announcements'),
        where('organizationId', '==', orgId),
        orderBy('createdAt', 'desc')
      );
      const announcementsSnapshot = await getDocs(announcementsQuery);
      
      return announcementsSnapshot.docs.map(doc => ({
        id: parseInt(doc.id),
        ...doc.data()
      } as Announcement));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch announcements');
    }
  },

  addAnnouncement: async (orgId: string, data: Omit<Announcement, 'id' | 'organizationId'>): Promise<Announcement> => {
    try {
      const announcementData = {
        ...data,
        organizationId: orgId,
        createdAt: Timestamp.now()
      };

      const announcementRef = await addDoc(collection(db, 'announcements'), announcementData);
      
      return {
        id: parseInt(announcementRef.id),
        ...data,
        organizationId: orgId
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to add announcement');
    }
  },

  deleteAnnouncement: async (announcementId: number): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'announcements', announcementId.toString()));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete announcement');
    }
  },

  // === Events ===
  getEvents: async (orgId: string): Promise<ClubEvent[]> => {
    try {
      const eventsQuery = query(
        collection(db, 'events'),
        where('organizationId', '==', orgId),
        orderBy('date', 'asc')
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      
      return eventsSnapshot.docs.map(doc => ({
        id: parseInt(doc.id),
        ...doc.data()
      } as ClubEvent));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch events');
    }
  },

  addEvent: async (orgId: string, data: Omit<ClubEvent, 'id' | 'organizationId'>): Promise<ClubEvent> => {
    try {
      const eventData = {
        ...data,
        organizationId: orgId,
        createdAt: Timestamp.now()
      };

      const eventRef = await addDoc(collection(db, 'events'), eventData);
      
      return {
        id: parseInt(eventRef.id),
        ...data,
        organizationId: orgId
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to add event');
    }
  },

  deleteEvent: async (eventId: number): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'events', eventId.toString()));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete event');
    }
  },

  // === Tasks ===
  getTasks: async (orgId: string): Promise<ProjectTask[]> => {
    try {
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('organizationId', '==', orgId)
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      
      return tasksSnapshot.docs.map(doc => ({
        id: parseInt(doc.id),
        ...doc.data()
      } as ProjectTask));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch tasks');
    }
  },

  addTask: async (orgId: string, data: Omit<ProjectTask, 'id' | 'organizationId'>): Promise<ProjectTask> => {
    try {
      const taskData = {
        ...data,
        organizationId: orgId,
        createdAt: Timestamp.now()
      };

      const taskRef = await addDoc(collection(db, 'tasks'), taskData);
      
      return {
        id: parseInt(taskRef.id),
        ...data,
        organizationId: orgId
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to add task');
    }
  },

  updateTaskStatus: async (taskId: number, status: TaskStatus): Promise<void> => {
    try {
      await updateDoc(doc(db, 'tasks', taskId.toString()), {
        status
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update task status');
    }
  },

  deleteTask: async (taskId: number): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId.toString()));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete task');
    }
  }
};
