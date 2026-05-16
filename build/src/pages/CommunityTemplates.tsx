import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Eye, Heart, Loader2, MessageCircle, Search, Sparkles, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    addTemplateComment,
    getCommunityTemplates,
    toggleFollowCreator,
    toggleTemplateLike,
    useCommunityTemplate,
} from "@/services/templateService";
import type { CommunityTemplate } from "@/types/template";

function previewDocument(template: CommunityTemplate) {
    const html = template.previewHtml || template.pages?.[0]?.html || template.html || "";
    const css = template.previewCss || template.pages?.[0]?.css || template.css || "";

    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; font-family: Inter, system-ui, sans-serif; overflow: hidden; background: #fff; }
    body { transform: scale(.52); transform-origin: top left; width: 192%; }
    .preview-root { padding: 20px; }
    ${css}
  </style>
</head>
<body>
  <div class="preview-root">${html}</div>
</body>
</html>`;
}

export default function CommunityTemplates() {
    const [templates, setTemplates] = useState<CommunityTemplate[]>([]);
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("All");
    const [isLoading, setIsLoading] = useState(true);
    const [usingTemplateId, setUsingTemplateId] = useState<string | null>(null);
    const [likingTemplateId, setLikingTemplateId] = useState<string | null>(null);
    const [followingUserId, setFollowingUserId] = useState<string | null>(null);
    const [commentingTemplateId, setCommentingTemplateId] = useState<string | null>(null);
    const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
    const [commentText, setCommentText] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);
        setError(null);

        getCommunityTemplates()
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
    }, []);

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

    const handleUseTemplate = async (templateId: string) => {
        setUsingTemplateId(templateId);
        setError(null);
        try {
            const project = await useCommunityTemplate(templateId);
            window.open(`/editor/${project._id}`, "_blank", "noopener,noreferrer");
        } catch (err: any) {
            setError(err?.response?.data?.message || "Could not create project from this template.");
        } finally {
            setUsingTemplateId(null);
        }
    };

    const patchTemplate = (templateId: string, patch: Partial<CommunityTemplate>) => {
        setTemplates((current) => current.map((template) => (
            template._id === templateId ? { ...template, ...patch } : template
        )));
    };

    const handleLike = async (templateId: string) => {
        setLikingTemplateId(templateId);
        setError(null);
        try {
            const result = await toggleTemplateLike(templateId);
            patchTemplate(templateId, result);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Could not update like.");
        } finally {
            setLikingTemplateId(null);
        }
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
            }));
        } catch (err: any) {
            setError(err?.response?.data?.message || "Could not update follow.");
        } finally {
            setFollowingUserId(null);
        }
    };

    const handleAddComment = async (templateId: string) => {
        if (!commentText.trim()) return;

        setCommentingTemplateId(templateId);
        setError(null);
        try {
            const result = await addTemplateComment(templateId, commentText);
            setTemplates((current) => current.map((template) => {
                if (template._id !== templateId) return template;
                return {
                    ...template,
                    commentsCount: result.commentsCount,
                    comments: [...(template.comments || []), result.comment],
                };
            }));
            setCommentText("");
        } catch (err: any) {
            setError(err?.response?.data?.message || "Could not add comment.");
        } finally {
            setCommentingTemplateId(null);
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
                    <p className="font-medium">No community templates yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Publish a project and share it as a template to seed the library.
                    </p>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredTemplates.map((template) => (
                    <Card key={template._id} className="overflow-hidden">
                        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                    {(template.owner?.name || "U").charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">
                                        {template.owner?.name || "Community Creator"}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                                        <span>Shared this design</span>
                                        <span>{template.ownerStats?.projectCount || 0} projects</span>
                                        <span>{template.ownerStats?.followersCount || 0} followers</span>
                                    </div>
                                </div>
                            </div>
                            {template.owner?._id && (
                                <Button
                                    type="button"
                                    variant={template.ownerStats?.followedByMe ? "secondary" : "outline"}
                                    size="sm"
                                    className="h-7 gap-1.5 text-xs"
                                    onClick={() => void handleFollow(template)}
                                    disabled={followingUserId === template.owner._id}
                                >
                                    {followingUserId === template.owner._id ? (
                                        <Loader2 className="size-3.5 animate-spin" />
                                    ) : (
                                        <UserPlus className="size-3.5" />
                                    )}
                                    {template.ownerStats?.followedByMe ? "Following" : "Follow"}
                                </Button>
                            )}
                        </div>
                        <div className="h-48 overflow-hidden border-b bg-muted">
                            <iframe
                                title={`${template.name} preview`}
                                srcDoc={previewDocument(template)}
                                sandbox="allow-scripts"
                                className="h-full w-full pointer-events-none bg-white"
                            />
                        </div>
                        <CardHeader className="space-y-2">
                            <div className="flex items-start justify-between gap-3">
                                <CardTitle className="line-clamp-1 text-base">{template.name}</CardTitle>
                                <Badge variant="secondary">{template.category || "Website"}</Badge>
                            </div>
                            <p className="line-clamp-2 text-sm text-muted-foreground">
                                {template.description || "A community website design ready to remix."}
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-2 rounded-md border bg-muted/20 p-2 text-center text-xs">
                                <div>
                                    <div className="font-semibold">{template.ownerStats?.templateCount || 0}</div>
                                    <div className="text-muted-foreground">Templates</div>
                                </div>
                                <div>
                                    <div className="font-semibold">{template.ownerStats?.projectCount || 0}</div>
                                    <div className="text-muted-foreground">Projects</div>
                                </div>
                                <div>
                                    <div className="font-semibold">{template.ownerStats?.followersCount || 0}</div>
                                    <div className="text-muted-foreground">Followers</div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {(template.tags || []).slice(0, 4).map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-[10px]">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span>{template.remixCount || 0} remixes</span>
                                    <span>{template.likesCount || 0} likes</span>
                                    <span>{template.commentsCount || 0} comments</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    type="button"
                                    variant={template.likedByMe ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => void handleLike(template._id)}
                                    disabled={likingTemplateId === template._id}
                                >
                                    {likingTemplateId === template._id ? (
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                    ) : (
                                        <Heart className="mr-2 size-4" />
                                    )}
                                    Like
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setActiveCommentId((current) => current === template._id ? null : template._id)}
                                >
                                    <MessageCircle className="mr-2 size-4" />
                                    Comment
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={!template.liveUrl}
                                    onClick={() => template.liveUrl && window.open(template.liveUrl, "_blank", "noopener,noreferrer")}
                                >
                                    <Eye className="mr-2 size-4" />
                                    View
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => void handleUseTemplate(template._id)}
                                    disabled={usingTemplateId === template._id}
                                >
                                    {usingTemplateId === template._id ? (
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                    ) : (
                                        <ExternalLink className="mr-2 size-4" />
                                    )}
                                    Use Template
                                </Button>
                            </div>
                            {activeCommentId === template._id && (
                                <div className="space-y-2 rounded-md border bg-muted/20 p-2">
                                    <Input
                                        value={commentText}
                                        onChange={(event) => setCommentText(event.target.value)}
                                        placeholder="Write a comment"
                                        className="h-8 text-sm"
                                    />
                                    <div className="flex justify-end">
                                        <Button
                                            type="button"
                                            size="sm"
                                            disabled={commentingTemplateId === template._id || !commentText.trim()}
                                            onClick={() => void handleAddComment(template._id)}
                                        >
                                            {commentingTemplateId === template._id && (
                                                <Loader2 className="mr-2 size-4 animate-spin" />
                                            )}
                                            Post
                                        </Button>
                                    </div>
                                    {(template.comments || []).slice(-2).map((comment, index) => (
                                        <div key={comment._id || index} className="rounded-md bg-background px-3 py-2 text-xs">
                                            <span className="font-medium">{comment.user?.name || "User"}: </span>
                                            <span className="text-muted-foreground">{comment.text}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
