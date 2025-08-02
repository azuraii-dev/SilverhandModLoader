import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cyber-darker flex items-center justify-center p-6">
          <div className="max-w-md w-full">
            <div className="cyber-border p-8 rounded-lg text-center">
              <AlertTriangle className="text-cyber-pink mx-auto mb-4" size={48} />
              
              <h2 className="text-2xl font-bold text-cyber-pink mb-4">
                Something went wrong
              </h2>
              
              <p className="text-gray-300 mb-6">
                An error occurred in the mod library. This is usually caused by 
                drag-and-drop issues during development.
              </p>
              
              <button
                onClick={this.handleReset}
                className="cyber-button-primary flex items-center space-x-2 mx-auto"
              >
                <RefreshCw size={18} />
                <span>Try Again</span>
              </button>
              
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-6 text-left">
                  <summary className="text-cyber-blue cursor-pointer text-sm">
                    Show Error Details (Development)
                  </summary>
                  <pre className="text-xs text-gray-400 mt-2 p-2 bg-cyber-dark bg-opacity-50 rounded overflow-auto">
                    {this.state.error?.toString()}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;