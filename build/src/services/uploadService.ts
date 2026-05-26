import api from "@/lib/api";

type UploadResponse = {
    data: string[];
};

export async function uploadImages(files: File[]): Promise<string[]> {
    const formData = new FormData();

    files.forEach((file) => {
        formData.append("files", file);
    });

    const response = await api.post<UploadResponse>("/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data.data;
}

export const uploadMedia = uploadImages;
