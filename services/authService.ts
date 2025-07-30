import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, addDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';
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

// Initialize super admin if it doesn't exist
const initializeSuperAdmin = async (): Promise<void> => {
  if (!isFirebaseConfigured()) return;
  
  const superAdminEmail = import.meta.env.VITE_SUPER_ADMIN_EMAIL;
  const superAdminPassword = import.meta.env.VITE_SUPER_ADMIN_PASSWORD;
  
  if (!superAdminEmail || !superAdminPassword) {
    console.log('Super admin credentials not configured');
    return;
  }

  try {
    // Check if super admin already exists
    const usersQuery = query(collection(db, 'users'), where('role', '==', 'superadmin'));
    const snapshot = await getDocs(usersQuery);
    
    if (!snapshot.empty) {
      console.log('Super admin already exists');
      return;
    }

    // Create super admin account
    console.log('Creating super admin account...');
    const userCredential = await createUserWithEmailAndPassword(auth, superAdminEmail, superAdminPassword);
    const firebaseUser = userCredential.user;

    // Create super admin document in Firestore
    const userData = {
      email: firebaseUser.email,
      role: 'superadmin' as UserRole,
      organizationId: null,
      name: 'Super Admin',
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), userData);
    console.log('Super admin account created successfully');
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Super admin email already registered, checking role...');
      // The email exists but might not have superadmin role, we should handle this case
    } else {
      console.error('Failed to create super admin:', error);
    }
  }
};

