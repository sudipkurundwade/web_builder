import api from "@/lib/api";

export type PageBlock = {
    _id: string;
    label: string;
    category: string;
    tags?: string[];
    html: string;
};

export async function fetchPageBlocks(): Promise<PageBlock[]> {
    const response = await api.get<{ data: Record<string, PageBlock[]> }>("/blocks/page");
    return Object.values(response.data.data).flat();
}
