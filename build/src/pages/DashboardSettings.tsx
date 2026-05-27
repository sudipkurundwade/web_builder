import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Bell,
    Check,
    Cloud,
    Github,
    Globe2,
    KeyRound,
    Mail,
    Monitor,
    Moon,
    Palette,
    Save,
    Shield,
    SlidersHorizontal,
    Sun,
    UserRound,
} from 'lucide-react';
import { useTheme } from 'next-themes';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { updateAppearanceSettings } from '@/services/authService';

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

type AccentColor = {
    name: string;
    value: string;
    primary: string;
    foreground: string;
    soft: string;
    softForeground: string;
};

type StylePreset = {
    name: string;
    value: string;
    description: string;
    radius: string;
    background: string;
    card: string;
    muted: string;
    border: string;
    input: string;
    shadowX: string;
    shadowY: string;
    shadowBlur: string;
    shadowSpread: string;
    shadowOpacity: string;
};

const themeStorageKey = 'web-builder-accent-theme';
const styleStorageKey = 'web-builder-style-preset';
const themeModeStorageKey = 'theme';

const accentColors: AccentColor[] = [
    { name: 'Neutral', value: 'neutral', primary: 'oklch(0.556 0 0)', foreground: 'oklch(0.985 0 0)', soft: 'oklch(0.97 0 0)', softForeground: 'oklch(0.205 0 0)' },
    { name: 'Amber', value: 'amber', primary: 'oklch(0.769 0.188 70.08)', foreground: 'oklch(0.205 0 0)', soft: 'oklch(0.962 0.059 95.62)', softForeground: 'oklch(0.279 0.077 45.64)' },
    { name: 'Blue', value: 'blue', primary: 'oklch(0.546 0.245 262.88)', foreground: 'oklch(0.985 0 0)', soft: 'oklch(0.932 0.032 255.59)', softForeground: 'oklch(0.282 0.091 267.94)' },
    { name: 'Cyan', value: 'cyan', primary: 'oklch(0.715 0.143 215.22)', foreground: 'oklch(0.205 0 0)', soft: 'oklch(0.956 0.045 203.39)', softForeground: 'oklch(0.302 0.056 229.70)' },
    { name: 'Emerald', value: 'emerald', primary: 'oklch(0.596 0.145 163.23)', foreground: 'oklch(0.985 0 0)', soft: 'oklch(0.95 0.052 163.05)', softForeground: 'oklch(0.262 0.051 172.55)' },
    { name: 'Fuchsia', value: 'fuchsia', primary: 'oklch(0.667 0.295 322.15)', foreground: 'oklch(0.985 0 0)', soft: 'oklch(0.952 0.037 318.85)', softForeground: 'oklch(0.293 0.136 325.66)' },
    { name: 'Green', value: 'green', primary: 'oklch(0.627 0.194 149.21)', foreground: 'oklch(0.985 0 0)', soft: 'oklch(0.962 0.044 156.74)', softForeground: 'oklch(0.266 0.065 152.93)' },
    { name: 'Indigo', value: 'indigo', primary: 'oklch(0.511 0.262 276.97)', foreground: 'oklch(0.985 0 0)', soft: 'oklch(0.93 0.034 272.79)', softForeground: 'oklch(0.257 0.09 281.29)' },
    { name: 'Lime', value: 'lime', primary: 'oklch(0.768 0.233 130.85)', foreground: 'oklch(0.205 0 0)', soft: 'oklch(0.967 0.067 122.33)', softForeground: 'oklch(0.274 0.072 132.11)' },
    { name: 'Orange', value: 'orange', primary: 'oklch(0.705 0.213 47.60)', foreground: 'oklch(0.985 0 0)', soft: 'oklch(0.954 0.038 75.16)', softForeground: 'oklch(0.266 0.079 36.26)' },
    { name: 'Pink', value: 'pink', primary: 'oklch(0.656 0.241 354.31)', foreground: 'oklch(0.985 0 0)', soft: 'oklch(0.948 0.028 342.26)', softForeground: 'oklch(0.284 0.109 3.91)' },
    { name: 'Purple', value: 'purple', primary: 'oklch(0.558 0.288 302.32)', foreground: 'oklch(0.985 0 0)', soft: 'oklch(0.946 0.033 307.17)', softForeground: 'oklch(0.291 0.149 302.72)' },
    { name: 'Red', value: 'red', primary: 'oklch(0.637 0.237 25.33)', foreground: 'oklch(0.985 0 0)', soft: 'oklch(0.936 0.032 17.72)', softForeground: 'oklch(0.258 0.092 26.04)' },
    { name: 'Rose', value: 'rose', primary: 'oklch(0.645 0.246 16.44)', foreground: 'oklch(0.985 0 0)', soft: 'oklch(0.941 0.03 12.58)', softForeground: 'oklch(0.271 0.105 12.09)' },
    { name: 'Sky', value: 'sky', primary: 'oklch(0.685 0.169 237.32)', foreground: 'oklch(0.985 0 0)', soft: 'oklch(0.951 0.026 236.82)', softForeground: 'oklch(0.293 0.066 243.16)' },
    { name: 'Teal', value: 'teal', primary: 'oklch(0.6 0.118 184.70)', foreground: 'oklch(0.985 0 0)', soft: 'oklch(0.953 0.051 180.80)', softForeground: 'oklch(0.277 0.046 192.52)' },
    { name: 'Violet', value: 'violet', primary: 'oklch(0.606 0.25 292.72)', foreground: 'oklch(0.985 0 0)', soft: 'oklch(0.943 0.029 294.59)', softForeground: 'oklch(0.283 0.141 291.09)' },
    { name: 'Yellow', value: 'yellow', primary: 'oklch(0.795 0.184 86.05)', foreground: 'oklch(0.205 0 0)', soft: 'oklch(0.973 0.071 103.19)', softForeground: 'oklch(0.286 0.066 53.81)' },
];

