import api from '@/lib/api';

export type AnalyticsEventType = 'page_view' | 'template_use' | 'project_publish' | 'conversion';
export type AnalyticsDevice = 'desktop' | 'tablet' | 'mobile' | 'unknown';

export interface AnalyticsSummary {
    range: {
        days: number;
        start: string;
        end: string;
    };
    overview: {
        users: number;
        projects: number;
        publishedProjects: number;
        draftProjects: number;
        pages: number;
        templates: number;
        collections: number;
    };
    events: {
        pageViews: number;
        templateUses: number;
        projectPublishes: number;
        conversions: number;
    };
    templateEngagement: {
        remixes: number;
        likes: number;
        comments: number;
        reviews: number;
    };
    devices: {
        device: AnalyticsDevice;
        count: number;
    }[];
    topPaths: {
        path: string;
        views: number;
    }[];
    topTemplates: {
        id: string;
        name: string;
        category: string;
        remixes: number;
        likes: number;
        comments: number;
        reviews: number;
    }[];
    recentEvents: {
        _id: string;
        type: AnalyticsEventType;
        path?: string;
        device: AnalyticsDevice;
        createdAt: string;
    }[];
}

export async function getAnalyticsSummary(days = 30): Promise<AnalyticsSummary> {
    const response = await api.get<{ data: AnalyticsSummary }>('/analytics/summary', {
        params: { days },
    });
    return response.data.data;
}

export async function trackAnalyticsEvent(input: {
    type: AnalyticsEventType;
    project?: string;
    template?: string;
    path?: string;
    device?: AnalyticsDevice;
    metadata?: Record<string, unknown>;
}): Promise<void> {
    await api.post('/analytics/events', input);
}
