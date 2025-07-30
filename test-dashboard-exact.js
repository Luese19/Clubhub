// Test Dashboard Component Logic Exactly
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, orderBy } from 'firebase/firestore';

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

// Simulate the orgService.getAnnouncements function exactly
async function getAnnouncements(orgId) {
  console.log('🔍 orgService.getAnnouncements called for orgId:', orgId);
  try {
    // Try the compound query first (requires composite index)
    console.log('📊 Trying compound query...');
    const announcementsQuery = query(
      collection(db, 'announcements'),
      where('organizationId', '==', orgId),
      where('isDeleted', '!=', true),
      orderBy('isDeleted'),
      orderBy('createdAt', 'desc')
    );
    const announcementsSnapshot = await getDocs(announcementsQuery);
    
    const results = announcementsSnapshot.docs.map(doc => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt;
      
      return {
        id: doc.id,
        ...data,
        createdAt
      };
    });
    console.log('✅ Compound query succeeded, found:', results.length, 'announcements');
    return results;
  } catch (error) {
    // If the compound query fails (e.g., missing index), try a simpler query
    console.warn('❌ Compound query failed, trying simple query:', error.message);
    try {
      console.log('📊 Trying simple query...');
      const announcementsQuery = query(
        collection(db, 'announcements'),
        where('organizationId', '==', orgId),
        orderBy('createdAt', 'desc')
      );
      const announcementsSnapshot = await getDocs(announcementsQuery);
      
      const results = announcementsSnapshot.docs
        .map(doc => {
          const data = doc.data();
          const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt;
          
          return {
            id: doc.id,
            ...data,
            createdAt
          };
        })
        .filter(announcement => !announcement.isDeleted);
      console.log('✅ Simple query succeeded, found:', results.length, 'announcements');
      return results;
    } catch (simpleError) {
      console.warn('❌ Simple query also failed, using basic query:', simpleError.message);
      // Final fallback: basic query without ANY orderBy, then sort in memory
      try {
        console.log('📊 Trying basic query...');
        const basicQuery = query(
          collection(db, 'announcements'),
          where('organizationId', '==', orgId)
        );
        const basicSnapshot = await getDocs(basicQuery);
        
        const results = basicSnapshot.docs
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
        console.log('✅ Basic query succeeded, found:', results.length, 'announcements');
        return results;
      } catch (basicError) {
        console.error('❌ All announcement queries failed:', basicError);
        // Ultimate fallback: return empty array to prevent app crash
        return [];
      }
    }
  }
}

async function testDashboardExactly() {
  console.log('🧪 Testing Dashboard Component Logic EXACTLY...\n');

  // Test data from our debug
  const orgId = 'aUYVD4JqPIn4SGFwZEvD';
  const studentUser = {
    email: 'buyer1@gmail.com',
    role: 'student',
    organizationId: 'aUYVD4JqPIn4SGFwZEvD'
  };
  const superAdminUser = {
    email: 'latrivas@paterostechnologicalcollege.edu.ph',
    role: 'superadmin',
    organizationId: null
  };

  console.log('1. 🧪 Testing as STUDENT USER...');
  console.log('User:', studentUser.email, 'role:', studentUser.role, 'orgId:', studentUser.organizationId);
  
  const isAdmin = studentUser.role === 'admin' || studentUser.role === 'superadmin';
  const isSuperAdmin = studentUser.role === 'superadmin';
  const userOrgId = studentUser.organizationId;
  
  console.log('isAdmin:', isAdmin, 'isSuperAdmin:', isSuperAdmin, 'userOrgId:', userOrgId);

  if (isSuperAdmin) {
    console.log('📊 Super admin mode - would fetch all organizations');
  } else if (userOrgId) {
    console.log('👤 Regular user mode - fetching data for orgId:', userOrgId);
    const fetchedAnnouncements = await getAnnouncements(userOrgId);
    console.log(`📢 Fetched ${fetchedAnnouncements.length} announcements for user org`);
    
    fetchedAnnouncements.forEach(ann => {
      console.log(`  - ${ann.id}: "${ann.title}" by ${ann.author}`);
    });
  } else {
    console.log('❌ User has no organization assigned - showing empty state');
  }

  console.log('\n2. 🧪 Testing as SUPER ADMIN USER...');
  console.log('User:', superAdminUser.email, 'role:', superAdminUser.role, 'orgId:', superAdminUser.organizationId);
  
  const isAdminSA = superAdminUser.role === 'admin' || superAdminUser.role === 'superadmin';
  const isSuperAdminSA = superAdminUser.role === 'superadmin';
  const userOrgIdSA = superAdminUser.organizationId;
  
  console.log('isAdmin:', isAdminSA, 'isSuperAdmin:', isSuperAdminSA, 'userOrgId:', userOrgIdSA);

  if (isSuperAdminSA) {
    console.log('📊 Super admin mode - fetching all organizations');
    
    // Get all organizations
    const orgsQuery = query(collection(db, 'organizations'));
    const orgsSnapshot = await getDocs(orgsQuery);
    const orgs = orgsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('📊 Found organizations:', orgs.length);
    
    // For super admin, get all announcements across organizations
    const allAnnouncements = [];
    
    for (const org of orgs) {
      console.log(`📊 Fetching data for org: ${org.name} (${org.id})`);
      const orgAnnouncements = await getAnnouncements(org.id);
      console.log(`📢 Found ${orgAnnouncements.length} announcements for ${org.name}`);
      allAnnouncements.push(...orgAnnouncements);
    }
    
    console.log(`📊 Total announcements across all orgs: ${allAnnouncements.length}`);
    allAnnouncements.forEach(ann => {
      console.log(`  - ${ann.id}: "${ann.title}" by ${ann.author} (Org: ${ann.organizationId})`);
    });
  } else if (userOrgIdSA) {
    console.log('👤 Regular user mode - fetching data for orgId:', userOrgIdSA);
  } else {
    console.log('❌ User has no organization assigned - showing empty state');
  }
}

testDashboardExactly();
