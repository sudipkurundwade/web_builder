import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowUpRight,
    BadgeCheck,
    CheckCircle2,
    Database,
    FolderKanban,
    Gauge,
    Globe2,
    Layers3,
    Loader2,
    LockKeyhole,
    MessageSquareWarning,
    ShieldCheck,
    Sparkles,
    XCircle,
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
import { useAuth } from '@/context/AuthContext';
import { getCollections } from '@/services/collectionService';
import { getUserProjects } from '@/services/projectService';
import { getAdminTemplates, getCommunityTemplates, updateTemplateApproval } from '@/services/templateService';
import type { TemplateCollection } from '@/types/collection';
import type { Project } from '@/types/project';
import type { CommunityTemplate } from '@/types/template';

type AdminLoadState = {
    projects: Project[];
    templates: CommunityTemplate[];
    pendingTemplates: CommunityTemplate[];
    collections: TemplateCollection[];
};

const securityEvents = [
    {
        title: 'Admin console accessed',
        description: 'Protected dashboard opened from authenticated workspace shell.',
        severity: 'Normal',
        icon: ShieldCheck,
    },
    {
        title: 'Template moderation queue synced',
        description: 'Pending templates are held for admin approval before they appear publicly.',
        severity: 'Watch',
        icon: MessageSquareWarning,
    },
    {
        title: 'Role enforcement active',
        description: 'Admin pages and moderation APIs require an authenticated user with the admin role.',
        severity: 'Normal',
        icon: LockKeyhole,
    },
];

const adminActions = [
    {
        title: 'Review community templates',
        description: 'Audit published layouts, ratings, and remix activity.',
        href: ROUTES.COMMUNITY_TEMPLATES,
        icon: Layers3,
    },
    {
        title: 'Inspect project inventory',
        description: 'Open the project workspace and verify publish state.',
        href: ROUTES.PROJECTS,
        icon: FolderKanban,
    },
    {
        title: 'Manage collections',
        description: 'Check curated groups and reusable template sets.',
        href: ROUTES.COLLECTIONS,
        icon: Database,
    },
];

