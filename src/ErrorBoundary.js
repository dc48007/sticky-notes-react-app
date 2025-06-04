// src/ErrorBoundary.js
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an external reporting service here
    console.error("Uncaught error in component tree:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-4 text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Oops! Something went wrong.</h1>
          <p className="text-slate-700 mb-6">
            We're sorry for the inconvenience. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Refresh Page
          </button>
          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <details className="mt-6 text-left text-sm text-slate-600 bg-red-100 p-3 rounded-md w-full max-w-2xl mx-auto">
              <summary className="font-semibold cursor-pointer">Error Details (Dev Mode)</summary>
              <pre className="mt-2 whitespace-pre-wrap text-xs">
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;