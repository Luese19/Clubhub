// Test Dashboard Data Fetching
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAOLOenZ8P11SfkHoMKNFBmhBNZe2jvJUo",
  authDomain: "clubhub-19b84.firebaseapp.com",
  projectId: "clubhub-19b84",
  storageBucket: "clubhub-19b84.firebasestorage.app",
  messagingSenderId: "206243777776",
  appId: "1:206243777776:web:e0a3d7a3c5ea74d36e0635",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testDashboardDataFetch() {
  console.log('🧪 Testing Dashboard Data Fetching Logic...\n');

  const orgId = 'aUYVD4JqPIn4SGFwZEvD';
  console.log('Testing for organization:', orgId);

  try {
    console.log('\n1. 🔍 Testing basic announcements query...');
    const basicQuery = query(
      collection(db, 'announcements'),
      where('organizationId', '==', orgId)
    );
    const basicSnapshot = await getDocs(basicQuery);
    
    console.log(`Found ${basicSnapshot.docs.length} total announcements`);
    
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

    console.log(`After filtering (non-deleted): ${announcements.length} announcements`);
    
    announcements.forEach(ann => {
      console.log(`  - ${ann.id}: "${ann.title}" by ${ann.author} [Deleted: ${ann.isDeleted}]`);
      console.log(`    Created: ${ann.createdAt}`);
      console.log(`    Organization: ${ann.organizationId}`);
    });

    console.log('\n2. 🔍 Testing users query...');
    const usersQuery = query(collection(db, 'users'));
    const usersSnapshot = await getDocs(usersQuery);
    
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    users.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) -> Org: ${user.organizationId || 'None'}`);
    });

    // Test a specific user scenario
    console.log('\n3. 🧪 Simulating Dashboard Logic for buyer1@gmail.com...');
    const testUser = users.find(u => u.email === 'buyer1@gmail.com');
    
    if (testUser) {
      console.log('Test user found:', {
        email: testUser.email,
        role: testUser.role,
        organizationId: testUser.organizationId
      });

      if (testUser.organizationId === orgId) {
        console.log('✅ User organization matches announcement organization');
        console.log(`📢 User should see ${announcements.length} announcements`);
      } else {
        console.log('❌ Organization mismatch!');
        console.log(`   User org: ${testUser.organizationId}`);
        console.log(`   Announcement org: ${orgId}`);
      }
    } else {
      console.log('❌ Test user not found');
    }

    console.log('\n4. 🧪 Simulating Dashboard Logic for superadmin...');
    const superAdminUser = users.find(u => u.role === 'superadmin');
    
    if (superAdminUser) {
      console.log('Super admin found:', {
        email: superAdminUser.email,
        role: superAdminUser.role,
        organizationId: superAdminUser.organizationId
      });

      console.log('✅ Super admin should see ALL announcements from ALL organizations');
      console.log(`📢 Super admin should see ${announcements.length} announcements from this org`);
    }

  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
}

testDashboardDataFetch();
