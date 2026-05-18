import api from "@/lib/api";
import type { CreateCollectionInput, TemplateCollection } from "@/types/collection";

export async function getCollections(): Promise<TemplateCollection[]> {
    const response = await api.get<{ data: TemplateCollection[] }>("/collections");
    return response.data.data;
}

export async function createCollection(input: CreateCollectionInput): Promise<TemplateCollection> {
    const response = await api.post<{ data: TemplateCollection }>("/collections", input);
    return response.data.data;
}

export async function addTemplateToCollection(
    collectionId: string,
    templateId: string,
): Promise<TemplateCollection> {
    const response = await api.post<{ data: TemplateCollection }>(`/collections/${collectionId}/templates/${templateId}`);
    return response.data.data;
}

export async function removeTemplateFromCollection(
    collectionId: string,
    templateId: string,
): Promise<TemplateCollection> {
    const response = await api.delete<{ data: TemplateCollection }>(`/collections/${collectionId}/templates/${templateId}`);
    return response.data.data;
}
