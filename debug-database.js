// Debug script to check database contents
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';

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

async function debugDatabase() {
    console.log('🔍 Debugging Database Contents...\n');
    
    try {
        // Check users
        console.log('👥 Users:');
        const usersSnapshot = await getDocs(collection(db, 'users'));
        usersSnapshot.docs.forEach(doc => {
            const data = doc.data();
            console.log(`  - ${data.email} (${data.role}) -> Org: ${data.organizationId || 'None'}`);
        });
        
        // Check organizations
        console.log('\n🏢 Organizations:');
        const orgsSnapshot = await getDocs(collection(db, 'organizations'));
        orgsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            console.log(`  - ${doc.id}: ${data.name} (Admin: ${data.adminEmail})`);
        });
        
        // Check announcements
        console.log('\n📢 Announcements:');
        const announcementsSnapshot = await getDocs(
            query(collection(db, 'announcements'), orderBy('createdAt', 'desc'))
        );
        
        if (announcementsSnapshot.docs.length === 0) {
            console.log('  - No announcements found');
        } else {
            announcementsSnapshot.docs.forEach(doc => {
                const data = doc.data();
                console.log(`  - ${doc.id}: "${data.title}" by ${data.author} (Org: ${data.organizationId}) [Deleted: ${data.isDeleted || false}]`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error debugging database:', error);
    }
}

debugDatabase();
