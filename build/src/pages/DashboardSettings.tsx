import React, { useMemo, useState } from 'react';
import {
    Bell,
    Check,
    Cloud,
    Github,
    Globe2,
    KeyRound,
    Mail,
    Save,
    Shield,
    SlidersHorizontal,
    UserRound,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';

const notificationOptions = [
    {
        id: 'publish',
        title: 'Publishing updates',
        description: 'Get notified when a GitHub Pages deployment succeeds or needs attention.',
    },
    {
        id: 'templates',
        title: 'Template activity',
        description: 'Receive updates when your shared templates are liked, reviewed, or remixed.',
    },
    {
        id: 'security',
        title: 'Security alerts',
        description: 'Send account and login notices to your primary email address.',
    },
];

const publishingChecks = [
    'Require page title before publish',
    'Add .nojekyll to published repos',
    'Verify Cloudinary URLs before saving',
    'Show GitHub Pages deployment status',
];

const DashboardSettings: React.FC = () => {
    const { user } = useAuth();
    const [displayName, setDisplayName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [workspaceName, setWorkspaceName] = useState('Web Builder Workspace');
    const [defaultRepoOwner, setDefaultRepoOwner] = useState('');
    const [accent, setAccent] = useState('emerald');
    const [saved, setSaved] = useState(false);
    const [notifications, setNotifications] = useState<Record<string, boolean>>({
        publish: true,
        templates: true,
        security: true,
    });

    const accountInitial = useMemo(() => {
        return (displayName || email || 'U').trim().charAt(0).toUpperCase();
    }, [displayName, email]);

    const handleSave = () => {
        setSaved(true);
        window.setTimeout(() => setSaved(false), 2500);
    };

    const toggleNotification = (id: string) => {
        setNotifications((current) => ({
            ...current,
            [id]: !current[id],
        }));
    };

    return (
        <div className="min-h-full bg-background">
            <section className="border-b bg-muted/25">
                <div className="flex flex-col gap-4 px-4 py-6 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
                    <div>
                        <Badge variant="secondary" className="mb-3 rounded-md">
                            <SlidersHorizontal className="size-3.5" />
                            Workspace settings
                        </Badge>
                        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Settings</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                            Manage your account identity, publishing defaults, notifications, and workspace preferences.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {saved && (
                            <Badge className="rounded-md bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300">
                                <Check className="size-3.5" />
                                Saved
                            </Badge>
                        )}
                        <Button onClick={handleSave}>
                            <Save className="size-4" />
                            Save changes
                        </Button>
                    </div>
                </div>
            </section>

            <main className="grid gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">
                <div className="grid gap-6">
                    <Card className="rounded-lg">
                        <CardHeader>
                            <div className="flex items-start gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                    <UserRound className="size-5" />
                                </div>
                                <div>
                                    <CardTitle>Account</CardTitle>
                                    <CardDescription>Keep the core identity for your dashboard and public profile current.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="grid gap-5">
                            <div className="flex items-center gap-4 rounded-lg border bg-muted/20 p-4">
                                <div className="flex size-14 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                                    {accountInitial}
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">{displayName || 'Unnamed creator'}</p>
                                    <p className="truncate text-xs text-muted-foreground">{email || 'No email set'}</p>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Display name" value={displayName} onChange={setDisplayName} placeholder="Your name" />
                                <Field label="Email address" value={email} onChange={setEmail} placeholder="you@example.com" icon={Mail} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-lg">
                        <CardHeader>
                            <div className="flex items-start gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-sky-500/10 text-sky-700 dark:text-sky-300">
                                    <Globe2 className="size-5" />
                                </div>
                                <div>
                                    <CardTitle>Publishing</CardTitle>
                                    <CardDescription>Defaults used when projects are saved and published to GitHub Pages.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="grid gap-5">
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Workspace name" value={workspaceName} onChange={setWorkspaceName} placeholder="Workspace" />
                                <Field label="Default GitHub owner" value={defaultRepoOwner} onChange={setDefaultRepoOwner} placeholder="username or org" icon={Github} />
                            </div>

                            <Separator />

                            <div className="grid gap-3">
                                <p className="text-sm font-medium">Publish checklist</p>
                                <div className="grid gap-2 md:grid-cols-2">
                                    {publishingChecks.map((item) => (
                                        <div key={item} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                                            <Check className="size-4 text-emerald-600" />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-lg">
                        <CardHeader>
                            <div className="flex items-start gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-violet-500/10 text-violet-700 dark:text-violet-300">
                                    <Bell className="size-5" />
                                </div>
                                <div>
                                    <CardTitle>Notifications</CardTitle>
                                    <CardDescription>Choose the product updates that deserve your attention.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            {notificationOptions.map((option) => (
                                <label key={option.id} className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border p-4">
                                    <span>
                                        <span className="block text-sm font-medium">{option.title}</span>
                                        <span className="mt-1 block text-sm leading-6 text-muted-foreground">{option.description}</span>
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={notifications[option.id]}
                                        onChange={() => toggleNotification(option.id)}
                                        className="mt-1 size-4 accent-primary"
                                        aria-label={option.title}
                                    />
                                </label>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <aside className="grid gap-6 content-start">
                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Shield className="size-4" />
                                Security
                            </CardTitle>
                            <CardDescription>Current account protection summary.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3 text-sm">
                            <StatusRow label="JWT session" value="Active" />
                            <StatusRow label="GitHub token" value="Configured" />
                            <StatusRow label="Cloudinary keys" value="Configured" />
                            <Button variant="outline" className="mt-2 justify-start">
                                <KeyRound className="size-4" />
                                Manage credentials
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Cloud className="size-4" />
                                Storage
                            </CardTitle>
                            <CardDescription>Media uploads are routed through Cloudinary.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="rounded-md border bg-muted/20 p-3">
                                <p className="text-xs uppercase text-muted-foreground">Accepted media</p>
                                <p className="mt-1 text-sm font-medium">Images, videos, PDFs</p>
                            </div>
                            <div className="rounded-md border bg-muted/20 p-3">
                                <p className="text-xs uppercase text-muted-foreground">Default upload folder</p>
                                <p className="mt-1 break-all text-sm font-medium">web-builder/assets</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle className="text-base">Appearance</CardTitle>
                            <CardDescription>Choose the accent used for workspace highlights.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-2">
                                {['emerald', 'sky', 'violet'].map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setAccent(color)}
                                        className={[
                                            'h-9 rounded-md border text-xs font-medium capitalize transition',
                                            accent === color ? 'ring-2 ring-primary ring-offset-2' : 'hover:bg-muted',
                                        ].join(' ')}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </aside>
            </main>
        </div>
    );
};

function Field({
    label,
    value,
    onChange,
    placeholder,
    icon: Icon,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    icon?: React.ComponentType<{ className?: string }>;
}) {
    const id = label.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <div className="relative">
                {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />}
                <Input
                    id={id}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder={placeholder}
                    className={Icon ? 'pl-9' : undefined}
                />
            </div>
        </div>
    );
}

function StatusRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <span className="text-muted-foreground">{label}</span>
            <Badge variant="secondary" className="rounded-md">{value}</Badge>
        </div>
    );
}

export default DashboardSettings;