const stylePresets: StylePreset[] = [
    {
        name: 'Vega',
        value: 'vega',
        description: 'Sharp workspace chrome with compact shadows.',
        radius: '0.375rem',
        background: 'oklch(0.985 0 0)',
        card: 'oklch(1 0 0)',
        muted: 'oklch(0.97 0 0)',
        border: 'oklch(0.9 0 0)',
        input: 'oklch(0.94 0 0)',
        shadowX: '0px',
        shadowY: '1px',
        shadowBlur: '2px',
        shadowSpread: '0px',
        shadowOpacity: '0.12',
    },
    {
        name: 'Nova',
        value: 'nova',
        description: 'Balanced radius and clean product surfaces.',
        radius: '0.5rem',
        background: 'oklch(0.985 0 0)',
        card: 'oklch(1 0 0)',
        muted: 'oklch(0.97 0 0)',
        border: 'oklch(0.92 0 0)',
        input: 'oklch(0.94 0 0)',
        shadowX: '0.25px',
        shadowY: '1px',
        shadowBlur: '3px',
        shadowSpread: '0px',
        shadowOpacity: '0.15',
    },
    {
        name: 'Maia',
        value: 'maia',
        description: 'Soft panels with calmer contrast.',
        radius: '0.75rem',
        background: 'oklch(0.982 0.004 247)',
        card: 'oklch(1 0 0)',
        muted: 'oklch(0.965 0.006 247)',
        border: 'oklch(0.91 0.006 247)',
        input: 'oklch(0.945 0.006 247)',
        shadowX: '0px',
        shadowY: '4px',
        shadowBlur: '12px',
        shadowSpread: '-6px',
        shadowOpacity: '0.14',
    },
    {
        name: 'Lyra',
        value: 'lyra',
        description: 'Airier controls with elevated cards.',
        radius: '1rem',
        background: 'oklch(0.988 0.002 280)',
        card: 'oklch(1 0 0)',
        muted: 'oklch(0.968 0.004 280)',
        border: 'oklch(0.9 0.005 280)',
        input: 'oklch(0.948 0.005 280)',
        shadowX: '0px',
        shadowY: '10px',
        shadowBlur: '24px',
        shadowSpread: '-14px',
        shadowOpacity: '0.18',
    },
    {
        name: 'Mira',
        value: 'mira',
        description: 'Quiet editorial spacing with gentle depth.',
        radius: '0.625rem',
        background: 'oklch(0.984 0.003 105)',
        card: 'oklch(0.998 0.001 105)',
        muted: 'oklch(0.964 0.006 105)',
        border: 'oklch(0.905 0.006 105)',
        input: 'oklch(0.944 0.006 105)',
        shadowX: '0px',
        shadowY: '6px',
        shadowBlur: '18px',
        shadowSpread: '-12px',
        shadowOpacity: '0.13',
    },
    {
        name: 'Luma',
        value: 'luma',
        description: 'Bright surfaces with crisp control edges.',
        radius: '0.25rem',
        background: 'oklch(0.99 0 0)',
        card: 'oklch(1 0 0)',
        muted: 'oklch(0.975 0 0)',
        border: 'oklch(0.88 0 0)',
        input: 'oklch(0.935 0 0)',
        shadowX: '0px',
        shadowY: '2px',
        shadowBlur: '5px',
        shadowSpread: '-2px',
        shadowOpacity: '0.1',
    },
    {
        name: 'Sera',
        value: 'sera',
        description: 'Rounded approachable controls and soft borders.',
        radius: '1.25rem',
        background: 'oklch(0.986 0.004 180)',
        card: 'oklch(1 0 0)',
        muted: 'oklch(0.966 0.008 180)',
        border: 'oklch(0.902 0.008 180)',
        input: 'oklch(0.946 0.008 180)',
        shadowX: '0px',
        shadowY: '8px',
        shadowBlur: '18px',
        shadowSpread: '-10px',
        shadowOpacity: '0.12',
    },
    {
        name: 'Rhea',
        value: 'rhea',
        description: 'Dense dashboard style with stronger separators.',
        radius: '0.125rem',
        background: 'oklch(0.98 0 0)',
        card: 'oklch(0.998 0 0)',
        muted: 'oklch(0.955 0 0)',
        border: 'oklch(0.86 0 0)',
        input: 'oklch(0.925 0 0)',
        shadowX: '0px',
        shadowY: '1px',
        shadowBlur: '1px',
        shadowSpread: '0px',
        shadowOpacity: '0.16',
    },
];

