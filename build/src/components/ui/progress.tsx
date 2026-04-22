import * as React from 'react';

import {
    Progress as ProgressPrimitive,
    ProgressIndicator as ProgressIndicatorPrimitive,
    type ProgressProps as ProgressPrimitiveProps,
} from '@/components/animate-ui/primitives/radix/progress';
import { cn } from '@/lib/utils';

type ProgressProps = ProgressPrimitiveProps;

function Progress({ className, ...props }: ProgressProps) {
    return (
        <ProgressPrimitive
            className={cn(
                'bg-primary/20 relative h-2 w-full overflow-hidden rounded-full',
                className,
            )}
            {...props}
        >
            <ProgressIndicatorPrimitive className="bg-primary rounded-full h-full w-full flex-1" />
        </ProgressPrimitive>
    );
}

const PageLoader = () => {
    const [progress, setProgress] = React.useState(0);

    React.useEffect(() => {
        const timer1 = setTimeout(() => setProgress(35), 100);
        const timer2 = setTimeout(() => setProgress(75), 500);
        const timer3 = setTimeout(() => setProgress(95), 1000);
        const timer4 = setTimeout(() => setProgress(100), 1500);
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
            clearTimeout(timer4);
        };
    }, []);

    return (
        <div className="flex min-h-[90vh] w-full items-center justify-center bg-background">
            <div className="flex w-[60%] max-w-xs flex-col items-center gap-6">
                <Progress value={progress} className="w-full" />
                <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading…</p>
            </div>
        </div>
    );
};

export { Progress, PageLoader, type ProgressProps };
