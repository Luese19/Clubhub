import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase.config';
import type { User, UserRole } from '../types';

// Check if Firebase is configured
const isFirebaseConfigured = () => {
  return auth && db && import.meta.env.VITE_FIREBASE_API_KEY !== "your_api_key_here";
};

// Convert Firebase user to our User type
const convertFirebaseUser = async (firebaseUser: FirebaseUser): Promise<User> => {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured. Please set up your Firebase environment variables.");
  }
  
  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
  const userData = userDoc.data();
  
  return {
    email: firebaseUser.email!,
    role: userData?.role || 'student' as UserRole,
    organizationId: userData?.organizationId || null,
    name: userData?.name || firebaseUser.displayName || '',
    createdAt: userData?.createdAt || new Date().toISOString(),
  };
};

export const authService = {
  signUp: async (email: string, password: string): Promise<User> => {
    if (!isFirebaseConfigured()) {
      throw new Error("Firebase is not configured. Please set up your Firebase environment variables.");
    }
    
    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Check if this is the first user (they become admin)
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      const role: UserRole = usersSnapshot.empty ? 'admin' : 'student';

      // Create user document in Firestore
      const userData = {
        email: firebaseUser.email,
        role,
        organizationId: null,
        name: '',
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);

      return {
        email: firebaseUser.email!,
        role,
        organizationId: null,
        name: '',
        createdAt: userData.createdAt,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create account');
    }
  },

  signIn: async (email: string, password: string): Promise<User> => {
    if (!isFirebaseConfigured()) {
      throw new Error("Firebase is not configured. Please set up your Firebase environment variables.");
    }
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      return await convertFirebaseUser(firebaseUser);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in');
    }
  },

  signOut: async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign out');
    }
  },

  getCurrentUser: (): Promise<User | null> => {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        unsubscribe();
        if (firebaseUser) {
          try {
            const user = await convertFirebaseUser(firebaseUser);
            resolve(user);
          } catch (error) {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    });
  },

  isAuthenticated: (): boolean => {
    return auth.currentUser !== null;
  },

  getUsersByOrg: async (orgId: string): Promise<User[]> => {
    try {
      const usersQuery = query(
        collection(db, 'users'), 
        where('organizationId', '==', orgId)
      );
      const usersSnapshot = await getDocs(usersQuery);
      
      return usersSnapshot.docs.map(doc => ({
        email: doc.data().email,
        role: doc.data().role,
        organizationId: doc.data().organizationId,
        name: doc.data().name,
        createdAt: doc.data().createdAt,
      }));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch users');
    }
  },

  assignUserToOrg: async (email: string, orgId: string): Promise<void> => {
    try {
      // Find user by email
      const usersQuery = query(
        collection(db, 'users'), 
        where('email', '==', email)
      );
      const usersSnapshot = await getDocs(usersQuery);
      
      if (usersSnapshot.empty) {
        throw new Error('User not found');
      }

      const userDoc = usersSnapshot.docs[0];
      await updateDoc(doc(db, 'users', userDoc.id), {
        organizationId: orgId
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to assign user to organization');
    }
  },

  removeUserFromOrg: async (email: string, orgId: string): Promise<void> => {
    try {
      // Find user by email
      const usersQuery = query(
        collection(db, 'users'), 
        where('email', '==', email),
        where('organizationId', '==', orgId)
      );
      const usersSnapshot = await getDocs(usersQuery);
      
      if (usersSnapshot.empty) {
        throw new Error('User not found in organization');
      }

      const userDoc = usersSnapshot.docs[0];
      await updateDoc(doc(db, 'users', userDoc.id), {
        organizationId: null
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to remove user from organization');
    }
  },

  onAuthStateChange: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const user = await convertFirebaseUser(firebaseUser);
          callback(user);
        } catch (error) {
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  },
};