const setRootColor = (name: string, value: string) => {
    document.documentElement.style.setProperty(name, value);
};

const clearRootColor = (name: string) => {
    document.documentElement.style.removeProperty(name);
};

const applyAccentColor = (accent: AccentColor) => {
    clearRootColor('--accent');
    clearRootColor('--accent-foreground');
    clearRootColor('--sidebar-accent');
    clearRootColor('--sidebar-accent-foreground');

    setRootColor('--primary', accent.primary);
    setRootColor('--primary-foreground', accent.foreground);
    setRootColor('--ring', accent.primary);
    setRootColor('--sidebar-primary', accent.primary);
    setRootColor('--sidebar-primary-foreground', accent.foreground);
    setRootColor('--chart-1', accent.soft);
    setRootColor('--chart-2', accent.primary);
    setRootColor('--chart-3', accent.softForeground);
    setRootColor('--chart-4', accent.primary);
    setRootColor('--chart-5', accent.softForeground);
    setRootColor('--shadow-color', accent.primary);
    document.documentElement.dataset.accentTheme = accent.value;
};

const applyStylePreset = (style: StylePreset) => {
    clearRootColor('--background');
    clearRootColor('--card');
    clearRootColor('--popover');
    clearRootColor('--muted');
    clearRootColor('--secondary');
    clearRootColor('--border');
    clearRootColor('--input');
    clearRootColor('--sidebar');
    clearRootColor('--sidebar-border');

    setRootColor('--radius', style.radius);
    setRootColor('--shadow-x', style.shadowX);
    setRootColor('--shadow-y', style.shadowY);
    setRootColor('--shadow-blur', style.shadowBlur);
    setRootColor('--shadow-spread', style.shadowSpread);
    setRootColor('--shadow-opacity', style.shadowOpacity);
    document.documentElement.dataset.stylePreset = style.value;
};

