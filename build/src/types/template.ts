export interface CommunityTemplate {
    _id: string;
    name: string;
    description?: string;
    category: string;
    tags: string[];
    owner?: {
        _id: string;
        name?: string;
        email?: string;
        bio?: string;
        avatarUrl?: string;
    };
    liveUrl?: string | null;
    sourceProject: string;
    html?: string;
    css?: string;
    pages?: { id: string; name: string; html: string; css: string }[];
    remixSettings?: Record<string, unknown> | null;
    previewHtml?: string;
    previewCss?: string;
    remixCount: number;
    likesCount?: number;
    likedByMe?: boolean;
    commentsCount?: number;
    reviewsCount?: number;
    ratingAverage?: number;
    reviewedByMe?: boolean;
    myRating?: number | null;
    ownerStats?: {
        projectCount: number;
        templateCount: number;
        followersCount: number;
        followingCount: number;
        followedByMe: boolean;
    };
    comments?: {
        _id?: string;
        text: string;
        createdAt: string;
        user?: {
            _id: string;
            name?: string;
            email?: string;
            avatarUrl?: string;
        };
    }[];
    reviews?: {
        _id?: string;
        rating: number;
        text?: string;
        createdAt: string;
        updatedAt?: string;
        user?: {
            _id: string;
            name?: string;
            email?: string;
            avatarUrl?: string;
        };
    }[];
    createdAt: string;
    updatedAt: string;
}

export interface ShareTemplateInput {
    name: string;
    description?: string;
    category?: string;
    tags?: string[];
}
