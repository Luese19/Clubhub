// Test the updated orgService announcement fetching
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, where } from 'firebase/firestore';

// Firebase config
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

// Simulate the updated orgService getAnnouncements function
async function getAnnouncements(orgId) {
    console.log(`🔍 Testing updated getAnnouncements for org: ${orgId}`);
    
    try {
        // Try the compound query first (requires composite index)
        console.log('Trying compound query...');
        const announcementsQuery = query(
            collection(db, 'announcements'),
            where('organizationId', '==', orgId),
            where('isDeleted', '!=', true),
            orderBy('isDeleted'),
            orderBy('createdAt', 'desc')
        );
        const announcementsSnapshot = await getDocs(announcementsQuery);
        
        console.log('✅ Compound query succeeded!');
        return announcementsSnapshot.docs.map(doc => {
            const data = doc.data();
            const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt;
            
            return {
                id: doc.id,
                ...data,
                createdAt
            };
        });
    } catch (error) {
        // If the compound query fails (e.g., missing index), try a simpler query
        console.warn('❌ Compound query failed, trying simple query:', error.message);
        try {
            console.log('Trying simple query...');
            const announcementsQuery = query(
                collection(db, 'announcements'),
                where('organizationId', '==', orgId),
                orderBy('createdAt', 'desc')
            );
            const announcementsSnapshot = await getDocs(announcementsQuery);
            
            console.log('✅ Simple query succeeded!');
            return announcementsSnapshot.docs
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
        } catch (simpleError) {
            console.warn('❌ Simple query also failed, using basic query:', simpleError.message);
            // Final fallback: basic query without orderBy, then sort in memory
            try {
                console.log('Trying basic query...');
                const basicQuery = query(
                    collection(db, 'announcements'),
                    where('organizationId', '==', orgId)
                );
                const basicSnapshot = await getDocs(basicQuery);
                
                console.log('✅ Basic query succeeded!');
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
                
                console.log(`Filtered and sorted ${results.length} non-deleted announcements`);
                return results;
            } catch (basicError) {
                throw new Error(basicError.message || 'Failed to fetch announcements');
            }
        }
    }
}

async function testAnnouncements() {
    const orgId = 'aUYVD4JqPIn4SGFwZEvD'; // The PTC IMAGE organization
    
    try {
        const announcements = await getAnnouncements(orgId);
        console.log(`\n📢 Final result: Found ${announcements.length} announcements:`);
        announcements.forEach(ann => {
            console.log(`   - ${ann.id}: "${ann.title}" by ${ann.author} [Deleted: ${ann.isDeleted || false}]`);
            console.log(`     Created: ${ann.createdAt}`);
        });
    } catch (error) {
        console.error('❌ Failed to fetch announcements:', error.message);
    }
}

testAnnouncements();
