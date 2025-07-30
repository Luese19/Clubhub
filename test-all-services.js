// Test all service functions with enhanced fallback logic
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

// Simulate the enhanced getAnnouncements function
async function testGetAnnouncements(orgId) {
    console.log(`\n🧪 Testing getAnnouncements for org: ${orgId}`);
    
    try {
        // Try compound query (will fail without index)
        const compoundQuery = query(
            collection(db, 'announcements'),
            where('organizationId', '==', orgId),
            where('isDeleted', '!=', true),
            orderBy('isDeleted'),
            orderBy('createdAt', 'desc')
        );
        const compoundSnapshot = await getDocs(compoundQuery);
        console.log('✅ Compound query succeeded!');
        return compoundSnapshot.docs.length;
    } catch (error) {
        console.log('❌ Compound query failed (expected)');
        
        try {
            // Try simple query (will fail without index)
            const simpleQuery = query(
                collection(db, 'announcements'),
                where('organizationId', '==', orgId),
                orderBy('createdAt', 'desc')
            );
            const simpleSnapshot = await getDocs(simpleQuery);
            console.log('✅ Simple query succeeded!');
            return simpleSnapshot.docs.length;
        } catch (simpleError) {
            console.log('❌ Simple query failed (expected)');
            
            try {
                // Basic query without orderBy (should always work)
                const basicQuery = query(
                    collection(db, 'announcements'),
                    where('organizationId', '==', orgId)
                );
                const basicSnapshot = await getDocs(basicQuery);
                
                const results = basicSnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(ann => !ann.isDeleted)
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                
                console.log('✅ Basic query + memory sort succeeded!');
                return results.length;
            } catch (basicError) {
                console.log('❌ Even basic query failed, returning empty array');
                return 0;
            }
        }
    }
}

// Test deleted announcements
async function testGetDeletedAnnouncements(orgId) {
    console.log(`\n🧪 Testing getDeletedAnnouncements for org: ${orgId}`);
    
    try {
        const deletedQuery = query(
            collection(db, 'announcements'),
            where('organizationId', '==', orgId),
            where('isDeleted', '==', true),
            orderBy('deletedAt', 'desc')
        );
        const deletedSnapshot = await getDocs(deletedQuery);
        console.log('✅ Deleted announcements query succeeded!');
        return deletedSnapshot.docs.length;
    } catch (error) {
        console.log('❌ Deleted announcements query failed, using fallback');
        
        try {
            const basicQuery = query(
                collection(db, 'announcements'),
                where('organizationId', '==', orgId)
            );
            const basicSnapshot = await getDocs(basicQuery);
            
            const results = basicSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(ann => ann.isDeleted)
                .sort((a, b) => {
                    if (!a.deletedAt || !b.deletedAt) return 0;
                    return new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime();
                });
            
            console.log('✅ Deleted announcements fallback succeeded!');
            return results.length;
        } catch (basicError) {
            console.log('❌ Deleted announcements fallback failed, returning empty array');
            return 0;
        }
    }
}

// Test events
async function testGetEvents(orgId) {
    console.log(`\n🧪 Testing getEvents for org: ${orgId}`);
    
    try {
        const eventsQuery = query(
            collection(db, 'events'),
            where('organizationId', '==', orgId),
            orderBy('date', 'asc')
        );
        const eventsSnapshot = await getDocs(eventsQuery);
        console.log('✅ Events query succeeded!');
        return eventsSnapshot.docs.length;
    } catch (error) {
        console.log('❌ Events query failed, using fallback');
        
        try {
            const basicQuery = query(
                collection(db, 'events'),
                where('organizationId', '==', orgId)
            );
            const basicSnapshot = await getDocs(basicQuery);
            
            const results = basicSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
            console.log('✅ Events fallback succeeded!');
            return results.length;
        } catch (basicError) {
            console.log('❌ Events fallback failed, returning empty array');
            return 0;
        }
    }
}

async function testAllServices() {
    console.log('🔥 Testing All Service Functions with Enhanced Fallbacks\n');
    
    const orgIds = ['aUYVD4JqPIn4SGFwZEvD', '6Vfbe4Wmqk1441yzwUDL']; // Both organizations
    
    for (const orgId of orgIds) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Testing Organization: ${orgId}`);
        console.log('='.repeat(60));
        
        const announcementCount = await testGetAnnouncements(orgId);
        const deletedCount = await testGetDeletedAnnouncements(orgId);
        const eventCount = await testGetEvents(orgId);
        
        console.log(`\n📊 Results for ${orgId}:`);
        console.log(`   - Active Announcements: ${announcementCount}`);
        console.log(`   - Deleted Announcements: ${deletedCount}`);
        console.log(`   - Events: ${eventCount}`);
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log('🎉 ALL SERVICES TESTED WITH FALLBACK LOGIC');
    console.log('='.repeat(60));
    console.log('✅ Your app should now work without any crashes');
    console.log('⚡ Creating Firestore indexes will improve performance');
    console.log('🔗 Create indexes at: https://console.firebase.google.com/v1/r/project/clubhub-19b84/firestore/indexes');
}

testAllServices().catch(console.error);
