import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';
import { trackAnalyticsEvent, type AnalyticsDevice } from '@/services/analyticsService';

const getDevice = (): AnalyticsDevice => {
    if (typeof window === 'undefined') return 'unknown';
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
};

const AnalyticsTracker = () => {
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) return;

        void trackAnalyticsEvent({
            type: 'page_view',
            path: `${location.pathname}${location.search}`,
            device: getDevice(),
        }).catch(() => {
            // Analytics should never interrupt navigation.
        });
    }, [isAuthenticated, location.pathname, location.search]);

    return null;
};

export default AnalyticsTracker;
