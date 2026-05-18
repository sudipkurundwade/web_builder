import { useEffect, useState } from "react";
import { ArrowDownUp, Grid3X3, Loader2, Search, Sparkles, Star, Tags, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CommunityTemplateCard } from "@/components/templates/CommunityTemplateCard";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getCommunityTemplates, getTemplateCategories, toggleFollowCreator } from "@/services/templateService";
import type { CommunityTemplate } from "@/types/template";

const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "top-rated", label: "Top Rated" },
    { value: "most-liked", label: "Most Liked" },
    { value: "most-remixed", label: "Most Remixed" },
    { value: "most-commented", label: "Most Commented" },
];

export default function CommunityTemplates() {
    const [templates, setTemplates] = useState<CommunityTemplate[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("All");
    const [feed, setFeed] = useState<"all" | "following">("all");
    const [sort, setSort] = useState("newest");
    const [isLoading, setIsLoading] = useState(true);
    const [followingUserId, setFollowingUserId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const totalRemixes = templates.reduce((sum, template) => sum + (template.remixCount || 0), 0);
    const averageRating = templates.length
        ? templates.reduce((sum, template) => sum + (template.ratingAverage || 0), 0) / templates.length
        : 0;

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);
        setError(null);

        getCommunityTemplates({
            q: query.trim() || undefined,
            category: category === "All" ? undefined : category,
            following: feed === "following",
            sort,
        })
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
    }, [category, feed, query, sort]);

    useEffect(() => {
        let cancelled = false;

        getTemplateCategories()
            .then((data) => {
                if (!cancelled) setCategories(data);
            })
            .catch(() => {
                if (!cancelled) setCategories([]);
            });

        return () => {
            cancelled = true;
        };
    }, []);

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
            <div className="space-y-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="gap-1">
                                <Sparkles className="size-3" />
                                Community Library
                            </Badge>
                            {feed === "following" && <Badge variant="outline">Following feed</Badge>}
                            {category !== "All" && <Badge variant="outline">{category}</Badge>}
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Community Templates</h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Discover polished templates, preview real pages, and remix the strongest ideas into your own projects.
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:w-[420px]">
                        <Metric icon={<Grid3X3 className="size-4" />} label="Results" value={templates.length} />
                        <Metric icon={<TrendingUp className="size-4" />} label="Remixes" value={totalRemixes} />
                        <Metric icon={<Star className="size-4" />} label="Rating" value={averageRating.toFixed(1)} />
                    </div>
                </div>

                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search by name, category, or tag"
                        className="h-11 pl-9"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-2">
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
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger size="sm" className="w-full sm:w-[190px]">
                            <Tags className="size-4" />
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Categories</SelectItem>
                            {categories.map((item) => (
                                <SelectItem key={item} value={item}>
                                    {item}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={sort} onValueChange={setSort}>
                        <SelectTrigger size="sm" className="w-full sm:w-[190px]">
                            <ArrowDownUp className="size-4" />
                            <SelectValue placeholder="Sort" />
                        </SelectTrigger>
                        <SelectContent>
                            {sortOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
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

            {!isLoading && templates.length === 0 && (
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

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {templates.map((template) => (
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

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
    return (
        <div className="rounded-lg border bg-background px-3 py-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {icon}
                {label}
            </div>
            <div className="mt-1 text-lg font-semibold">{value}</div>
        </div>
    );
}
