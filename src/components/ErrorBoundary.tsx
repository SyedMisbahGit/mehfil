import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // In a real app, you might send this to an error reporting service
    console.error("Mehfil encountered an error:", error, errorInfo);
    
    // Store error information in localStorage for the admin dashboard
    const errors = JSON.parse(localStorage.getItem('mehfil-errors') || '[]');
    errors.push({
      timestamp: Date.now(),
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
    localStorage.setItem('mehfil-errors', JSON.stringify(errors.slice(-20))); // Keep last 20 errors
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md m-4">
          <div className="flex items-center gap-2 text-amber-600 mb-2">
            <AlertTriangle size={20} />
            <h2 className="font-medium">Kuch gadbad ho gayi</h2>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Humein maaf karein, koi technical dikkat aa gayi hai
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-3 py-1 text-sm bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-md hover:from-amber-600 hover:to-rose-600"
          >
            Wapas koshish karein
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
