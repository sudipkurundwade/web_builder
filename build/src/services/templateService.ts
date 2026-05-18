import api from "@/lib/api";
import type { Project } from "@/types/project";
import type { CommunityTemplate, ShareTemplateInput } from "@/types/template";

export async function shareProjectAsTemplate(
    projectId: string,
    input: ShareTemplateInput,
): Promise<CommunityTemplate> {
    const response = await api.post<{ data: CommunityTemplate }>(`/templates/from-project/${projectId}`, input);
    return response.data.data;
}

export async function getCommunityTemplates(params?: {
    q?: string;
    category?: string;
    following?: boolean;
}): Promise<CommunityTemplate[]> {
    const response = await api.get<{ data: CommunityTemplate[] }>("/templates", { params });
    return response.data.data;
}

export async function getCommunityTemplate(templateId: string): Promise<CommunityTemplate> {
    const response = await api.get<{ data: CommunityTemplate }>(`/templates/${templateId}`);
    return response.data.data;
}

export async function useCommunityTemplate(templateId: string): Promise<Project> {
    const response = await api.post<{ data: Project }>(`/templates/${templateId}/use`);
    return response.data.data;
}

export async function toggleTemplateLike(templateId: string): Promise<{
    likedByMe: boolean;
    likesCount: number;
}> {
    const response = await api.post<{ data: { likedByMe: boolean; likesCount: number } }>(`/templates/${templateId}/like`);
    return response.data.data;
}

export async function addTemplateComment(templateId: string, text: string): Promise<{
    comment: CommunityTemplate["comments"] extends Array<infer T> ? T : never;
    commentsCount: number;
}> {
    const response = await api.post<{ data: { comment: CommunityTemplate["comments"] extends Array<infer T> ? T : never; commentsCount: number } }>(
        `/templates/${templateId}/comments`,
        { text },
    );
    return response.data.data;
}

export async function addTemplateReview(templateId: string, input: {
    rating: number;
    text?: string;
}): Promise<{
    review: CommunityTemplate["reviews"] extends Array<infer T> ? T : never;
    reviews: CommunityTemplate["reviews"];
    reviewsCount: number;
    ratingAverage: number;
    reviewedByMe: boolean;
    myRating: number | null;
}> {
    const response = await api.post<{ data: {
        review: CommunityTemplate["reviews"] extends Array<infer T> ? T : never;
        reviews: CommunityTemplate["reviews"];
        reviewsCount: number;
        ratingAverage: number;
        reviewedByMe: boolean;
        myRating: number | null;
    } }>(`/templates/${templateId}/reviews`, input);
    return response.data.data;
}

export async function toggleFollowCreator(userId: string): Promise<{
    followedByMe: boolean;
    followersCount: number;
}> {
    const response = await api.post<{ data: { followedByMe: boolean; followersCount: number } }>(`/templates/creators/${userId}/follow`);
    return response.data.data;
}
