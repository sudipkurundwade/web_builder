// src/components/dashboard/FilesSection.tsx
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useUserFolders, useUserFiles } from "@/lib/firestore";
import NewFolderModal from "./NewFolderModal";
import AddFileModal from "./AddFileModal";

export default function FilesSection() {
    const [loading, setLoading] = useState(true);
    const [folders, setFolders] = useState<any[]>([]);
    const [files, setFiles] = useState<any[]>([]);

    // Subscribe to folders
    useEffect(() => {
        const unsubscribe = useUserFolders((data) => {
            setFolders(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Subscribe to files
    useEffect(() => {
        const unsubscribe = useUserFiles((data) => {
            setFiles(data);
        });
        return () => unsubscribe();
    }, []);

    return (
        <Card className="space-y-4">
            <CardHeader>
                <CardTitle>My Files</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <p className="text-muted-foreground">Loading...</p>
                ) : folders.length === 0 && files.length === 0 ? (
                    <p className="text-muted-foreground">No files or folders yet.</p>
                ) : (
                    <div className="grid gap-2">
                        {folders.map((f) => (
                            <div key={f.id} className="p-2 border rounded">
                                📁 {f.name}
                            </div>
                        ))}
                        {files.map((file) => (
                            <div key={file.id} className="p-2 border rounded">
                                📄 {file.name} ({file.size} KB)
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex space-x-2">
                <NewFolderModal />
                <AddFileModal folders={folders} />
            </CardFooter>
        </Card>
    );
}
