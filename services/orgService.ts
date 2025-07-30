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
      
      // Now assign the admin user to this organization
      try {
        // Find the user by email
        const usersQuery = query(
          collection(db, 'users'),
          where('email', '==', adminEmail)
        );
        const usersSnapshot = await getDocs(usersQuery);
        
        if (!usersSnapshot.empty) {
          const userDoc = usersSnapshot.docs[0];
          // Update the user's organizationId and role
          await updateDoc(doc(db, 'users', userDoc.id), {
            organizationId: orgRef.id,
            role: 'admin' // Ensure they have admin role
          });
        } else {
          console.warn(`Admin user with email ${adminEmail} not found. They will need to be assigned manually.`);
        }
      } catch (assignError) {
        console.error('Failed to assign admin to organization:', assignError);
        // Don't throw here as the organization was created successfully
      }
      
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
      // Try the compound query first (requires composite index)
      const announcementsQuery = query(
        collection(db, 'announcements'),
        where('organizationId', '==', orgId),
        where('isDeleted', '!=', true),
        orderBy('isDeleted'),
        orderBy('createdAt', 'desc')
      );
      const announcementsSnapshot = await getDocs(announcementsQuery);
      
      return announcementsSnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt;
        
        return {
          id: doc.id,
          ...data,
          createdAt
        } as Announcement;
      });
    } catch (error: any) {
      // If the compound query fails (e.g., missing index), try a simpler query
      console.warn('Compound query failed, trying simple query:', error.message);
      try {
        const announcementsQuery = query(
          collection(db, 'announcements'),
          where('organizationId', '==', orgId),
          orderBy('createdAt', 'desc')
        );
        const announcementsSnapshot = await getDocs(announcementsQuery);
        
        return announcementsSnapshot.docs
          .map(doc => {
            const data = doc.data();
            const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt;
            
            return {
              id: doc.id,
              ...data,
              createdAt
            } as Announcement;
          })
          .filter(announcement => !announcement.isDeleted);
      } catch (simpleError: any) {
        console.warn('Simple query also failed, using basic query:', simpleError.message);
        // Final fallback: basic query without ANY orderBy, then sort in memory
        try {
          const basicQuery = query(
            collection(db, 'announcements'),
            where('organizationId', '==', orgId)
          );
          const basicSnapshot = await getDocs(basicQuery);
          
          return basicSnapshot.docs
            .map(doc => {
              const data = doc.data();
              const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt;
              
              return {
                id: doc.id,
                ...data,
                createdAt
              } as Announcement;
            })
            .filter(announcement => !announcement.isDeleted)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } catch (basicError: any) {
          console.error('All announcement queries failed:', basicError);
          // Ultimate fallback: return empty array to prevent app crash
          return [];
        }
      }
    }
  },

  addAnnouncement: async (orgId: string, data: Omit<Announcement, 'id' | 'organizationId' | 'createdAt' | 'authorEmail'>): Promise<Announcement> => {
    try {
      const announcementData = {
        ...data,
        organizationId: orgId,
        authorEmail: data.author, // Assuming author is actually the email
        createdAt: Timestamp.now(),
        isDeleted: false
      };

      const announcementRef = await addDoc(collection(db, 'announcements'), announcementData);
      
      return {
        id: announcementRef.id,
        ...data,
        organizationId: orgId,
        authorEmail: data.author,
        createdAt: new Date().toISOString(),
        isDeleted: false
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to add announcement');
    }
  },

  deleteAnnouncement: async (announcementId: string, deletedBy: string): Promise<void> => {
    try {
      // Soft delete - mark as deleted instead of actually deleting
      await updateDoc(doc(db, 'announcements', announcementId), {
        isDeleted: true,
        deletedAt: Timestamp.now(),
        deletedBy: deletedBy
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete announcement');
    }
  },

  // Get deleted announcements for history
  getDeletedAnnouncements: async (orgId: string): Promise<Announcement[]> => {
    try {
      const announcementsQuery = query(
        collection(db, 'announcements'),
        where('organizationId', '==', orgId),
        where('isDeleted', '==', true),
        orderBy('deletedAt', 'desc')
      );
      const announcementsSnapshot = await getDocs(announcementsQuery);
      
      return announcementsSnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt;
        const deletedAt = data.deletedAt?.toDate ? data.deletedAt.toDate().toISOString() : data.deletedAt;
        
        return {
          id: doc.id,
          ...data,
          createdAt,
          deletedAt
        } as Announcement;
      });
    } catch (error: any) {
      console.warn('Deleted announcements query failed, using fallback:', error);
      // Fallback: basic query without orderBy, then sort in memory
      try {
        const basicQuery = query(
          collection(db, 'announcements'),
          where('organizationId', '==', orgId)
        );
        const basicSnapshot = await getDocs(basicQuery);
        
        return basicSnapshot.docs
          .map(doc => {
            const data = doc.data();
            const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt;
            const deletedAt = data.deletedAt?.toDate ? data.deletedAt.toDate().toISOString() : data.deletedAt;
            
            return {
              id: doc.id,
              ...data,
              createdAt,
              deletedAt
            } as Announcement;
          })
          .filter(announcement => announcement.isDeleted)
          .sort((a, b) => {
            if (!a.deletedAt || !b.deletedAt) return 0;
            return new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime();
          });
      } catch (basicError: any) {
        console.error('Deleted announcements fallback failed:', basicError);
        return [];
      }
    }
  },

  // Permanently delete an announcement
  permanentlyDeleteAnnouncement: async (announcementId: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'announcements', announcementId));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to permanently delete announcement');
    }
  },

  // Restore a deleted announcement
  restoreAnnouncement: async (announcementId: string): Promise<void> => {
    try {
      await updateDoc(doc(db, 'announcements', announcementId), {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to restore announcement');
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
      console.warn('Events query failed, using fallback:', error);
      // Fallback: basic query without orderBy, then sort in memory
      try {
        const basicQuery = query(
          collection(db, 'events'),
          where('organizationId', '==', orgId)
        );
        const basicSnapshot = await getDocs(basicQuery);
        
        return basicSnapshot.docs
          .map(doc => ({
            id: parseInt(doc.id),
            ...doc.data()
          } as ClubEvent))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      } catch (basicError: any) {
        console.error('Events fallback failed:', basicError);
        return [];
      }
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
