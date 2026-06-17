import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
          <div className="rounded-full bg-danger/10 p-4">
            <AlertTriangle className="h-7 w-7 text-danger" />
          </div>
          <div>
            <p className="text-base font-semibold">Something went wrong</p>
            <p className="mt-1 text-sm text-muted">An unexpected error occurred while rendering this page.</p>
          </div>
          <Button onClick={() => window.location.reload()}>Reload page</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
