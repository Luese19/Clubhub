# Firestore Indexes Required

This file documents the composite indexes that need to be created in Firestore for the announcement system to work properly.

## 🚨 CRITICAL: Missing Indexes Causing Announcement Feature to Fail

The announcement feature is currently not working because the required Firestore composite indexes are missing.

## Required Composite Indexes

### 1. Announcements Collection - Primary Query Index
**REQUIRED FOR: Fetching active announcements with proper ordering**
- Collection: `announcements`
- Fields: 
  - `organizationId` (Ascending)
  - `isDeleted` (Ascending) 
  - `createdAt` (Descending)

### 2. Announcements Collection - Simple Query Index
**REQUIRED FOR: Fallback query when compound query fails**
- Collection: `announcements`
- Fields:
  - `organizationId` (Ascending)
  - `createdAt` (Descending)

### 3. Announcements Collection - Deleted Announcements Index
**REQUIRED FOR: Admin history view of deleted announcements**
- Collection: `announcements`
- Fields:
  - `organizationId` (Ascending)
  - `isDeleted` (Ascending)
  - `deletedAt` (Descending)

### 4. Events Collection - Basic Events Index
**REQUIRED FOR: Fetching events with proper date ordering**
- Collection: `events`
- Fields:
  - `organizationId` (Ascending)
  - `date` (Ascending)

## Quick Fix: Create Indexes Using Firebase Console Links

Firestore has automatically generated the URLs to create these indexes. Click these links to create them:

1. **Primary Index (organizationId + isDeleted + createdAt)**: 
   Go to Firebase Console > Firestore > Indexes and click "Create Index" or use the auto-generated URL from the error message.

2. **Simple Index (organizationId + createdAt)**:
   Similarly, create this index through the Firebase Console.

## Step-by-Step Fix Instructions

1. Open [Firebase Console](https://console.firebase.google.com)
2. Select your project: `clubhub-19b84`
3. Go to **Firestore Database** → **Indexes**
4. Click **"Create Index"**
5. Create the following indexes:

### Index 1: Active Announcements
- Collection ID: `announcements`
- Fields to index:
  - Field: `organizationId`, Order: `Ascending`
  - Field: `isDeleted`, Order: `Ascending`
  - Field: `createdAt`, Order: `Descending`
- Query scope: `Collection`

### Index 2: Simple Announcements Query
- Collection ID: `announcements`
- Fields to index:
  - Field: `organizationId`, Order: `Ascending`
  - Field: `createdAt`, Order: `Descending`
- Query scope: `Collection`

### Index 3: Deleted Announcements History
- Collection ID: `announcements`
- Fields to index:
  - Field: `organizationId`, Order: `Ascending`
  - Field: `isDeleted`, Order: `Ascending`
  - Field: `deletedAt`, Order: `Descending`
- Query scope: `Collection`

### Index 4: Events Query
- Collection ID: `events`
- Fields to index:
  - Field: `organizationId`, Order: `Ascending`
  - Field: `date`, Order: `Ascending`
- Query scope: `Collection`

## 🚀 Quick Fix: Use Auto-Generated Index URLs

Based on the error messages from your Firebase project, you can use these direct links to create the indexes:

### Option 1: Create All Indexes via Firebase Console
1. Go to [Firebase Console - Firestore Indexes](https://console.firebase.google.com/v1/r/project/clubhub-19b84/firestore/indexes)
2. You should see suggested indexes at the top of the page
3. Click "Create Index" on each suggested index

### Option 2: Manual Index Creation
If auto-suggestions aren't available, manually create the indexes using the specifications above.

## ✅ Current Status (Fixed with Enhanced Fallbacks)

The announcement AND events features are now working with enhanced fallback systems:

**Announcements:**
- **Tier 1**: Compound query (requires Index 1) - Falls back if missing
- **Tier 2**: Simple query (requires Index 2) - Falls back if missing  
- **Tier 3**: Basic query + memory sorting - **Always works** ✅
- **Safety**: Returns empty array if all queries fail (prevents crashes)

**Events:**
- **Tier 1**: Ordered query (requires Index 4) - Falls back if missing
- **Tier 2**: Basic query + memory sorting - **Always works** ✅

**Deleted Announcements:**
- **Tier 1**: Compound query (requires Index 3) - Falls back if missing
- **Tier 2**: Basic query + memory filtering/sorting - **Always works** ✅

Creating the indexes will improve performance and enable the optimized queries, but the app is fully functional without them.

## 🔧 Verification Script

After creating the indexes, you can test them using the debug scripts provided in the project root.
