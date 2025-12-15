import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1 style={{ color: 'red', marginBottom: '1rem' }}>Something went wrong.</h1>
          <details style={{ whiteSpace: 'pre-wrap', textAlign: 'left', backgroundColor: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
            <summary>Error Details</summary>
            {this.state.error?.toString()}
            {this.state.error?.stack}
          </details>
          <button 
            onClick={() => this.setState({ hasError: false })}
            style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

