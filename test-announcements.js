// Test announcement queries to identify the issue
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, where } from 'firebase/firestore';

// Firebase config - use your actual values
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

async function testAnnouncementQueries() {
    console.log('🔍 Testing Announcement Queries...\n');
    
    const orgId = 'aUYVD4JqPIn4SGFwZEvD'; // PTC IMAGE organization
    
    console.log(`Testing queries for organization: ${orgId}\n`);
    
    // Test 1: Compound query (this is what might be failing)
    console.log('🔥 Test 1: Compound query with isDeleted and createdAt orderBy');
    try {
        const compoundQuery = query(
            collection(db, 'announcements'),
            where('organizationId', '==', orgId),
            where('isDeleted', '!=', true),
            orderBy('isDeleted'),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(compoundQuery);
        console.log(`✅ Success! Found ${snapshot.docs.length} announcements`);
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            console.log(`   - ${doc.id}: "${data.title}" [Deleted: ${data.isDeleted || false}]`);
        });
    } catch (error) {
        console.log('❌ Compound query failed:', error.message);
        
        // Test 2: Simpler query (fallback)
        console.log('\n🔥 Test 2: Simple query with organizationId and createdAt orderBy');
        try {
            const simpleQuery = query(
                collection(db, 'announcements'),
                where('organizationId', '==', orgId),
                orderBy('createdAt', 'desc')
            );
            const simpleSnapshot = await getDocs(simpleQuery);
            console.log(`✅ Simple query success! Found ${simpleSnapshot.docs.length} announcements`);
            
            const filteredAnnouncements = simpleSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(ann => !ann.isDeleted);
                
            console.log(`   After filtering deleted: ${filteredAnnouncements.length} announcements`);
            filteredAnnouncements.forEach(ann => {
                console.log(`   - ${ann.id}: "${ann.title}" [Deleted: ${ann.isDeleted || false}]`);
            });
        } catch (simpleError) {
            console.log('❌ Simple query also failed:', simpleError.message);
            
            // Test 3: Most basic query
            console.log('\n🔥 Test 3: Most basic query (organizationId only)');
            try {
                const basicQuery = query(
                    collection(db, 'announcements'),
                    where('organizationId', '==', orgId)
                );
                const basicSnapshot = await getDocs(basicQuery);
                console.log(`✅ Basic query success! Found ${basicSnapshot.docs.length} announcements`);
                basicSnapshot.docs.forEach(doc => {
                    const data = doc.data();
                    console.log(`   - ${doc.id}: "${data.title}" [Deleted: ${data.isDeleted || false}]`);
                });
            } catch (basicError) {
                console.log('❌ Even basic query failed:', basicError.message);
            }
        }
    }
    
    // Test 4: Check if user has correct organizationId
    console.log('\n👤 User Organization Check:');
    try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        usersSnapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.organizationId === orgId) {
                console.log(`   - ${data.email} belongs to org ${orgId}`);
            }
        });
    } catch (error) {
        console.log('❌ Failed to check users:', error.message);
    }
}

testAnnouncementQueries();
