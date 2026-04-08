// src/components/dashboard/AddFileModal.tsx
import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addFile } from "@/lib/firestore";

export default function AddFileModal({ folders }: { folders: any[] }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [size, setSize] = useState("");
    const [folderId, setFolderId] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreate = async () => {
        if (!name.trim() || !size.trim()) {
            setError("Name and size are required");
            return;
        }
        const sizeNum = Number(size);
        if (isNaN(sizeNum) || sizeNum < 0) {
            setError("Size must be a positive number");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await addFile(name.trim(), sizeNum, folderId || undefined);
            setOpen(false);
            setName("");
            setSize("");
            setFolderId("");
        } catch (e) {
            setError("Failed to add file");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Add File</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New File</DialogTitle>
                    <DialogDescription>Provide a name, size (KB), and optional folder.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Input placeholder="File name" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
                    <Input placeholder="Size (KB)" value={size} onChange={(e) => setSize(e.target.value)} disabled={loading} />
                    {folders.length > 0 && (
                        <select
                            className="border rounded p-2"
                            value={folderId}
                            onChange={(e) => setFolderId(e.target.value)}
                            disabled={loading}
                        >
                            <option value="">No folder</option>
                            {folders.map((f) => (
                                <option key={f.id} value={f.id}>
                                    {f.name}
                                </option>
                            ))}
                        </select>
                    )}
                    {error && <p className="text-sm text-red-500">{error}</p>}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={loading}>Create</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
