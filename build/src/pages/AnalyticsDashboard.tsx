import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowUpRight,
    BarChart3,
    Eye,
    FolderKanban,
    Globe2,
    LayoutTemplate,
    MousePointerClick,
    Rocket,
    Sparkles,
    TabletSmartphone,
    TrendingUp,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ROUTES } from '@/constants/routes';
import { getAnalyticsSummary, type AnalyticsSummary } from '@/services/analyticsService';

const AnalyticsDashboard: React.FC = () => {
    const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const loadAnalytics = async () => {
            try {
                setIsLoading(true);
                const analytics = await getAnalyticsSummary(30);
                if (!cancelled) {
                    setSummary(analytics);
                    setLoadError(null);
                }
            } catch {
                if (!cancelled) {
                    setSummary(null);
                    setLoadError('Analytics could not be loaded. Make sure your account has admin access.');
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        loadAnalytics();

        return () => {
            cancelled = true;
        };
    }, []);

    const maxDeviceCount = useMemo(
        () => Math.max(...(summary?.devices.map((device) => device.count) || [1]), 1),
        [summary],
    );

    const conversionRate = useMemo(() => {
        const pageViews = summary?.events.pageViews || 0;
        if (!pageViews) return 0;
        return Math.round(((summary?.events.conversions || 0) / pageViews) * 100);
    }, [summary]);

    return (
        <div className="min-h-full bg-background">
            <section className="border-b bg-muted/25">
                <div className="flex flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
                    <div className="max-w-3xl">
                        <Badge variant="secondary" className="mb-3 rounded-md">
                            <BarChart3 className="size-3.5" />
                            Last 30 days
                        </Badge>
                        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Analytics dashboard</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                            Track page views, template usage, project publishes, device mix, conversions, and community engagement.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild>
                            <Link to={ROUTES.ADMIN}>
                                Admin panel
                                <ArrowUpRight className="size-4" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link to={ROUTES.PROJECTS}>Open projects</Link>
                        </Button>
                    </div>
                </div>
            </section>

            <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                {loadError && (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
                        {loadError}
                    </div>
                )}

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <AnalyticsMetric
                        title="Page views"
                        value={isLoading ? '...' : String(summary?.events.pageViews || 0)}
                        description="Tracked site and app page views"
                        icon={Eye}
                    />
                    <AnalyticsMetric
                        title="Template uses"
                        value={isLoading ? '...' : String(summary?.events.templateUses || summary?.templateEngagement.remixes || 0)}
                        description="Tracked uses plus remix totals"
                        icon={LayoutTemplate}
                    />
                    <AnalyticsMetric
                        title="Project publishes"
                        value={isLoading ? '...' : String(summary?.events.projectPublishes || summary?.overview.publishedProjects || 0)}
                        description="Publish events and live projects"
                        icon={Rocket}
                    />
                    <AnalyticsMetric
                        title="Conversion rate"
                        value={isLoading ? '...' : `${conversionRate}%`}
                        description="Conversions divided by page views"
                        icon={TrendingUp}
                    />
                </section>

                <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)]">
                    <Card className="rounded-lg">
                        <CardHeader className="border-b">
                            <div>
                                <CardTitle>Traffic by device</CardTitle>
                                <CardDescription>Visitor device mix from tracked analytics events.</CardDescription>
                            </div>
                            <CardAction>
                                <TabletSmartphone className="size-5 text-muted-foreground" />
                            </CardAction>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            {isLoading ? (
                                <AnalyticsSkeleton />
                            ) : summary?.devices.length ? (
                                summary.devices.map((item) => (
                                    <div key={item.device} className="space-y-2">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-sm font-medium capitalize">{item.device}</p>
                                            <span className="text-sm text-muted-foreground">{item.count}</span>
                                        </div>
                                        <Progress value={Math.round((item.count / maxDeviceCount) * 100)} />
                                    </div>
                                ))
                            ) : (
                                <EmptyAnalytics title="No device data yet" description="Tracked page view events will populate this chart." />
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>Content inventory</CardTitle>
                            <CardDescription>Current platform content available to users.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-3">
                            <InventoryTile label="Users" value={summary?.overview.users || 0} icon={Sparkles} />
                            <InventoryTile label="Projects" value={summary?.overview.projects || 0} icon={FolderKanban} />
                            <InventoryTile label="Pages" value={summary?.overview.pages || 0} icon={Globe2} />
                            <InventoryTile label="Templates" value={summary?.overview.templates || 0} icon={LayoutTemplate} />
                        </CardContent>
                    </Card>
                </section>

                <section className="grid gap-6 xl:grid-cols-2">
                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>Top paths</CardTitle>
                            <CardDescription>Most viewed tracked pages.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <AnalyticsSkeleton />
                            ) : summary?.topPaths.length ? (
                                <div className="space-y-3">
                                    {summary.topPaths.map((path) => (
                                        <div key={path.path} className="flex items-center gap-3 rounded-lg border p-3">
                                            <MousePointerClick className="size-4 shrink-0 text-muted-foreground" />
                                            <span className="min-w-0 flex-1 truncate text-sm font-medium">{path.path}</span>
                                            <Badge variant="outline" className="rounded-md">{path.views} views</Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyAnalytics title="No page paths yet" description="Use the event API to record page views." />
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>Template engagement</CardTitle>
                            <CardDescription>Remixes, likes, comments, and reviews from community templates.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <AnalyticsSkeleton />
                            ) : summary?.topTemplates.length ? (
                                <div className="space-y-3">
                                    {summary.topTemplates.map((template) => (
                                        <Link
                                            key={template.id}
                                            to={`/templates/${template.id}`}
                                            className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/40"
                                        >
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-sm font-medium">{template.name}</span>
                                                <span className="block text-xs text-muted-foreground">
                                                    {template.remixes} remixes, {template.likes} likes, {template.comments} comments, {template.reviews} reviews
                                                </span>
                                            </span>
                                            <Badge variant="secondary" className="rounded-md">{template.category}</Badge>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <EmptyAnalytics title="No template engagement yet" description="Template activity will appear after users remix and interact." />
                            )}
                        </CardContent>
                    </Card>
                </section>
            </div>
        </div>
    );
};

const AnalyticsMetric = ({
    title,
    value,
    description,
    icon: Icon,
}: {
    title: string;
    value: string;
    description: string;
    icon: React.ElementType;
}) => (
    <Card className="rounded-lg">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" />
            </div>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-semibold tracking-tight">{value}</div>
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);

const InventoryTile = ({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) => (
    <div className="rounded-lg border bg-muted/25 p-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon className="size-3.5" />
            {label}
        </div>
        <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
);

const EmptyAnalytics = ({ title, description }: { title: string; description: string }) => (
    <div className="flex min-h-40 flex-col items-center justify-center text-center">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
);

const AnalyticsSkeleton = () => (
    <div className="space-y-3">
        {[0, 1, 2].map((item) => (
            <div key={item} className="rounded-lg border p-4">
                <div className="h-4 w-2/5 rounded-md bg-muted" />
                <div className="mt-3 h-3 w-3/5 rounded-md bg-muted" />
            </div>
        ))}
    </div>
);

export default AnalyticsDashboard;