const AdminPanel: React.FC = () => {
    const { user } = useAuth();
    const [data, setData] = useState<AdminLoadState>({
        projects: [],
        templates: [],
        pendingTemplates: [],
        collections: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [reviewingTemplateId, setReviewingTemplateId] = useState<string | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const loadAdminData = async () => {
            setIsLoading(true);
            const [projectsResult, templatesResult, pendingTemplatesResult, collectionsResult] = await Promise.allSettled([
                getUserProjects(),
                getCommunityTemplates({ sort: 'popular' }),
                getAdminTemplates('pending'),
                getCollections(),
            ]);

            if (cancelled) return;

            const hasError = [projectsResult, templatesResult, pendingTemplatesResult, collectionsResult].some(
                (result) => result.status === 'rejected',
            );

            setData({
                projects: projectsResult.status === 'fulfilled' ? projectsResult.value : [],
                templates: templatesResult.status === 'fulfilled' ? templatesResult.value : [],
                pendingTemplates: pendingTemplatesResult.status === 'fulfilled' ? pendingTemplatesResult.value : [],
                collections: collectionsResult.status === 'fulfilled' ? collectionsResult.value : [],
            });
            setLoadError(hasError ? 'Some admin data could not be loaded. Showing available workspace data.' : null);
            setIsLoading(false);
        };

        loadAdminData();

        return () => {
            cancelled = true;
        };
    }, []);

    const metrics = useMemo(() => {
        const publishedProjects = data.projects.filter((project) => project.isPublished).length;
        const draftProjects = Math.max(data.projects.length - publishedProjects, 0);
        const totalPages = data.projects.reduce((total, project) => total + (project.pages?.length || 1), 0);
        const templateEngagement = data.templates.reduce(
            (total, template) => total + template.remixCount + (template.likesCount || 0) + (template.commentsCount || 0),
            0,
        );
        const systemReadiness = Math.min(
            100,
            40 + publishedProjects * 8 + data.templates.length * 5 + data.collections.length * 4,
        );
        const contentCoverage = Math.min(100, 25 + totalPages * 4 + data.templates.length * 6);

        return {
            publishedProjects,
            draftProjects,
            totalPages,
            templateEngagement,
            systemReadiness,
            contentCoverage,
        };
    }, [data]);

    const topTemplates = useMemo(
        () =>
            [...data.templates]
                .sort((a, b) => {
                    const aScore = a.remixCount + (a.likesCount || 0) + (a.ratingAverage || 0);
                    const bScore = b.remixCount + (b.likesCount || 0) + (b.ratingAverage || 0);
                    return bScore - aScore;
                })
                .slice(0, 4),
        [data.templates],
    );

    const isAdmin = user?.role === 'admin';

    const handleTemplateApproval = async (
        templateId: string,
        status: 'approved' | 'rejected',
    ) => {
        setReviewingTemplateId(templateId);
        setLoadError(null);

        try {
            const updatedTemplate = await updateTemplateApproval(templateId, {
                status,
                rejectionReason: status === 'rejected' ? 'Rejected from admin moderation queue.' : undefined,
            });

            setData((current) => ({
                ...current,
                pendingTemplates: current.pendingTemplates.filter((template) => template._id !== templateId),
                templates: status === 'approved' ? [updatedTemplate, ...current.templates] : current.templates,
            }));
        } catch (err: any) {
            setLoadError(err?.response?.data?.message || 'Could not update template approval.');
        } finally {
            setReviewingTemplateId(null);
        }
    };

    return (
        <div className="min-h-full bg-background">
            <section className="border-b bg-muted/25">
                <div className="flex flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
                    <div className="max-w-3xl">
                        <Badge variant={isAdmin ? 'default' : 'secondary'} className="mb-3 rounded-md">
                            <ShieldCheck className="size-3.5" />
                            {isAdmin ? 'Admin access' : 'Admin preview'}
                        </Badge>
                        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Admin panel</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                            Monitor workspace content, community templates, launch readiness, and operational review queues.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild>
                            <Link to={ROUTES.COMMUNITY_TEMPLATES}>
                                <BadgeCheck className="size-4" />
                                Review templates
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link to={ROUTES.DASHBOARD}>
                                User dashboard
                                <ArrowUpRight className="size-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                {!isAdmin && (
                    <div className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-900 dark:text-sky-100">
                        This panel is wired as a protected admin UI. Add backend role persistence and API authorization before exposing destructive actions.
                    </div>
                )}

                {loadError && (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
                        {loadError}
                    </div>
                )}

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <AdminMetricCard
                        title="Workspace projects"
                        value={isLoading ? '...' : data.projects.length.toString()}
                        description={`${metrics.publishedProjects} published, ${metrics.draftProjects} drafts`}
                        icon={FolderKanban}
                    />
                    <AdminMetricCard
                        title="Community templates"
                        value={isLoading ? '...' : data.templates.length.toString()}
                        description={`${metrics.templateEngagement} total engagement signals`}
                        icon={Layers3}
                    />
                    <AdminMetricCard
                        title="Collections"
                        value={isLoading ? '...' : data.collections.length.toString()}
                        description="Curated groups in the workspace"
                        icon={Database}
                    />
                    <AdminMetricCard
                        title="Pages managed"
                        value={isLoading ? '...' : metrics.totalPages.toString()}
                        description="Estimated from saved project pages"
                        icon={Globe2}
                    />
                </section>

                <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.85fr)]">
                    <Card className="rounded-lg">
                        <CardHeader className="border-b">
                            <div>
                                <CardTitle>Moderation queue</CardTitle>
                                <CardDescription>Templates with comments, reviews, or high public activity.</CardDescription>
                            </div>
                            <CardAction>
                                <Badge variant="outline" className="rounded-md">
                                    {isLoading ? 'Syncing' : `${data.pendingTemplates.length} pending`}
                                </Badge>
                            </CardAction>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="divide-y">
                                {isLoading ? (
                                    <AdminSkeleton />
                                ) : data.pendingTemplates.length ? (
                                    data.pendingTemplates.slice(0, 5).map((template) => (
                                        <div
                                            key={template._id}
                                            className="grid gap-3 py-4 transition-colors hover:bg-muted/35 sm:grid-cols-[1fr_auto] sm:items-center"
                                        >
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="truncate text-sm font-medium">{template.name}</h3>
                                                    <Badge variant="secondary" className="rounded-md">{template.category}</Badge>
                                                </div>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    Submitted by {template.owner?.name || template.owner?.email || 'Unknown creator'} for {template.category}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={() => void handleTemplateApproval(template._id, 'approved')}
                                                    disabled={reviewingTemplateId === template._id}
                                                >
                                                    {reviewingTemplateId === template._id ? (
                                                        <Loader2 className="size-4 animate-spin" />
                                                    ) : (
                                                        <CheckCircle2 className="size-4" />
                                                    )}
                                                    Approve
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => void handleTemplateApproval(template._id, 'rejected')}
                                                    disabled={reviewingTemplateId === template._id}
                                                >
                                                    <XCircle className="size-4" />
                                                    Reject
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <EmptyAdminState
                                        icon={CheckCircle2}
                                        title="No pending templates"
                                        description="New community submissions will wait here until an admin approves them."
                                    />
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>System health</CardTitle>
                            <CardDescription>Operational signals based on loaded workspace content.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <AdminProgress
                                label="System readiness"
                                value={isLoading ? 0 : metrics.systemReadiness}
                                caption="Content, templates, and collections available to users."
                            />
                            <AdminProgress
                                label="Content coverage"
                                value={isLoading ? 0 : metrics.contentCoverage}
                                caption="Estimated breadth across projects, pages, and templates."
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <HealthTile label="API mode" value="Live data" icon={Gauge} />
                                <HealthTile label="Access" value={isAdmin ? 'Admin' : 'Preview'} icon={LockKeyhole} />
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section className="grid gap-6 xl:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.2fr)]">
                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>Admin actions</CardTitle>
                            <CardDescription>Shortcuts to the areas admins inspect most often.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {adminActions.map((action) => {
                                const Icon = action.icon;
                                return (
                                    <Link
                                        key={action.title}
                                        to={action.href}
                                        className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/40"
                                    >
                                        <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <Icon className="size-5" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-sm font-medium">{action.title}</span>
                                            <span className="block text-xs leading-5 text-muted-foreground">{action.description}</span>
                                        </span>
                                        <ArrowUpRight className="size-4 text-muted-foreground" />
                                    </Link>
                                );
                            })}
                        </CardContent>
                    </Card>

                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>Top templates</CardTitle>
                            <CardDescription>Highest activity templates by remixes, likes, and rating.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <AdminSkeleton />
                            ) : topTemplates.length ? (
                                <div className="space-y-3">
                                    {topTemplates.map((template, index) => (
                                        <Link
                                            key={template._id}
                                            to={`/templates/${template._id}`}
                                            className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/40"
                                        >
                                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold">
                                                {index + 1}
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-sm font-medium">{template.name}</span>
                                                <span className="block text-xs text-muted-foreground">
                                                    {template.remixCount} remixes, {template.likesCount || 0} likes, {template.ratingAverage?.toFixed(1) || '0.0'} rating
                                                </span>
                                            </span>
                                            <Badge variant="outline" className="rounded-md">{template.category}</Badge>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <EmptyAdminState
                                    icon={Sparkles}
                                    title="No templates yet"
                                    description="Shared community templates will be ranked here."
                                />
                            )}
                        </CardContent>
                    </Card>
                </section>

                <Card className="rounded-lg">
                    <CardHeader>
                        <CardTitle>Security and operations</CardTitle>
                        <CardDescription>Key checks for turning this UI into a production-grade admin console.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 lg:grid-cols-3">
                        {securityEvents.map((event) => {
                            const Icon = event.icon;
                            return (
                                <div key={event.title} className="rounded-lg border bg-muted/20 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-lg bg-background text-primary">
                                            <Icon className="size-5" />
                                        </div>
                                        <Badge
                                            variant={event.severity === 'Action' ? 'destructive' : event.severity === 'Watch' ? 'outline' : 'secondary'}
                                            className="rounded-md"
                                        >
                                            {event.severity}
                                        </Badge>
                                    </div>
                                    <h3 className="mt-4 text-sm font-medium">{event.title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{event.description}</p>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

type IconType = React.ElementType;

const AdminMetricCard = ({
    title,
    value,
    description,
    icon: Icon,
}: {
    title: string;
    value: string;
    description: string;
    icon: IconType;
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

const AdminProgress = ({ label, value, caption }: { label: string; value: number; caption: string }) => (
    <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">{label}</p>
            <span className="text-sm text-muted-foreground">{value}%</span>
        </div>
        <Progress value={value} />
        <p className="text-xs leading-5 text-muted-foreground">{caption}</p>
    </div>
);

const HealthTile = ({ label, value, icon: Icon }: { label: string; value: string; icon: IconType }) => (
    <div className="rounded-lg border bg-muted/25 p-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon className="size-3.5" />
            {label}
        </div>
        <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
);

const EmptyAdminState = ({
    icon: Icon,
    title,
    description,
}: {
    icon: IconType;
    title: string;
    description: string;
}) => (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
        <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-6" />
        </div>
        <div>
            <h3 className="text-sm font-medium">{title}</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
        </div>
    </div>
);

const AdminSkeleton = () => (
    <div className="space-y-3 py-4">
        {[0, 1, 2].map((item) => (
            <div key={item} className="rounded-lg border p-4">
                <div className="h-4 w-2/5 rounded-md bg-muted" />
                <div className="mt-3 h-3 w-3/5 rounded-md bg-muted" />
            </div>
        ))}
    </div>
);

export default AdminPanel;
