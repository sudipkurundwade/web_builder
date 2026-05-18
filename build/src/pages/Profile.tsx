import { useEffect, useState } from "react";
import { Github, Linkedin, Loader2, Pin, PinOff, Save, Shield, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CommunityTemplateCard } from "@/components/templates/CommunityTemplateCard";
import { useAuth } from "@/context/AuthContext";
import { getPublicProfile, updateFeaturedTemplates, updateMyProfile } from "@/services/profileService";
import type { CommunityTemplate } from "@/types/template";
import type { PublicProfile } from "@/types/profile";

export default function Profile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [form, setForm] = useState({
        name: "",
        bio: "",
        avatarUrl: "",
        location: "",
        github: "",
        linkedin: "",
        website: "",
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [pinningTemplateId, setPinningTemplateId] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.id) return;
        let cancelled = false;
        getPublicProfile(user.id)
            .then((data) => {
                if (cancelled) return;
                setProfile(data);
                setForm({
                    name: data.name || "",
                    bio: data.bio || "",
                    avatarUrl: data.avatarUrl || "",
                    location: data.location || "",
                    github: data.socialLinks?.github || "",
                    linkedin: data.socialLinks?.linkedin || "",
                    website: data.socialLinks?.website || "",
                });
            })
            .catch((err: any) => {
                if (!cancelled) setError(err?.response?.data?.message || "Could not load profile.");
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [user?.id]);

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        setMessage(null);
        try {
            const nextProfile = await updateMyProfile({
                name: form.name,
                bio: form.bio,
                avatarUrl: form.avatarUrl,
                location: form.location,
                socialLinks: {
                    github: form.github,
                    linkedin: form.linkedin,
                    website: form.website,
                },
            });
            setProfile(nextProfile);
            setMessage("Profile updated successfully.");
        } catch (err: any) {
            setError(err?.response?.data?.message || "Could not update profile.");
        } finally {
            setIsSaving(false);
        }
    };

    const patchTemplate = (templateId: string, patch: Partial<CommunityTemplate>) => {
        setProfile((current) => {
            if (!current) return current;
            return {
                ...current,
                featuredTemplates: current.featuredTemplates.map((template) => (
                    template._id === templateId ? { ...template, ...patch } : template
                )),
                templates: current.templates.map((template) => (
                    template._id === templateId ? { ...template, ...patch } : template
                )),
            };
        });
    };

    const handleToggleFeaturedTemplate = async (templateId: string) => {
        if (!profile) return;

        const currentFeaturedIds = profile.featuredTemplateIds || profile.featuredTemplates.map((template) => template._id);
        const isFeatured = currentFeaturedIds.includes(templateId);
        const nextFeaturedIds = isFeatured
            ? currentFeaturedIds.filter((id) => id !== templateId)
            : [...currentFeaturedIds, templateId].slice(-3);

        setPinningTemplateId(templateId);
        setError(null);
        setMessage(null);
        try {
            const nextProfile = await updateFeaturedTemplates(nextFeaturedIds);
            setProfile(nextProfile);
            setMessage("Featured templates updated.");
        } catch (err: any) {
            setError(err?.response?.data?.message || "Could not update featured templates.");
        } finally {
            setPinningTemplateId(null);
        }
    };

    if (!user) {
        return <div className="p-6 text-sm text-muted-foreground">Please sign in to view your profile.</div>;
    }

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading profile...
            </div>
        );
    }

    return (
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Your Profile</h1>
                    <p className="text-sm text-muted-foreground">
                        Update the public profile other users see in the community.
                    </p>
                </div>
                <Badge variant="secondary" className="flex items-center gap-2">
                    <Shield className="size-3" />
                    {user.plan || "free"}
                </Badge>
            </div>

            {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
            {message && <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700">{message}</div>}

            <Card>
                <CardHeader>
                    <CardTitle>Public Identity</CardTitle>
                    <CardDescription>Profile details, bio, and social links.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="size-20">
                            <AvatarImage src={form.avatarUrl} alt={form.name} />
                            <AvatarFallback className="text-lg">{form.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 gap-2">
                            <Label htmlFor="avatarUrl">Avatar URL</Label>
                            <Input id="avatarUrl" value={form.avatarUrl} onChange={(event) => setForm({ ...form, avatarUrl: event.target.value })} />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Display Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
                        <Field label="Location" value={form.location} onChange={(value) => setForm({ ...form, location: value })} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Input id="bio" value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} placeholder="Designer, founder, frontend builder..." />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <IconField icon={<Github className="size-4" />} label="GitHub" value={form.github} onChange={(value) => setForm({ ...form, github: value })} />
                        <IconField icon={<Linkedin className="size-4" />} label="LinkedIn" value={form.linkedin} onChange={(value) => setForm({ ...form, linkedin: value })} />
                        <IconField icon={<User className="size-4" />} label="Website" value={form.website} onChange={(value) => setForm({ ...form, website: value })} />
                    </div>

                    <Button type="button" onClick={() => void handleSave()} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
                        Save Profile
                    </Button>
                </CardContent>
            </Card>

            {profile && (
                <div className="grid gap-3 sm:grid-cols-4">
                    <Stat label="Projects" value={profile.stats.projectCount} />
                    <Stat label="Templates" value={profile.stats.templateCount} />
                    <Stat label="Followers" value={profile.stats.followersCount} />
                    <Stat label="Following" value={profile.stats.followingCount} />
                </div>
            )}

            {profile && (
                <section className="space-y-3">
                    <div>
                        <h2 className="text-lg font-semibold">Featured Showcase</h2>
                        <p className="text-sm text-muted-foreground">
                            Pin up to 3 shared templates to highlight them on your public profile.
                        </p>
                    </div>
                    {profile.featuredTemplates.length ? (
                        <div className="grid gap-4 md:grid-cols-2">
                            {profile.featuredTemplates.map((template) => (
                                <CommunityTemplateCard
                                    key={template._id}
                                    template={template}
                                    ownerFallback={{
                                        _id: profile._id,
                                        name: profile.name,
                                        email: profile.email,
                                        bio: profile.bio,
                                        avatarUrl: profile.avatarUrl,
                                    }}
                                    ownerStatsFallback={profile.stats}
                                    onTemplateChange={patchTemplate}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                            No featured templates yet. Pin templates from your shared list below.
                        </div>
                    )}
                </section>
            )}

            {profile && (
                <section className="space-y-3">
                    <h2 className="text-lg font-semibold">Shared Templates</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {profile.templates.map((template) => (
                            <div key={template._id} className="space-y-2">
                                <Button
                                    type="button"
                                    variant={(profile.featuredTemplateIds || []).includes(template._id) ? "secondary" : "outline"}
                                    size="sm"
                                    onClick={() => void handleToggleFeaturedTemplate(template._id)}
                                    disabled={pinningTemplateId === template._id}
                                >
                                    {pinningTemplateId === template._id ? (
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                    ) : (profile.featuredTemplateIds || []).includes(template._id) ? (
                                        <PinOff className="mr-2 size-4" />
                                    ) : (
                                        <Pin className="mr-2 size-4" />
                                    )}
                                    {(profile.featuredTemplateIds || []).includes(template._id) ? "Unpin from Showcase" : "Pin to Showcase"}
                                </Button>
                                <CommunityTemplateCard
                                    template={template}
                                    ownerFallback={{
                                        _id: profile._id,
                                        name: profile.name,
                                        email: profile.email,
                                        bio: profile.bio,
                                        avatarUrl: profile.avatarUrl,
                                    }}
                                    ownerStatsFallback={profile.stats}
                                    onTemplateChange={patchTemplate}
                                />
                            </div>
                        ))}
                        {!profile.templates.length && (
                            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                                No shared templates yet.
                            </div>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            <Input value={value} onChange={(event) => onChange(event.target.value)} />
        </div>
    );
}

function IconField({ icon, label, value, onChange }: { icon: React.ReactNode; label: string; value: string; onChange: (value: string) => void }) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
                <Input className="pl-9" value={value} onChange={(event) => onChange(event.target.value)} />
            </div>
        </div>
    );
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <Card>
            <CardContent className="p-4 text-center">
                <div className="text-xl font-semibold">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
            </CardContent>
        </Card>
    );
}
