import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { orgService } from '../services/orgService';
import type { User, Organization, Announcement } from '../types';

interface DebugInfoProps {
  currentUser: User;
}

const DebugInfo: React.FC<DebugInfoProps> = ({ currentUser }) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allOrgs, setAllOrgs] = useState<Organization[]>([]);
  const [allAnnouncements, setAllAnnouncements] = useState<Announcement[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchDebugData = async () => {
      try {
        // Fetch all organizations
        const orgs = await orgService.getOrganizations();
        setAllOrgs(orgs);

        // Fetch users for each organization
        const usersPromises = orgs.map(org => authService.getUsersByOrg(org.id));
        const usersByOrg = await Promise.all(usersPromises);
        const flatUsers = usersByOrg.flat();
        setAllUsers(flatUsers);

        // Fetch announcements for each organization
        const announcementsPromises = orgs.map(org => orgService.getAnnouncements(org.id));
        const announcementsByOrg = await Promise.all(announcementsPromises);
        const flatAnnouncements = announcementsByOrg.flat();
        setAllAnnouncements(flatAnnouncements);
      } catch (error) {
        console.error('Failed to fetch debug data:', error);
      }
    };

    fetchDebugData();
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors z-50"
      >
        🐛 Debug
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg p-6 max-w-4xl w-full max-h-full overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">🐛 Debug Information</h2>
          <button
            onClick={() => setIsVisible(false)}
            className="text-slate-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          {/* Current User */}
          <div className="bg-slate-700 p-4 rounded-lg">
            <h3 className="text-cyan-400 font-bold mb-3">Current User</h3>
            <div className="space-y-1 text-slate-300">
              <p><strong>Email:</strong> {currentUser.email}</p>
              <p><strong>Role:</strong> {currentUser.role}</p>
              <p><strong>Organization ID:</strong> {currentUser.organizationId || 'None'}</p>
              <p><strong>Name:</strong> {currentUser.name || 'Not set'}</p>
            </div>
          </div>

          {/* Organizations */}
          <div className="bg-slate-700 p-4 rounded-lg">
            <h3 className="text-green-400 font-bold mb-3">Organizations ({allOrgs.length})</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {allOrgs.map(org => (
                <div key={org.id} className="bg-slate-600 p-2 rounded text-slate-300">
                  <p className="font-medium">{org.name}</p>
                  <p className="text-xs text-slate-400">ID: {org.id}</p>
                  <p className="text-xs text-slate-400">Admin: {org.adminEmail}</p>
                </div>
              ))}
              {allOrgs.length === 0 && (
                <p className="text-slate-400 italic">No organizations found</p>
              )}
            </div>
          </div>

          {/* Users */}
          <div className="bg-slate-700 p-4 rounded-lg">
            <h3 className="text-purple-400 font-bold mb-3">All Users ({allUsers.length})</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {allUsers.map((user, index) => (
                <div key={index} className="bg-slate-600 p-2 rounded text-slate-300">
                  <p className="font-medium">{user.email}</p>
                  <p className="text-xs text-slate-400">Role: {user.role}</p>
                  <p className="text-xs text-slate-400">Org: {user.organizationId || 'None'}</p>
                </div>
              ))}
              {allUsers.length === 0 && (
                <p className="text-slate-400 italic">No users found</p>
              )}
            </div>
          </div>

          {/* Announcements */}
          <div className="bg-slate-700 p-4 rounded-lg md:col-span-3">
            <h3 className="text-yellow-400 font-bold mb-3">All Announcements ({allAnnouncements.length})</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {allAnnouncements.map(announcement => (
                <div key={announcement.id} className="bg-slate-600 p-3 rounded text-slate-300">
                  <p className="font-medium">{announcement.title}</p>
                  <p className="text-sm text-slate-400 mt-1">{announcement.content}</p>
                  <div className="flex justify-between text-xs text-slate-500 mt-2">
                    <span>By: {announcement.author}</span>
                    <span>Org: {announcement.organizationId}</span>
                    <span>Deleted: {announcement.isDeleted ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              ))}
              {allAnnouncements.length === 0 && (
                <p className="text-slate-400 italic">No announcements found</p>
              )}
            </div>
          </div>
        </div>

        {/* Analysis */}
        <div className="mt-6 bg-slate-900 p-4 rounded-lg">
          <h3 className="text-red-400 font-bold mb-3">🔍 Analysis</h3>
          <div className="text-sm text-slate-300 space-y-2">
            {!currentUser.organizationId && (
              <p className="text-red-300">⚠️ Current user has no organization assigned!</p>
            )}
            {allOrgs.length === 0 && (
              <p className="text-red-300">⚠️ No organizations exist in the database!</p>
            )}
            {allAnnouncements.length === 0 && (
              <p className="text-yellow-300">⚠️ No announcements exist in the database!</p>
            )}
            {currentUser.organizationId && allAnnouncements.length > 0 && (
              <p className="text-green-300">✅ User has organization and announcements exist!</p>
            )}
            
            {/* Show announcement-organization matching */}
            {currentUser.organizationId && allAnnouncements.length > 0 && (
              <div className="mt-3 p-2 bg-slate-800 rounded">
                <p className="text-blue-300 font-medium">Announcement Matching:</p>
                <p className="text-xs text-slate-400">User Org ID: {currentUser.organizationId}</p>
                {allAnnouncements.map(ann => (
                  <p key={ann.id} className={`text-xs ${ann.organizationId === currentUser.organizationId ? 'text-green-300' : 'text-red-300'}`}>
                    Announcement "{ann.title}" → Org: {ann.organizationId} {ann.organizationId === currentUser.organizationId ? '✅' : '❌'}
                  </p>
                ))}
              </div>
            )}
          </div>
          
          {/* Quick Fix Actions */}
          {(!currentUser.organizationId && allOrgs.length > 0) && (
            <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg">
              <p className="text-blue-300 text-sm mb-2">Quick Fix: Assign current user to first organization</p>
              <button
                onClick={async () => {
                  try {
                    await authService.assignUserToOrg(currentUser.email, allOrgs[0].id);
                    alert('User assigned! Please refresh the page or re-login to see the changes.');
                    // Force page refresh to reload user data
                    window.location.reload();
                  } catch (error) {
                    alert('Failed to assign user: ' + error);
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Assign to {allOrgs[0]?.name}
              </button>
            </div>
          )}
          
          {/* Create Test Announcement Button */}
          {currentUser.organizationId && allAnnouncements.length === 0 && (
            <div className="mt-4 p-3 bg-green-900/30 border border-green-700/50 rounded-lg">
              <p className="text-green-300 text-sm mb-2">Quick Fix: Create a test announcement</p>
              <button
                onClick={async () => {
                  try {
                    await orgService.addAnnouncement(currentUser.organizationId!, {
                      title: 'Test Announcement',
                      content: 'This is a test announcement created by the debug tool.',
                      author: currentUser.email
                    });
                    alert('Test announcement created! Please refresh the page.');
                  } catch (error) {
                    alert('Failed to create announcement: ' + error);
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Create Test Announcement
              </button>
            </div>
          )}
          
          {/* Refresh User Data Button */}
          <div className="mt-4 p-3 bg-orange-900/30 border border-orange-700/50 rounded-lg">
            <p className="text-orange-300 text-sm mb-2">Force Refresh User Data (if user was recently assigned)</p>
            <button
              onClick={async () => {
                try {
                  // Force re-authentication to refresh user data
                  const freshUser = await authService.getCurrentUser();
                  if (freshUser) {
                    alert(`Fresh user data: ${freshUser.email} → Org: ${freshUser.organizationId || 'None'}`);
                    // This won't update the current component state, but shows what the database has
                  } else {
                    alert('No user found');
                  }
                } catch (error) {
                  alert('Failed to refresh user data: ' + error);
                }
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm transition-colors mr-2"
            >
              Check Fresh User Data
            </button>
            
            <button
              onClick={() => {
                alert('Reloading page to refresh all data...');
                window.location.reload();
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              Reload Page
            </button>
          </div>
          
          {/* Complete Flow Test */}
          <div className="mt-4 p-3 bg-purple-900/30 border border-purple-700/50 rounded-lg">
            <p className="text-purple-300 text-sm mb-2">Complete Flow Test: Create Org + User + Announcement</p>
            <button
              onClick={async () => {
                try {
                  // 1. Create organization
                  const testOrg = await orgService.createOrganization('Test Org ' + Date.now(), currentUser.email);
                  console.log('Created org:', testOrg);
                  
                  // 2. Assign current user to the org
                  await authService.assignUserToOrg(currentUser.email, testOrg.id);
                  console.log('Assigned user to org');
                  
                  // 3. Create an announcement
                  const announcement = await orgService.addAnnouncement(testOrg.id, {
                    title: 'Welcome to ' + testOrg.name,
                    content: 'This is your first announcement!',
                    author: currentUser.email
                  });
                  console.log('Created announcement:', announcement);
                  
                  alert('Complete flow test successful! Please refresh the page to see changes.');
                } catch (error) {
                  console.error('Flow test failed:', error);
                  alert('Flow test failed: ' + error);
                }
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              Run Complete Flow Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugInfo;
