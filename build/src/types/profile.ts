import type { CommunityTemplate } from "@/types/template";

export interface PublicProfile {
    _id: string;
    name: string;
    email?: string;
    bio?: string;
    avatarUrl?: string;
    location?: string;
    socialLinks?: {
        github?: string;
        linkedin?: string;
        website?: string;
    };
    createdAt?: string;
    stats: {
        projectCount: number;
        templateCount: number;
        followersCount: number;
        followingCount: number;
        followedByMe: boolean;
    };
    featuredTemplateIds?: string[];
    featuredTemplates: CommunityTemplate[];
    templates: CommunityTemplate[];
}

export interface UpdateProfileInput {
    name?: string;
    bio?: string;
    avatarUrl?: string;
    location?: string;
    socialLinks?: {
        github?: string;
        linkedin?: string;
        website?: string;
    };
}
