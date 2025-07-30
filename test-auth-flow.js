// Test Authentication and Dashboard Flow
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAOLOenZ8P11SfkHoMKNFBmhBNZe2jvJUo",
  authDomain: "clubhub-19b84.firebaseapp.com",
  projectId: "clubhub-19b84",
  storageBucket: "clubhub-19b84.firebasestorage.app",
  messagingSenderId: "206243777776",
  appId: "1:206243777776:web:e0a3d7a3c5ea74d36e0635",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function testFullAuthFlow() {
  console.log('🔐 Testing Full Authentication Flow...\n');

  try {
    // Test signing in as the student user
    console.log('1. 🧪 Attempting to sign in as student...');
    
    // Note: We don't actually have the password, so let's just test the user data retrieval
    // Instead, let's simulate the authService.getCurrentUser flow
    
    console.log('2. 🔍 Testing user data retrieval...');
    
    // Find the student user in Firestore
    const usersQuery = query(
      collection(db, 'users'),
      where('email', '==', 'buyer1@gmail.com')
    );
    const usersSnapshot = await getDocs(usersQuery);
    
    if (usersSnapshot.empty) {
      console.log('❌ Student user not found in Firestore');
      return;
    }
    
    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();
    
    console.log('✅ Found student user:', {
      id: userDoc.id,
      email: userData.email,
      role: userData.role,
      organizationId: userData.organizationId,
      name: userData.name
    });
    
    // Test the Dashboard component flow for this user
    console.log('\n3. 🎯 Testing Dashboard component flow...');
    
    const currentUser = {
      email: userData.email,
      role: userData.role,
      organizationId: userData.organizationId,
      name: userData.name || '',
      createdAt: userData.createdAt || new Date().toISOString()
    };
    
    const isAdmin = currentUser.role === 'admin' || currentUser.role === 'superadmin';
    const isSuperAdmin = currentUser.role === 'superadmin';
    const orgId = currentUser.organizationId;
    
    console.log('Dashboard component state would be:', {
      isAdmin,
      isSuperAdmin,
      orgId,
      userEmail: currentUser.email,
      userRole: currentUser.role
    });
    
    if (isSuperAdmin) {
      console.log('🔄 Super admin flow would trigger...');
    } else if (orgId) {
      console.log('🔄 Regular user flow would trigger for orgId:', orgId);
      
      // Test the actual query that would be called
      console.log('4. 🧪 Testing announcement query for this user...');
      const basicQuery = query(
        collection(db, 'announcements'),
        where('organizationId', '==', orgId)
      );
      const basicSnapshot = await getDocs(basicQuery);
      
      const announcements = basicSnapshot.docs
        .map(doc => {
          const data = doc.data();
          const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt;
          
          return {
            id: doc.id,
            ...data,
            createdAt
          };
        })
        .filter(announcement => !announcement.isDeleted)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      console.log(`✅ Query successful - found ${announcements.length} announcements`);
      console.log('📢 Announcements that SHOULD appear in Dashboard:');
      announcements.forEach(ann => {
        console.log(`  - ${ann.id}: "${ann.title}" by ${ann.author}`);
        console.log(`    Created: ${ann.createdAt}`);
        console.log(`    Deleted: ${ann.isDeleted || false}`);
      });
      
      if (announcements.length === 0) {
        console.log('❌ No announcements found - Dashboard will show empty state');
      } else {
        console.log('✅ Announcements found - Dashboard SHOULD display them');
      }
    } else {
      console.log('❌ User has no organization - Dashboard would show empty state');
    }
    
    // Test super admin flow too
    console.log('\n5. 🧪 Testing Super Admin user...');
    const superAdminQuery = query(
      collection(db, 'users'),
      where('email', '==', 'latrivas@paterostechnologicalcollege.edu.ph')
    );
    const superAdminSnapshot = await getDocs(superAdminQuery);
    
    if (!superAdminSnapshot.empty) {
      const superAdminDoc = superAdminSnapshot.docs[0];
      const superAdminData = superAdminDoc.data();
      
      console.log('✅ Found super admin user:', {
        email: superAdminData.email,
        role: superAdminData.role,
        organizationId: superAdminData.organizationId
      });
      
      const superUser = {
        email: superAdminData.email,
        role: superAdminData.role,
        organizationId: superAdminData.organizationId,
        name: superAdminData.name || '',
        createdAt: superAdminData.createdAt || new Date().toISOString()
      };
      
      const isSuperAdminTest = superUser.role === 'superadmin';
      
      if (isSuperAdminTest) {
        console.log('✅ Super admin would see ALL announcements from ALL organizations');
      }
    }
    
  } catch (error) {
    console.error('❌ Error during authentication flow test:', error);
  }
}

testFullAuthFlow();
