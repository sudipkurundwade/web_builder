import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Activity,
    ArrowUpRight,
    CheckCircle2,
    Clock3,
    FilePlus2,
    FolderKanban,
    Globe2,
    LayoutTemplate,
    Rocket,
    Sparkles,
    Users2,
    Wand2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { getUserProjects } from '@/services/projectService';
import type { Project } from '@/types/project';

const quickActions = [
    {
        title: 'Start from blank',
        description: 'Open the editor with a clean canvas.',
        href: '/editor/my-project',
        icon: FilePlus2,
        tone: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    },
    {
        title: 'Browse templates',
        description: 'Remix a community layout into a site.',
        href: ROUTES.COMMUNITY_TEMPLATES,
        icon: LayoutTemplate,
        tone: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
    },
    {
        title: 'Organize assets',
        description: 'Group reusable work into collections.',
        href: ROUTES.COLLECTIONS,
        icon: FolderKanban,
        tone: 'bg-violet-500/10 text-violet-700 dark:text-violet-300',
    },
];

const activityItems = [
    {
        title: 'Template remix assistant is ready',
        description: 'Use guided prompts to turn a template into a client-specific site.',
        time: 'Now',
        icon: Wand2,
    },
    {
        title: 'Publishing checklist refreshed',
        description: 'SEO, responsive layout, and preview checks are grouped before launch.',
        time: 'Today',
        icon: CheckCircle2,
    },
    {
        title: 'Team workspace enabled',
        description: 'Invite collaborators from settings when you are ready to review.',
        time: 'This week',
        icon: Users2,
    },
];

