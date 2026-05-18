import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Eye, Heart, Loader2, MessageCircle, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { previewTemplateDocument } from "@/components/templates/CommunityTemplateCard";
import { SaveTemplateDialog } from "@/components/templates/SaveTemplateDialog";
import {
    addTemplateComment,
    getCommunityTemplate,
    toggleFollowCreator,
    toggleTemplateLike,
    useCommunityTemplate,
} from "@/services/templateService";
import type { CommunityTemplate } from "@/types/template";

export default function TemplateDetail() {
    const { templateId } = useParams<{ templateId: string }>();
    const [template, setTemplate] = useState<CommunityTemplate | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [usingTemplate, setUsingTemplate] = useState(false);
    const [likingTemplate, setLikingTemplate] = useState(false);
    const [followingCreator, setFollowingCreator] = useState(false);
    const [postingComment, setPostingComment] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!templateId) return;

        let cancelled = false;
        setIsLoading(true);
        setError(null);

        getCommunityTemplate(templateId)
            .then((data) => {
                if (!cancelled) setTemplate(data);
            })
            .catch((err: any) => {
                if (!cancelled) setError(err?.response?.data?.message || "Could not load this template.");
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [templateId]);

    const patchTemplate = (patch: Partial<CommunityTemplate>) => {
        setTemplate((current) => current ? { ...current, ...patch } : current);
    };

    const handleUseTemplate = async () => {
        if (!template) return;

        setUsingTemplate(true);
        setError(null);
        try {
            const project = await useCommunityTemplate(template._id);
            window.open(`/editor/${project._id}`, "_blank", "noopener,noreferrer");
            patchTemplate({ remixCount: (template.remixCount || 0) + 1 });
        } catch (err: any) {
            setError(err?.response?.data?.message || "Could not create project from this template.");
        } finally {
            setUsingTemplate(false);
        }
    };

    const handleLike = async () => {
        if (!template) return;

        setLikingTemplate(true);
        setError(null);
        try {
            const result = await toggleTemplateLike(template._id);
            patchTemplate(result);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Could not update like.");
        } finally {
            setLikingTemplate(false);
        }
    };

    const handleFollow = async () => {
        const ownerId = template?.owner?._id;
        if (!template || !ownerId) return;

        setFollowingCreator(true);
        setError(null);
        try {
            const result = await toggleFollowCreator(ownerId);
            patchTemplate({
                ownerStats: {
                    projectCount: template.ownerStats?.projectCount || 0,
                    templateCount: template.ownerStats?.templateCount || 0,
                    followingCount: template.ownerStats?.followingCount || 0,
                    ...template.ownerStats,
                    followedByMe: result.followedByMe,
                    followersCount: result.followersCount,
                },
            });
        } catch (err: any) {
            setError(err?.response?.data?.message || "Could not update follow.");
        } finally {
            setFollowingCreator(false);
        }
    };

    const handleAddComment = async () => {
        if (!template || !commentText.trim()) return;

        setPostingComment(true);
        setError(null);
        try {
            const result = await addTemplateComment(template._id, commentText);
            patchTemplate({
                commentsCount: result.commentsCount,
                comments: [...(template.comments || []), result.comment],
            });
            setCommentText("");
        } catch (err: any) {
            setError(err?.response?.data?.message || "Could not add comment.");
        } finally {
            setPostingComment(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading template...
            </div>
        );
    }

    if (error && !template) {
        return <div className="p-6 text-sm text-destructive">{error}</div>;
    }

    if (!template) {
        return <div className="p-6 text-sm text-muted-foreground">Template not found.</div>;
    }

    const owner = template.owner;
    const ownerStats = template.ownerStats;

    return (
        <div className="flex flex-col gap-6 p-6">
            <Button type="button" variant="ghost" size="sm" className="w-fit" asChild>
                <Link to="/templates">
                    <ArrowLeft className="mr-2 size-4" />
                    Templates
                </Link>
            </Button>

            {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                <main className="space-y-5">
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">{template.category || "Website"}</Badge>
                            {(template.tags || []).slice(0, 6).map((tag) => (
                                <Badge key={tag} variant="outline">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">{template.name}</h1>
                                <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                                    {template.description || "A community website design ready to preview, discuss, and remix."}
                                </p>
                            </div>
                            <Button type="button" onClick={() => void handleUseTemplate()} disabled={usingTemplate} className="shrink-0">
                                {usingTemplate ? (
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                ) : (
                                    <ExternalLink className="mr-2 size-4" />
                                )}
                                Use Template
                            </Button>
                        </div>
                    </div>

                    <div className="h-[520px] overflow-hidden rounded-lg border bg-muted">
                        <iframe
                            title={`${template.name} full preview`}
                            srcDoc={previewTemplateDocument(template)}
                            sandbox="allow-scripts"
                            className="h-full w-full bg-white"
                        />
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <MessageCircle className="size-4" />
                                Comments
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    value={commentText}
                                    onChange={(event) => setCommentText(event.target.value)}
                                    placeholder="Write a comment"
                                />
                                <Button
                                    type="button"
                                    onClick={() => void handleAddComment()}
                                    disabled={postingComment || !commentText.trim()}
                                >
                                    {postingComment && <Loader2 className="mr-2 size-4 animate-spin" />}
                                    Post
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {(template.comments || []).map((comment, index) => (
                                    <div key={comment._id || index} className="rounded-md border bg-muted/20 px-3 py-2">
                                        <div className="text-sm font-medium">{comment.user?.name || "User"}</div>
                                        <p className="mt-1 text-sm text-muted-foreground">{comment.text}</p>
                                    </div>
                                ))}
                                {!template.comments?.length && (
                                    <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                                        No comments yet.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </main>

                <aside className="space-y-4">
                    <Card>
                        <CardContent className="space-y-4 p-5">
                            <div className="flex items-center gap-3">
                                <Avatar className="size-12">
                                    <AvatarImage src={owner?.avatarUrl || ""} alt={owner?.name || "Creator"} />
                                    <AvatarFallback>{(owner?.name || "U").charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    {owner?._id ? (
                                        <Link to={`/users/${owner._id}`} className="font-medium hover:underline">
                                            {owner.name || "Community Creator"}
                                        </Link>
                                    ) : (
                                        <p className="font-medium">{owner?.name || "Community Creator"}</p>
                                    )}
                                    <p className="truncate text-xs text-muted-foreground">{owner?.email || "Template creator"}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 rounded-md border bg-muted/20 p-2 text-center text-xs">
                                <div>
                                    <div className="font-semibold">{ownerStats?.templateCount || 0}</div>
                                    <div className="text-muted-foreground">Templates</div>
                                </div>
                                <div>
                                    <div className="font-semibold">{ownerStats?.projectCount || 0}</div>
                                    <div className="text-muted-foreground">Projects</div>
                                </div>
                                <div>
                                    <div className="font-semibold">{ownerStats?.followersCount || 0}</div>
                                    <div className="text-muted-foreground">Followers</div>
                                </div>
                            </div>

                            {owner?._id && (
                                <Button
                                    type="button"
                                    variant={ownerStats?.followedByMe ? "secondary" : "outline"}
                                    className="w-full"
                                    onClick={() => void handleFollow()}
                                    disabled={followingCreator}
                                >
                                    {followingCreator ? (
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                    ) : (
                                        <UserPlus className="mr-2 size-4" />
                                    )}
                                    {ownerStats?.followedByMe ? "Following" : "Follow Creator"}
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="space-y-3 p-5">
                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                <div className="rounded-md border bg-muted/20 p-3">
                                    <div className="font-semibold">{template.remixCount || 0}</div>
                                    <div className="text-muted-foreground">Remixes</div>
                                </div>
                                <div className="rounded-md border bg-muted/20 p-3">
                                    <div className="font-semibold">{template.likesCount || 0}</div>
                                    <div className="text-muted-foreground">Likes</div>
                                </div>
                                <div className="rounded-md border bg-muted/20 p-3">
                                    <div className="font-semibold">{template.commentsCount || 0}</div>
                                    <div className="text-muted-foreground">Comments</div>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant={template.likedByMe ? "default" : "outline"}
                                className="w-full"
                                onClick={() => void handleLike()}
                                disabled={likingTemplate}
                            >
                                {likingTemplate ? (
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                ) : (
                                    <Heart className="mr-2 size-4" />
                                )}
                                {template.likedByMe ? "Liked" : "Like"}
                            </Button>

                            <SaveTemplateDialog templateId={template._id} triggerClassName="w-full" />

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                disabled={!template.liveUrl}
                                onClick={() => template.liveUrl && window.open(template.liveUrl, "_blank", "noopener,noreferrer")}
                            >
                                <Eye className="mr-2 size-4" />
                                View Published Site
                            </Button>
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </div>
    );
}
