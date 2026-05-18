import { useState } from "react";
import { ExternalLink, Eye, Heart, Loader2, MessageCircle, Star, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SaveTemplateDialog } from "@/components/templates/SaveTemplateDialog";
import {
    addTemplateComment,
    toggleTemplateLike,
    useCommunityTemplate,
} from "@/services/templateService";
import type { CommunityTemplate } from "@/types/template";

type TemplateOwner = NonNullable<CommunityTemplate["owner"]>;
type OwnerStats = NonNullable<CommunityTemplate["ownerStats"]>;

interface CommunityTemplateCardProps {
    template: CommunityTemplate;
    ownerFallback?: TemplateOwner;
    ownerStatsFallback?: Partial<OwnerStats>;
    showOwnerHeader?: boolean;
    onTemplateChange?: (templateId: string, patch: Partial<CommunityTemplate>) => void;
    onFollowOwner?: (template: CommunityTemplate) => Promise<void> | void;
    followingOwnerId?: string | null;
}

export function previewTemplateDocument(template: CommunityTemplate) {
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

export function CommunityTemplateCard({
    template,
    ownerFallback,
    ownerStatsFallback,
    showOwnerHeader = true,
    onTemplateChange,
    onFollowOwner,
    followingOwnerId,
}: CommunityTemplateCardProps) {
    const [usingTemplateId, setUsingTemplateId] = useState<string | null>(null);
    const [likingTemplateId, setLikingTemplateId] = useState<string | null>(null);
    const [commentingTemplateId, setCommentingTemplateId] = useState<string | null>(null);
    const [isCommentOpen, setIsCommentOpen] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [error, setError] = useState<string | null>(null);

    const owner = template.owner || ownerFallback;
    const ownerStats = {
        projectCount: 0,
        templateCount: 0,
        followersCount: 0,
        followingCount: 0,
        followedByMe: false,
        ...ownerStatsFallback,
        ...template.ownerStats,
    };

    const handleUseTemplate = async () => {
        setUsingTemplateId(template._id);
        setError(null);
        try {
            const project = await useCommunityTemplate(template._id);
            window.open(`/editor/${project._id}`, "_blank", "noopener,noreferrer");
        } catch (err: any) {
            setError(err?.response?.data?.message || "Could not create project from this template.");
        } finally {
            setUsingTemplateId(null);
        }
    };

    const handleLike = async () => {
        setLikingTemplateId(template._id);
        setError(null);
        try {
            const result = await toggleTemplateLike(template._id);
            onTemplateChange?.(template._id, result);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Could not update like.");
        } finally {
            setLikingTemplateId(null);
        }
    };

    const handleAddComment = async () => {
        if (!commentText.trim()) return;

        setCommentingTemplateId(template._id);
        setError(null);
        try {
            const result = await addTemplateComment(template._id, commentText);
            onTemplateChange?.(template._id, {
                commentsCount: result.commentsCount,
                comments: [...(template.comments || []), result.comment],
            });
            setCommentText("");
        } catch (err: any) {
            setError(err?.response?.data?.message || "Could not add comment.");
        } finally {
            setCommentingTemplateId(null);
        }
    };

    return (
        <Card className="overflow-hidden">
            {showOwnerHeader && (
                <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            {(owner?.name || "U").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            {owner?._id ? (
                                <Link to={`/users/${owner._id}`} className="truncate text-sm font-medium hover:underline">
                                    {owner.name || "Community Creator"}
                                </Link>
                            ) : (
                                <p className="truncate text-sm font-medium">
                                    {owner?.name || "Community Creator"}
                                </p>
                            )}
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                                <span>Shared this design</span>
                                <span>{ownerStats.projectCount || 0} projects</span>
                                <span>{ownerStats.followersCount || 0} followers</span>
                            </div>
                        </div>
                    </div>
                    {owner?._id && onFollowOwner && (
                        <Button
                            type="button"
                            variant={ownerStats.followedByMe ? "secondary" : "outline"}
                            size="sm"
                            className="h-7 gap-1.5 text-xs"
                            onClick={() => void onFollowOwner(template)}
                            disabled={followingOwnerId === owner._id}
                        >
                            {followingOwnerId === owner._id ? (
                                <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                                <UserPlus className="size-3.5" />
                            )}
                            {ownerStats.followedByMe ? "Following" : "Follow"}
                        </Button>
                    )}
                </div>
            )}

            <div className="h-48 overflow-hidden border-b bg-muted">
                <iframe
                    title={`${template.name} preview`}
                    srcDoc={previewTemplateDocument(template)}
                    sandbox="allow-scripts"
                    className="pointer-events-none h-full w-full bg-white"
                />
            </div>

            <CardHeader className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                    <CardTitle className="line-clamp-1 text-base">
                        <Link to={`/templates/${template._id}`} className="hover:underline">
                            {template.name}
                        </Link>
                    </CardTitle>
                    <Badge variant="secondary">{template.category || "Website"}</Badge>
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                    {template.description || "A community website design ready to remix."}
                </p>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2 rounded-md border bg-muted/20 p-2 text-center text-xs">
                    <div>
                        <div className="font-semibold">{ownerStats.templateCount || 0}</div>
                        <div className="text-muted-foreground">Templates</div>
                    </div>
                    <div>
                        <div className="font-semibold">{ownerStats.projectCount || 0}</div>
                        <div className="text-muted-foreground">Projects</div>
                    </div>
                    <div>
                        <div className="font-semibold">{ownerStats.followersCount || 0}</div>
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

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>{template.remixCount || 0} remixes</span>
                    <span>{template.likesCount || 0} likes</span>
                    <span>{template.commentsCount || 0} comments</span>
                    <span className="inline-flex items-center gap-1">
                        <Star className="size-3 fill-current" />
                        {(template.ratingAverage || 0).toFixed(1)} ({template.reviewsCount || 0})
                    </span>
                </div>

                {error && (
                    <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                    <SaveTemplateDialog templateId={template._id} triggerClassName="w-full" />
                    <Button
                        type="button"
                        variant={template.likedByMe ? "default" : "outline"}
                        size="sm"
                        onClick={() => void handleLike()}
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
                        onClick={() => setIsCommentOpen((current) => !current)}
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
                        onClick={() => void handleUseTemplate()}
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

                {isCommentOpen && (
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
                                onClick={() => void handleAddComment()}
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
    );
}
