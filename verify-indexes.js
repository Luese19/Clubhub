// Verify Firestore Indexes - Run this after creating indexes
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

async function verifyIndexes() {
    console.log('🔍 Verifying Firestore Indexes for Announcements\n');
    
    const orgId = 'aUYVD4JqPIn4SGFwZEvD'; // PTC IMAGE organization
    let indexesWorking = 0;
    let totalIndexes = 3;
    
    console.log(`Testing with organization: ${orgId}\n`);
    
    // Test 1: Primary compound index
    console.log('🧪 Test 1: Primary Compound Index (organizationId + isDeleted + createdAt)');
    try {
        const compoundQuery = query(
            collection(db, 'announcements'),
            where('organizationId', '==', orgId),
            where('isDeleted', '!=', true),
            orderBy('isDeleted'),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(compoundQuery);
        console.log('✅ PRIMARY INDEX WORKING!');
        console.log(`   Found ${snapshot.docs.length} active announcements`);
        indexesWorking++;
    } catch (error) {
        console.log('❌ Primary index missing or still building');
        console.log(`   Error: ${error.message.split('.')[0]}`);
    }
    
    // Test 2: Simple query index
    console.log('\n🧪 Test 2: Simple Query Index (organizationId + createdAt)');
    try {
        const simpleQuery = query(
            collection(db, 'announcements'),
            where('organizationId', '==', orgId),
            orderBy('createdAt', 'desc')
        );
        const simpleSnapshot = await getDocs(simpleQuery);
        console.log('✅ SIMPLE INDEX WORKING!');
        console.log(`   Found ${simpleSnapshot.docs.length} total announcements`);
        indexesWorking++;
    } catch (error) {
        console.log('❌ Simple index missing or still building');
        console.log(`   Error: ${error.message.split('.')[0]}`);
    }
    
    // Test 3: Deleted announcements index
    console.log('\n🧪 Test 3: Deleted Announcements Index (organizationId + isDeleted + deletedAt)');
    try {
        const deletedQuery = query(
            collection(db, 'announcements'),
            where('organizationId', '==', orgId),
            where('isDeleted', '==', true),
            orderBy('deletedAt', 'desc')
        );
        const deletedSnapshot = await getDocs(deletedQuery);
        console.log('✅ DELETED ANNOUNCEMENTS INDEX WORKING!');
        console.log(`   Found ${deletedSnapshot.docs.length} deleted announcements`);
        indexesWorking++;
    } catch (error) {
        console.log('❌ Deleted announcements index missing or still building');
        console.log(`   Error: ${error.message.split('.')[0]}`);
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 INDEX STATUS SUMMARY');
    console.log('='.repeat(60));
    console.log(`Indexes Working: ${indexesWorking}/${totalIndexes}`);
    
    if (indexesWorking === totalIndexes) {
        console.log('🎉 ALL INDEXES ARE WORKING!');
        console.log('✅ Your announcement feature is now fully optimized');
        console.log('🚀 All queries will use fast indexed lookups');
    } else if (indexesWorking > 0) {
        console.log('⚡ PARTIAL SUCCESS - Some indexes are working');
        console.log('⏳ Wait a few minutes for remaining indexes to build');
        console.log('🔄 Run this script again to check progress');
    } else {
        console.log('⏳ NO INDEXES READY YET');
        console.log('📝 Make sure you created the indexes in Firebase Console');
        console.log('⏰ Indexes typically take 1-5 minutes to build');
        console.log('🔗 Firebase Console: https://console.firebase.google.com/v1/r/project/clubhub-19b84/firestore/indexes');
    }
    
    console.log('\n💡 Current Status:');
    console.log('   - Your app is working with fallback queries');
    console.log('   - Creating indexes will improve performance');
    console.log('   - No downtime while indexes are building');
}

verifyIndexes().catch(console.error);