const formatDate = (value: Project['updatedAt']) => {
    if (!value) return 'No edits yet';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'No edits yet';

    return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
};

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const loadProjects = async () => {
            try {
                setIsLoading(true);
                const userProjects = await getUserProjects();
                if (!cancelled) {
                    setProjects(userProjects);
                    setLoadError(null);
                }
            } catch {
                if (!cancelled) {
                    setProjects([]);
                    setLoadError('Project activity could not be loaded right now.');
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        loadProjects();

        return () => {
            cancelled = true;
        };
    }, []);

    const dashboardData = useMemo(() => {
        const publishedProjects = projects.filter((project) => project.isPublished);
        const pagesCount = projects.reduce((total, project) => total + (project.pages?.length || 1), 0);
        const githubConnected = projects.filter((project) => Boolean(project.githubRepo)).length;
        const recentProjects = [...projects]
            .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
            .slice(0, 4);

        return {
            publishedProjects,
            pagesCount,
            githubConnected,
            recentProjects,
            launchReadiness: Math.min(100, 32 + publishedProjects.length * 18 + githubConnected * 10 + projects.length * 6),
            storageUsage: Math.min(100, 18 + projects.length * 8 + pagesCount * 2),
        };
    }, [projects]);

    const displayName = user?.name?.split(' ')[0] || 'Creator';

    return (
        <div className="min-h-full bg-background">
            <section className="border-b bg-muted/25">
                <div className="flex flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
                    <div className="max-w-3xl">
                        <Badge variant="secondary" className="mb-3 rounded-md">
                            <Sparkles className="size-3.5" />
                            Builder workspace
                        </Badge>
                        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                            Welcome back, {displayName}
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                            Track your websites, publishing status, templates, and collaboration work from one focused dashboard.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild>
                            <Link to="/editor/my-project">
                                <Rocket className="size-4" />
                                New site
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link to={ROUTES.PROJECTS}>
                                View projects
                                <ArrowUpRight className="size-4" />
                            </Link>
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
                    <MetricCard
                        title="Total projects"
                        value={isLoading ? '...' : projects.length.toString()}
                        description="Active websites in your workspace"
                        icon={FolderKanban}
                    />
                    <MetricCard
                        title="Published"
                        value={isLoading ? '...' : dashboardData.publishedProjects.length.toString()}
                        description="Live projects ready to share"
                        icon={Globe2}
                    />
                    <MetricCard
                        title="Pages built"
                        value={isLoading ? '...' : dashboardData.pagesCount.toString()}
                        description="Across saved projects"
                        icon={LayoutTemplate}
                    />
                    <MetricCard
                        title="GitHub links"
                        value={isLoading ? '...' : dashboardData.githubConnected.toString()}
                        description="Projects connected to repos"
                        icon={Activity}
                    />
                </section>

                <section className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
                    <Card className="rounded-lg">
                        <CardHeader className="border-b">
                            <div>
                                <CardTitle>Recent projects</CardTitle>
                                <CardDescription>Jump back into the sites you edited most recently.</CardDescription>
                            </div>
                            <CardAction>
                                <Button asChild variant="ghost" size="sm">
                                    <Link to={ROUTES.PROJECTS}>All projects</Link>
                                </Button>
                            </CardAction>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="divide-y">
                                {isLoading ? (
                                    <ProjectSkeleton />
                                ) : dashboardData.recentProjects.length ? (
                                    dashboardData.recentProjects.map((project) => (
                                        <Link
                                            key={project._id}
                                            to={`/editor/${project._id}`}
                                            className="grid gap-3 py-4 transition-colors hover:bg-muted/35 sm:grid-cols-[1fr_auto] sm:items-center"
                                        >
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="truncate text-sm font-medium">{project.name}</h3>
                                                    {project.isPublished ? (
                                                        <Badge className="rounded-md" variant="secondary">Published</Badge>
                                                    ) : (
                                                        <Badge className="rounded-md" variant="outline">Draft</Badge>
                                                    )}
                                                </div>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {project.pages?.length || 1} page{(project.pages?.length || 1) === 1 ? '' : 's'} edited {formatDate(project.updatedAt)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                {project.githubRepo && <span className="hidden sm:inline">{project.githubRepo}</span>}
                                                <ArrowUpRight className="size-4" />
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="flex min-h-56 flex-col items-center justify-center gap-3 text-center">
                                        <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <FilePlus2 className="size-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium">No projects yet</h3>
                                            <p className="mt-1 text-sm text-muted-foreground">Create your first website to see activity here.</p>
                                        </div>
                                        <Button asChild size="sm">
                                            <Link to="/editor/my-project">Create project</Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>Workspace health</CardTitle>
                            <CardDescription>Signals that help you prepare sites for launch.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <ProgressBlock
                                label="Launch readiness"
                                value={isLoading ? 0 : dashboardData.launchReadiness}
                                caption="Improves as projects are published and connected."
                            />
                            <ProgressBlock
                                label="Storage usage"
                                value={isLoading ? 0 : dashboardData.storageUsage}
                                caption="Estimated from saved projects and page count."
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-lg border bg-muted/25 p-3">
                                    <p className="text-xs text-muted-foreground">Plan</p>
                                    <p className="mt-1 text-sm font-medium">Starter</p>
                                </div>
                                <div className="rounded-lg border bg-muted/25 p-3">
                                    <p className="text-xs text-muted-foreground">Members</p>
                                    <p className="mt-1 text-sm font-medium">1 active</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section className="grid gap-6 xl:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.2fr)]">
                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>Quick actions</CardTitle>
                            <CardDescription>Common next steps for building and organizing.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {quickActions.map((action) => {
                                const Icon = action.icon;
                                return (
                                    <Link
                                        key={action.title}
                                        to={action.href}
                                        className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/40"
                                    >
                                        <span className={`flex size-10 items-center justify-center rounded-lg ${action.tone}`}>
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
                            <CardTitle>Activity timeline</CardTitle>
                            <CardDescription>Useful workspace updates and reminders.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-5">
                                {activityItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <div key={item.title} className="flex gap-3">
                                            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                                <Icon className="size-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <p className="text-sm font-medium">{item.title}</p>
                                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Clock3 className="size-3.5" />
                                                        {item.time}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </div>
    );
};

type MetricCardProps = {
    title: string;
    value: string;
    description: string;
    icon: React.ElementType;
};

const MetricCard = ({ title, value, description, icon: Icon }: MetricCardProps) => (
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

type ProgressBlockProps = {
    label: string;
    value: number;
    caption: string;
};

const ProgressBlock = ({ label, value, caption }: ProgressBlockProps) => (
    <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">{label}</p>
            <span className="text-sm text-muted-foreground">{value}%</span>
        </div>
        <Progress value={value} />
        <p className="text-xs leading-5 text-muted-foreground">{caption}</p>
    </div>
);

const ProjectSkeleton = () => (
    <div className="space-y-3 py-4">
        {[0, 1, 2].map((item) => (
            <div key={item} className="rounded-lg border p-4">
                <div className="h-4 w-2/5 rounded-md bg-muted" />
                <div className="mt-3 h-3 w-3/5 rounded-md bg-muted" />
            </div>
        ))}
    </div>
);

export default Dashboard;
