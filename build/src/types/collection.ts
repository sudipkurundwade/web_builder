import type { CommunityTemplate } from "@/types/template";

export interface TemplateCollection {
    _id: string;
    name: string;
    description?: string;
    owner: string;
    templates: CommunityTemplate[];
    templateCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCollectionInput {
    name: string;
    description?: string;
}
