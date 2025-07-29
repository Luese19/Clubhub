import React from 'react';

const FirebaseSetupGuide: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-8 max-w-2xl w-full border border-blue-500">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-400 mb-2">
            🔥 Welcome to ClubHub!
          </h1>
          <p className="text-gray-300">
            Firebase configuration required to get started
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              📋 Quick Setup Steps:
            </h2>
            <ol className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
                <div>
                  <strong>Create Firebase Project:</strong>
                  <br />
                  <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                    Go to Firebase Console →
                  </a>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
                <div>
                  <strong>Enable Services:</strong>
                  <br />
                  • Authentication (Email/Password)
                  <br />
                  • Firestore Database
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
                <div>
                  <strong>Get Config:</strong>
                  <br />
                  Project Settings → General → Web App → Config
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">4</span>
                <div>
                  <strong>Update .env file:</strong>
                  <br />
                  Replace placeholder values with your Firebase keys
                </div>
              </li>
            </ol>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">📁 Environment Variables Needed:</h3>
            <div className="bg-gray-800 rounded p-3 text-sm font-mono text-green-400">
              VITE_FIREBASE_API_KEY=your_actual_api_key<br />
              VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com<br />
              VITE_FIREBASE_PROJECT_ID=your_project_id<br />
              VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com<br />
              VITE_FIREBASE_MESSAGING_SENDER_ID=123456789<br />
              VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-sm">
              After updating .env, restart the development server
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              🔄 Reload Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseSetupGuide;
