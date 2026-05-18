import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CommunityTemplateCard } from "@/components/templates/CommunityTemplateCard";
import { getCommunityTemplates, toggleFollowCreator } from "@/services/templateService";
import type { CommunityTemplate } from "@/types/template";

export default function CommunityTemplates() {
    const [templates, setTemplates] = useState<CommunityTemplate[]>([]);
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("All");
    const [feed, setFeed] = useState<"all" | "following">("all");
    const [isLoading, setIsLoading] = useState(true);
    const [followingUserId, setFollowingUserId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);
        setError(null);

        getCommunityTemplates({ following: feed === "following" })
            .then((data) => {
                if (!cancelled) setTemplates(data);
            })
            .catch((err: any) => {
                if (!cancelled) {
                    setError(err?.response?.data?.message || "Could not load community templates.");
                }
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [feed]);

    const categories = useMemo(() => {
        return ["All", ...Array.from(new Set(templates.map((template) => template.category || "Website"))).sort()];
    }, [templates]);

    const filteredTemplates = useMemo(() => {
        const q = query.trim().toLowerCase();
        return templates.filter((template) => {
            const matchesCategory = category === "All" || template.category === category;
            const text = [
                template.name,
                template.description,
                template.category,
                ...(template.tags || []),
            ].join(" ").toLowerCase();
            return matchesCategory && (!q || text.includes(q));
        });
    }, [category, query, templates]);

    const patchTemplate = (templateId: string, patch: Partial<CommunityTemplate>) => {
        setTemplates((current) => current.map((template) => (
            template._id === templateId ? { ...template, ...patch } : template
        )));
    };

    const handleFollow = async (template: CommunityTemplate) => {
        const userId = template.owner?._id;
        if (!userId) return;

        setFollowingUserId(userId);
        setError(null);
        try {
            const result = await toggleFollowCreator(userId);
            setTemplates((current) => current.map((item) => {
                if (item.owner?._id !== userId) return item;
                return {
                    ...item,
                    ownerStats: {
                        projectCount: item.ownerStats?.projectCount || 0,
                        templateCount: item.ownerStats?.templateCount || 0,
                        followingCount: item.ownerStats?.followingCount || 0,
                        ...item.ownerStats,
                        followedByMe: result.followedByMe,
                        followersCount: result.followersCount,
                    },
                };
            }).filter((item) => feed !== "following" || item.owner?._id !== userId || result.followedByMe));
        } catch (err: any) {
            setError(err?.response?.data?.message || "Could not update follow.");
        } finally {
            setFollowingUserId(null);
        }
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Community Templates</h1>
                    <p className="text-sm text-muted-foreground">
                        Browse published designs shared by users and remix them into your own projects.
                    </p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search templates"
                        className="pl-9"
                    />
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <Button
                    type="button"
                    variant={feed === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFeed("all")}
                >
                    All Templates
                </Button>
                <Button
                    type="button"
                    variant={feed === "following" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFeed("following")}
                >
                    Following
                </Button>
                {categories.map((item) => (
                    <Button
                        key={item}
                        type="button"
                        variant={category === item ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCategory(item)}
                    >
                        {item}
                    </Button>
                ))}
            </div>

            {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            {isLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Loading community templates...
                </div>
            )}

            {!isLoading && filteredTemplates.length === 0 && (
                <div className="rounded-lg border border-dashed p-8 text-center">
                    <Sparkles className="mx-auto mb-3 size-8 text-muted-foreground" />
                    <p className="font-medium">
                        {feed === "following" ? "No templates from followed creators yet" : "No community templates yet"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {feed === "following"
                            ? "Follow creators from the community library to build a personalized feed."
                            : "Publish a project and share it as a template to seed the library."}
                    </p>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredTemplates.map((template) => (
                    <CommunityTemplateCard
                        key={template._id}
                        template={template}
                        onTemplateChange={patchTemplate}
                        onFollowOwner={handleFollow}
                        followingOwnerId={followingUserId}
                    />
                ))}
            </div>
        </div>
    );
}