const DashboardSettings: React.FC = () => {
    const { user } = useAuth();
    const { theme, setTheme } = useTheme();
    const syncedUserId = useRef<string | null>(null);
    const [displayName, setDisplayName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [workspaceName, setWorkspaceName] = useState('Web Builder Workspace');
    const [defaultRepoOwner, setDefaultRepoOwner] = useState('');
    const [accent, setAccent] = useState(() => {
        if (typeof window === 'undefined') return 'indigo';
        return window.localStorage.getItem(themeStorageKey) || 'indigo';
    });
    const [stylePreset, setStylePreset] = useState(() => {
        if (typeof window === 'undefined') return 'nova';
        return window.localStorage.getItem(styleStorageKey) || 'nova';
    });
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [notifications, setNotifications] = useState<Record<string, boolean>>({
        publish: true,
        templates: true,
        security: true,
    });

    const accountInitial = useMemo(() => {
        return (displayName || email || 'U').trim().charAt(0).toUpperCase();
    }, [displayName, email]);

    const selectedAccent = useMemo(() => {
        return accentColors.find((color) => color.value === accent) || accentColors[0];
    }, [accent]);

    const selectedStyle = useMemo(() => {
        return stylePresets.find((style) => style.value === stylePreset) || stylePresets[1];
    }, [stylePreset]);

    useEffect(() => {
        applyAccentColor(selectedAccent);
        window.localStorage.setItem(themeStorageKey, selectedAccent.value);
    }, [selectedAccent]);

    useEffect(() => {
        applyStylePreset(selectedStyle);
        window.localStorage.setItem(styleStorageKey, selectedStyle.value);
    }, [selectedStyle]);

    useEffect(() => {
        if (!user?.id || syncedUserId.current === user.id) return;

        const settings = user.appearanceSettings;
        syncedUserId.current = user.id;
        setDisplayName(user.name || '');
        setEmail(user.email || '');

        if (!settings) return;

        if (settings.accentTheme && accentColors.some((color) => color.value === settings.accentTheme)) {
            setAccent(settings.accentTheme);
        }
        if (settings.stylePreset && stylePresets.some((style) => style.value === settings.stylePreset)) {
            setStylePreset(settings.stylePreset);
        }
        if (settings.themeMode === 'light' || settings.themeMode === 'dark' || settings.themeMode === 'system') {
            setTheme(settings.themeMode);
            window.localStorage.setItem(themeModeStorageKey, settings.themeMode);
        }
    }, [setTheme, user]);

    const handleSave = async () => {
        const themeMode = theme === 'light' || theme === 'dark' || theme === 'system' ? theme : 'system';

        setSaveError('');
        setSaving(true);

        try {
            if (user?.id) {
                await updateAppearanceSettings({
                    themeMode,
                    accentTheme: selectedAccent.value,
                    stylePreset: selectedStyle.value,
                });
            }

            setSaved(true);
            window.setTimeout(() => setSaved(false), 2500);
        } catch {
            setSaveError('Could not save appearance settings to your account.');
        } finally {
            setSaving(false);
        }
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
                            {saving ? 'Saving...' : 'Save changes'}
                        </Button>
                    </div>
                    {saveError && (
                        <p className="text-sm text-destructive lg:text-right">{saveError}</p>
                    )}
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
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Palette className="size-4" />
                                Appearance
                            </CardTitle>
                            <CardDescription>Choose how the shadcn theme renders across the workspace.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-5">
                            <div className="grid gap-2">
                                <Label>Mode</Label>
                                <Select value={theme || 'system'} onValueChange={setTheme}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Theme mode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="light">
                                            <Sun className="size-4" />
                                            Light
                                        </SelectItem>
                                        <SelectItem value="dark">
                                            <Moon className="size-4" />
                                            Dark
                                        </SelectItem>
                                        <SelectItem value="system">
                                            <Monitor className="size-4" />
                                            System
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Separator />

                            <div className="grid gap-3">
                                <div className="flex items-center justify-between gap-3">
                                    <Label>Theme color</Label>
                                    <Badge variant="secondary" className="rounded-md">{selectedAccent.name}</Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                                    {accentColors.map((color) => (
                                        <button
                                            key={color.value}
                                            type="button"
                                            onClick={() => setAccent(color.value)}
                                            className={[
                                                'flex h-10 items-center gap-2 rounded-md border px-2 text-xs font-medium transition hover:bg-muted',
                                                accent === color.value ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : '',
                                            ].join(' ')}
                                            aria-pressed={accent === color.value}
                                        >
                                            <span
                                                className="size-4 rounded-full border"
                                                style={{ backgroundColor: color.primary }}
                                                aria-hidden="true"
                                            />
                                            <span className="truncate">{color.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            <div className="grid gap-3">
                                <div className="flex items-center justify-between gap-3">
                                    <Label>Style</Label>
                                    <Badge variant="secondary" className="rounded-md">{selectedStyle.name}</Badge>
                                </div>
                                <Select value={stylePreset} onValueChange={setStylePreset}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Style preset" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {stylePresets.map((style) => (
                                            <SelectItem key={style.value} value={style.value}>
                                                {style.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="grid gap-2">
                                    {stylePresets.map((style) => (
                                        <button
                                            key={style.value}
                                            type="button"
                                            onClick={() => setStylePreset(style.value)}
                                            className={[
                                                'rounded-md border p-3 text-left transition hover:bg-muted',
                                                stylePreset === style.value ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2 ring-offset-background' : '',
                                            ].join(' ')}
                                            aria-pressed={stylePreset === style.value}
                                        >
                                            <span className="flex items-center justify-between gap-3">
                                                <span className="text-sm font-medium">{style.name}</span>
                                                <span
                                                    className="h-4 w-9 border bg-card shadow-sm"
                                                    style={{ borderRadius: style.radius }}
                                                    aria-hidden="true"
                                                />
                                            </span>
                                            <span className="mt-1 block text-xs leading-5 text-muted-foreground">{style.description}</span>
                                        </button>
                                    ))}
                                </div>
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
