import React from 'react';

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

/**
 * Class-based error boundary — catches unhandled render errors in the subtree.
 * Place this high in the tree (e.g. main.tsx) so the entire app is protected.
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo): void {
        // TODO: send to your error reporting service (Sentry, Datadog, etc.)
        console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
    }

    private handleReset = (): void => {
        this.setState({ hasError: false, error: null });
    };

    render(): React.ReactNode {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-background p-8 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-3xl">
                        ⚠️
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
                        <p className="text-sm text-muted-foreground max-w-md">
                            {this.state.error?.message ?? 'An unexpected error occurred. Please try again.'}
                        </p>
                    </div>
                    <button
                        onClick={this.handleReset}
                        className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
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
