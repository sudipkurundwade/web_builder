import { useState } from "react";
import { ExternalLink, Eye, Heart, Loader2, MessageCircle, Star, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
        <Card className="flex h-full overflow-hidden transition-shadow hover:shadow-md">
            {showOwnerHeader && (
                <div className="flex items-center justify-between gap-3 border-b bg-muted/20 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="size-9">
                            <AvatarImage src={owner?.avatarUrl || ""} alt={owner?.name || "Creator"} />
                            <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                                {(owner?.name || "U").charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
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
                                <span>{ownerStats.templateCount || 0} templates</span>
                                <span>{ownerStats.followersCount || 0} followers</span>
                            </div>
                        </div>
                    </div>
                    {owner?._id && onFollowOwner && (
                        <Button
                            type="button"
                            variant={ownerStats.followedByMe ? "secondary" : "outline"}
                            size="sm"
                            className="h-8 gap-1.5 text-xs"
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

            <Link
                to={`/templates/${template._id}`}
                className="group/preview relative block h-52 overflow-hidden border-b bg-muted outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                aria-label={`Open ${template.name} details`}
            >
                <iframe
                    title={`${template.name} preview`}
                    srcDoc={previewTemplateDocument(template)}
                    sandbox="allow-scripts"
                    className="pointer-events-none h-full w-full bg-white transition-transform duration-300 group-hover/preview:scale-[1.02]"
                />
                <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="bg-background/95 shadow-sm">
                        {template.category || "Website"}
                    </Badge>
                    {(template.ratingAverage || 0) > 0 && (
                        <Badge variant="secondary" className="gap-1 bg-background/95 shadow-sm">
                            <Star className="size-3 fill-current" />
                            {(template.ratingAverage || 0).toFixed(1)}
                        </Badge>
                    )}
                </div>
                <div className="pointer-events-none absolute inset-0 flex items-end justify-end bg-gradient-to-t from-black/55 via-black/0 to-transparent p-3 opacity-0 transition-opacity group-hover/preview:opacity-100 group-focus-visible/preview:opacity-100">
                    <span className="inline-flex items-center gap-1 rounded-md bg-background/95 px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm">
                        <Eye className="size-3.5" />
                        View details
                    </span>
                </div>
            </Link>

            <CardHeader className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                    <CardTitle className="line-clamp-1 text-base">
                        <Link to={`/templates/${template._id}`} className="hover:underline">
                            {template.name}
                        </Link>
                    </CardTitle>
                    <div className="inline-flex shrink-0 items-center gap-1 rounded-md border bg-muted/20 px-2 py-1 text-xs text-muted-foreground">
                        <Star className="size-3 fill-current" />
                        {(template.ratingAverage || 0).toFixed(1)}
                    </div>
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                    {template.description || "A community website design ready to remix."}
                </p>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-4">
                <div className="grid grid-cols-3 gap-2 rounded-md border bg-muted/20 p-2 text-center text-xs">
                    <div>
                        <div className="font-semibold">{template.remixCount || 0}</div>
                        <div className="text-muted-foreground">Remixes</div>
                    </div>
                    <div>
                        <div className="font-semibold">{template.likesCount || 0}</div>
                        <div className="text-muted-foreground">Likes</div>
                    </div>
                    <div>
                        <div className="font-semibold">{template.reviewsCount || 0}</div>
                        <div className="text-muted-foreground">Reviews</div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                    {(template.tags || []).slice(0, 4).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px]">
                            {tag}
                        </Badge>
                    ))}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="rounded-md">
                        {template.commentsCount || 0} comments
                    </Badge>
                    <Badge variant="outline" className="rounded-md">
                        {ownerStats.projectCount || 0} creator projects
                    </Badge>
                </div>

                {error && (
                    <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                        {error}
                    </div>
                )}

                <div className="mt-auto space-y-2">
                    <Button
                        type="button"
                        className="w-full"
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
                    <div className="grid grid-cols-4 gap-2">
                        <SaveTemplateDialog templateId={template._id} triggerClassName="w-full px-2" compact />
                        <Button
                            type="button"
                            variant={template.likedByMe ? "default" : "outline"}
                            size="sm"
                            onClick={() => void handleLike()}
                            disabled={likingTemplateId === template._id}
                            aria-label="Like template"
                        >
                            {likingTemplateId === template._id ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Heart className="size-4" />
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsCommentOpen((current) => !current)}
                            aria-label="Comment on template"
                        >
                            <MessageCircle className="size-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={!template.liveUrl}
                            onClick={() => template.liveUrl && window.open(template.liveUrl, "_blank", "noopener,noreferrer")}
                            aria-label="View published site"
                        >
                            <Eye className="size-4" />
                        </Button>
                    </div>
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
