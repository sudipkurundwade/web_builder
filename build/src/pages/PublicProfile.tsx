import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ExternalLink, Github, Linkedin, Loader2, MapPin, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicProfile, toggleFollowProfile } from "@/services/profileService";
import type { PublicProfile as PublicProfileType } from "@/types/profile";

export default function PublicProfile() {
    const { userId } = useParams<{ userId: string }>();
    const [profile, setProfile] = useState<PublicProfileType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) return;
        let cancelled = false;
        setIsLoading(true);
        getPublicProfile(userId)
            .then((data) => {
                if (!cancelled) setProfile(data);
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
    }, [userId]);

    const handleFollow = async () => {
        if (!profile) return;
        setIsFollowing(true);
        try {
            const result = await toggleFollowProfile(profile._id);
            setProfile({
                ...profile,
                stats: {
                    ...profile.stats,
                    followedByMe: result.followedByMe,
                    followersCount: result.followersCount,
                },
            });
        } finally {
            setIsFollowing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading profile...
            </div>
        );
    }

    if (error || !profile) {
        return <div className="p-6 text-sm text-destructive">{error || "Profile not found."}</div>;
    }

    const links = profile.socialLinks || {};

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                        <div className="flex gap-4">
                            <Avatar className="size-20">
                                <AvatarImage src={profile.avatarUrl || ""} alt={profile.name} />
                                <AvatarFallback className="text-xl">{profile.name.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-2xl font-bold">{profile.name}</h1>
                                {profile.location && (
                                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                                        <MapPin className="size-4" />
                                        {profile.location}
                                    </p>
                                )}
                                <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                                    {profile.bio || "This creator has not added a bio yet."}
                                </p>
                            </div>
                        </div>
                        <Button type="button" onClick={() => void handleFollow()} disabled={isFollowing}>
                            {isFollowing ? <Loader2 className="mr-2 size-4 animate-spin" /> : <UserPlus className="mr-2 size-4" />}
                            {profile.stats.followedByMe ? "Following" : "Follow"}
                        </Button>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-4">
                        <Stat label="Projects" value={profile.stats.projectCount} />
                        <Stat label="Templates" value={profile.stats.templateCount} />
                        <Stat label="Followers" value={profile.stats.followersCount} />
                        <Stat label="Following" value={profile.stats.followingCount} />
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                        {links.github && <SocialLink href={links.github} icon={<Github className="size-4" />} label="GitHub" />}
                        {links.linkedin && <SocialLink href={links.linkedin} icon={<Linkedin className="size-4" />} label="LinkedIn" />}
                        {links.website && <SocialLink href={links.website} icon={<ExternalLink className="size-4" />} label="Website" />}
                    </div>
                </CardContent>
            </Card>

            <section className="space-y-3">
                <h2 className="text-lg font-semibold">Shared Templates</h2>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {profile.templates.map((template) => (
                        <Card key={template._id}>
                            <CardHeader>
                                <div className="flex items-start justify-between gap-3">
                                    <CardTitle className="line-clamp-1 text-base">{template.name}</CardTitle>
                                    <Badge variant="secondary">{template.category}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="line-clamp-2 text-sm text-muted-foreground">
                                    {template.description || "A community template by this creator."}
                                </p>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{template.remixCount || 0} remixes</span>
                                    <span>{template.likesCount || 0} likes</span>
                                    <span>{template.commentsCount || 0} comments</span>
                                </div>
                                {template.liveUrl && (
                                    <Button type="button" variant="outline" size="sm" className="w-full" asChild>
                                        <a href={template.liveUrl} target="_blank" rel="noreferrer">
                                            View Published Site
                                        </a>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                    {!profile.templates.length && (
                        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                            No shared templates yet.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-md border bg-muted/20 p-3 text-center">
            <div className="text-lg font-semibold">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
        </div>
    );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Button type="button" variant="outline" size="sm" asChild>
            <a href={href} target="_blank" rel="noreferrer">
                {icon}
                <span className="ml-2">{label}</span>
            </a>
        </Button>
    );
}
