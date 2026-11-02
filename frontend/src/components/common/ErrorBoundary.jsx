import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[CALZARE Error Boundary Caught]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          reset: this.handleReset,
        });
      }

      return (
        <div
          style={{
            padding: '24px',
            background: '#fff5f5',
            border: '1px solid #fed7d7',
            borderRadius: '8px',
            margin: '20px auto',
            maxWidth: '600px',
            textAlign: 'center',
            fontFamily: 'inherit',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <AlertTriangle size={36} color="#e53e3e" />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#9b2c2c', margin: '0 0 8px' }}>
            Something went wrong rendering this section
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#742a2a', margin: '0 0 16px', lineHeight: 1.5 }}>
            {this.state.error?.message || 'An unexpected rendering error occurred.'}
          </p>
          <button
            onClick={this.handleReset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: '#e53e3e',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={14} /> Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

