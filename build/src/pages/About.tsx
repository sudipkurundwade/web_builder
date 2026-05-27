import React from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    CheckCircle2,
    Cloud,
    Code2,
    Github,
    LayoutTemplate,
    Rocket,
    ShieldCheck,
    Sparkles,
    Users2,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/constants/routes';

const pillars = [
    {
        title: 'Visual first',
        description: 'Design pages directly on the canvas while the app keeps the exported HTML clean and portable.',
        icon: LayoutTemplate,
    },
    {
        title: 'Publish ready',
        description: 'Save multi-page projects, manage metadata, and publish static sites to GitHub Pages.',
        icon: Rocket,
    },
    {
        title: 'Cloud assets',
        description: 'Images, videos, and PDFs flow through Cloudinary so projects stay light and shareable.',
        icon: Cloud,
    },
];

const workflow = [
    'Start with a blank canvas or remix a community template.',
    'Customize sections, styling, assets, pages, and SEO details.',
    'Publish to GitHub Pages and share the live URL with clients or teammates.',
];

const values = [
    'Fast enough for experiments',
    'Structured enough for real projects',
    'Friendly to designers and developers',
    'Transparent publishing and ownership',
];

const About: React.FC = () => {
    return (
        <div className="min-h-full bg-background">
            <section className="border-b bg-muted/25">
                <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
                    <Badge variant="secondary" className="w-fit rounded-md">
                        <Sparkles className="size-3.5" />
                        About the builder
                    </Badge>
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
                        <div>
                            <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
                                A practical workspace for building, remixing, and publishing modern websites.
                            </h1>
                            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                                Web Builder brings visual editing, reusable templates, cloud media uploads, and GitHub Pages publishing into one focused product. It is built for creators who want to move quickly without losing control of the final site.
                            </p>
                        </div>
                        <div className="rounded-lg border bg-card p-4 shadow-sm">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <Stat label="Pages" value="Multi" />
                                <Stat label="Assets" value="Cloud" />
                                <Stat label="Export" value="HTML" />
                                <Stat label="Hosting" value="GitHub" />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild>
                            <Link to={ROUTES.DASHBOARD}>
                                Open dashboard
                                <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link to={ROUTES.COMMUNITY_TEMPLATES}>Browse templates</Link>
                        </Button>
                    </div>
                </div>
            </section>

            <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
                <section className="grid gap-4 md:grid-cols-3">
                    {pillars.map((pillar) => (
                        <Card key={pillar.title} className="rounded-lg">
                            <CardHeader>
                                <div className="mb-2 flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                                    <pillar.icon className="size-5" />
                                </div>
                                <CardTitle className="text-base">{pillar.title}</CardTitle>
                                <CardDescription>{pillar.description}</CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </section>

                <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>How it works</CardTitle>
                            <CardDescription>From idea to public URL in a short, repeatable flow.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            {workflow.map((item, index) => (
                                <div key={item} className="flex gap-3">
                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                                        {index + 1}
                                    </div>
                                    <p className="pt-1 text-sm leading-6 text-muted-foreground">{item}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>What we care about</CardTitle>
                            <CardDescription>Simple principles that shape the product.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            {values.map((value) => (
                                <div key={value} className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm">
                                    <CheckCircle2 className="size-4 text-emerald-600" />
                                    <span>{value}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </section>

                <section className="grid gap-4 md:grid-cols-3">
                    <Feature icon={Code2} title="Portable output" description="Generated pages are static HTML and CSS, so published sites stay easy to host and inspect." />
                    <Feature icon={Github} title="GitHub connected" description="Publishing works with repositories you create or link from the dashboard." />
                    <Feature icon={ShieldCheck} title="User owned" description="Your projects, templates, assets, and published repositories stay attached to your account." />
                </section>

                <section className="flex flex-col gap-4 rounded-lg border bg-muted/20 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">Build with the team when you are ready.</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Create projects, save versions, share templates, and keep improving the workflow from one place.
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link to={ROUTES.PROJECTS}>
                            <Users2 className="size-4" />
                            View projects
                        </Link>
                    </Button>
                </section>
            </main>
        </div>
    );
};

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-md border bg-background px-3 py-2">
            <p className="text-[11px] uppercase text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm font-semibold">{value}</p>
        </div>
    );
}

function Feature({
    icon: Icon,
    title,
    description,
}: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-lg border bg-card p-4">
            <Icon className="size-5 text-primary" />
            <h3 className="mt-3 text-sm font-semibold">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
    );
}

export default About;
