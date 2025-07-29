import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full border border-red-500">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-400 mb-4">
                🚨 Configuration Error
              </h1>
              <p className="text-gray-300 mb-4">
                ClubHub needs Firebase configuration to work properly.
              </p>
              <div className="bg-gray-700 rounded p-4 mb-4 text-left">
                <h3 className="font-semibold text-white mb-2">Quick Setup:</h3>
                <ol className="text-sm text-gray-300 space-y-1">
                  <li>1. Create a Firebase project</li>
                  <li>2. Enable Authentication & Firestore</li>
                  <li>3. Update your .env file with Firebase keys</li>
                  <li>4. Restart the development server</li>
                </ol>
              </div>
              <p className="text-xs text-gray-400">
                Check the README.md for detailed setup instructions.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
