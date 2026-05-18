import api from "@/lib/api";
import type { PublicProfile, UpdateProfileInput } from "@/types/profile";

export async function getPublicProfile(userId: string): Promise<PublicProfile> {
    const response = await api.get<{ data: PublicProfile }>(`/profiles/${userId}`);
    return response.data.data;
}

export async function updateMyProfile(input: UpdateProfileInput): Promise<PublicProfile> {
    const response = await api.put<{ data: PublicProfile }>("/profiles/me", input);
    return response.data.data;
}

export async function updateFeaturedTemplates(templateIds: string[]): Promise<PublicProfile> {
    const response = await api.put<{ data: PublicProfile }>("/profiles/me/featured-templates", { templateIds });
    return response.data.data;
}

export async function toggleFollowProfile(userId: string): Promise<{
    followedByMe: boolean;
    followersCount: number;
}> {
    const response = await api.post<{ data: { followedByMe: boolean; followersCount: number } }>(`/profiles/${userId}/follow`);
    return response.data.data;
}
