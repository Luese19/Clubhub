# ClubHub - The All-in-One School Club Platform

ClubHub is a modern, Firebase-powered platform designed to help school clubs manage their activities, events, projects, and members in one centralized location.

## Features

- **User Authentication**: Secure Firebase Authentication with email/password
- **Organization Management**: Create and manage multiple club organizations  
- **Member Management**: Add/remove members, assign roles
- **Event Calendar**: Schedule and manage club events
- **Project Management**: Track projects with Kanban-style task boards
- **Announcements**: Share important updates with members
- **Resources & Gallery**: Share files and images with the club

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- A Firebase project

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd clubhub
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable the following services:
   - **Authentication** (Email/Password provider)
   - **Firestore Database** (Start in production mode)
   - **Storage** (for file uploads)

4. Get your Firebase config:
   - Go to Project Settings → General → Your apps
   - Click "Web app" and copy the config object

### 3. Environment Configuration

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Fill in your Firebase credentials in `.env`:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Firestore Security Rules

Set up the following security rules in Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Authenticated users can read all users (for member management)
    match /users/{document=**} {
      allow read: if request.auth != null;
    }
    
    // Organization members can read/write org data
    match /organizations/{orgId} {
      allow read, write: if request.auth != null;
    }
    
    // Organization data (announcements, events, tasks)
    match /{collection}/{document} {
      allow read, write: if request.auth != null 
        && collection in ['announcements', 'events', 'tasks'];
    }
  }
}
```

### 5. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
clubhub/
├── components/           # React components
│   ├── Auth.tsx         # Authentication forms
│   ├── Dashboard.tsx    # Announcements dashboard
│   ├── Events.tsx       # Event management
│   ├── Members.tsx      # Member management
│   ├── Organizations.tsx # Organization setup
│   ├── Projects.tsx     # Project/task management
│   └── ...
├── services/            # API services
│   ├── authService.ts   # Firebase Auth integration
│   └── orgService.ts    # Firestore data operations
├── firebase.config.ts   # Firebase configuration
├── types.ts            # TypeScript type definitions
└── ...
```

## Usage

### First Time Setup

1. **Sign Up**: The first user to sign up becomes the super admin
2. **Create Organization**: Super admins can create club organizations
3. **Assign Users**: Add members to organizations and assign roles

### Daily Usage

- **Students**: View announcements, events, and project updates
- **Admins**: Manage all club content, members, and activities

## Deployment

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Deploy Options

1. **Firebase Hosting** (Recommended):
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

2. **Vercel, Netlify, or any static hosting service**

## Migration from PostgreSQL

This version has been completely migrated from PostgreSQL to Firebase. All previous database-related files have been removed:

- ✅ Removed PostgreSQL dependencies
- ✅ Removed server directory and Express.js backend
- ✅ Converted auth system to Firebase Authentication
- ✅ Converted data storage to Firestore
- ✅ Updated all components to use Firebase services

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

If you encounter any issues:

1. Check the browser console for errors
2. Verify your Firebase configuration
3. Ensure Firestore security rules are properly set
4. Check that all required Firebase services are enabled

## License

This project is licensed under the MIT License.