export const authService = {
  // Initialize super admin on first load
  initialize: async (): Promise<void> => {
    await initializeSuperAdmin();
  },

  signUp: async (email: string, password: string): Promise<User> => {
    if (!isFirebaseConfigured()) {
      throw new Error("Firebase is not configured. Please set up your Firebase environment variables.");
    }
    
    try {
      console.log('Attempting to create user with Firebase Auth...');
      console.log('Auth object:', auth);
      console.log('Email:', email);
      
      // Initialize super admin first if needed
      await initializeSuperAdmin();
      
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      console.log('User created successfully:', firebaseUser.uid);

      // Check if this user was previously invited (exists in database)
      let existingUserData = null;
      try {
        const usersQuery = query(
          collection(db, 'users'), 
          where('email', '==', email)
        );
        const usersSnapshot = await getDocs(usersQuery);
        
        if (!usersSnapshot.empty) {
          existingUserData = usersSnapshot.docs[0].data();
          console.log('Found existing invited user data:', existingUserData);
        }
      } catch (error) {
        console.warn('Failed to check for existing user data:', error);
      }

      // Determine role and organization assignment
      const superAdminEmail = import.meta.env.VITE_SUPER_ADMIN_EMAIL;
      let role: UserRole;
      let organizationId: string | null = null;
      
      if (email === superAdminEmail) {
        role = 'superadmin';
        organizationId = null; // Super admin doesn't belong to any specific org
      } else if (existingUserData && existingUserData.isInvited) {
        // Use existing invited user data
        role = existingUserData.role;
        organizationId = existingUserData.organizationId;
        console.log(`Using existing invitation data: role=${role}, orgId=${organizationId}`);
      } else {
        // Auto-assign new users to the first available organization as students
        try {
          const orgsSnapshot = await getDocs(collection(db, 'organizations'));
          if (!orgsSnapshot.empty) {
            // Assign to the first organization as a student
            organizationId = orgsSnapshot.docs[0].id;
            role = 'student';
          } else {
            // No organizations exist, create user without organization
            role = 'student';
            organizationId = null;
          }
        } catch (orgError) {
          console.warn('Failed to fetch organizations for auto-assignment:', orgError);
          role = 'student';
          organizationId = null;
        }
      }

      // Create or update user document in Firestore
      const userData = {
        email: firebaseUser.email,
        role,
        organizationId,
        name: email === superAdminEmail ? 'Super Admin' : (existingUserData?.name || ''),
        createdAt: existingUserData?.createdAt || new Date().toISOString(),
        isInvited: false // Clear the invited flag since they now have a full account
      };

      // If user was previously invited, we need to delete the old record and create new one with Firebase UID
      if (existingUserData && existingUserData.isInvited) {
        try {
          // Find and delete the old invited user record
          const usersQuery = query(
            collection(db, 'users'), 
            where('email', '==', email)
          );
          const usersSnapshot = await getDocs(usersQuery);
          
          if (!usersSnapshot.empty) {
            // Delete the old record(s)
            for (const oldDoc of usersSnapshot.docs) {
              await updateDoc(doc(db, 'users', oldDoc.id), { deleted: true });
            }
          }
        } catch (error) {
          console.warn('Failed to clean up old invited user record:', error);
        }
      }

      // Create the new user document with Firebase UID as the document ID
      await setDoc(doc(db, 'users', firebaseUser.uid), userData);

      console.log('User created with data:', userData);

      return {
        email: firebaseUser.email!,
        role,
        organizationId,
        name: userData.name,
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
      // Check if this is a user-not-found error and if they have been invited
      if (error.code === 'auth/user-not-found') {
        // Check if this email exists in our database as an invited user
        try {
          const usersQuery = query(
            collection(db, 'users'), 
            where('email', '==', email)
          );
          const usersSnapshot = await getDocs(usersQuery);
          
          if (!usersSnapshot.empty) {
            const userData = usersSnapshot.docs[0].data();
            if (userData.isInvited) {
              throw new Error('You have been invited to join this organization. Please create your account by clicking "Create Account" and using this email address.');
            }
          }
        } catch (dbError) {
          // If database check fails, fall through to default error
        }
      }
      
      // Default error handling
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email address. Please create an account first.');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password. Please try again.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address format.');
      } else {
        throw new Error(error.message || 'Failed to sign in');
      }
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
        // User doesn't exist, create a new user record
        console.log(`User ${email} not found, creating new user record...`);
        
        const userData = {
          email: email,
          role: 'student' as UserRole,
          organizationId: orgId,
          name: '',
          createdAt: new Date().toISOString(),
          isInvited: true // Flag to indicate this user was invited/added by admin
        };

        // Create user document with a generated ID
        await addDoc(collection(db, 'users'), userData);
        console.log(`New user record created for ${email} and assigned to organization ${orgId}`);
      } else {
        // User exists, update their organization
        const userDoc = usersSnapshot.docs[0];
        await updateDoc(doc(db, 'users', userDoc.id), {
          organizationId: orgId
        });
        console.log(`Existing user ${email} assigned to organization ${orgId}`);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to assign user to organization');
    }
  },

  // Fix admin assignment - assigns user to org and sets them as admin
  assignAdminToOrg: async (email: string, orgId: string): Promise<void> => {
    try {
      // Find user by email
      const usersQuery = query(
        collection(db, 'users'), 
        where('email', '==', email)
      );
      const usersSnapshot = await getDocs(usersQuery);
      
      if (usersSnapshot.empty) {
        // User doesn't exist, create a new admin user record
        console.log(`Admin user ${email} not found, creating new admin record...`);
        
        const userData = {
          email: email,
          role: 'admin' as UserRole,
          organizationId: orgId,
          name: '',
          createdAt: new Date().toISOString(),
          isInvited: true // Flag to indicate this user was invited/added by admin
        };

        // Create user document with a generated ID
        await addDoc(collection(db, 'users'), userData);
        console.log(`New admin record created for ${email} and assigned to organization ${orgId}`);
      } else {
        // User exists, update their organization and role
        const userDoc = usersSnapshot.docs[0];
        await updateDoc(doc(db, 'users', userDoc.id), {
          organizationId: orgId,
          role: 'admin'
        });
        console.log(`Existing user ${email} assigned as admin to organization ${orgId}`);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to assign admin to organization');
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
