// src/components/dashboard/NewNoteModal.tsx
import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addNote } from "@/lib/firestore";

export default function NewNoteModal() {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreate = async () => {
        if (!title.trim()) {
            setError("Title is required");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await addNote(title.trim(), content.trim() || undefined);
            setOpen(false);
            setTitle("");
            setContent("");
        } catch (e) {
            setError("Failed to create note");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">New Note</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Note</DialogTitle>
                    <DialogDescription>Provide a title and optional content.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Input
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={loading}
                    />
                    <textarea
                        className="border rounded p-2 w-full"
                        placeholder="Content (optional)"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={4}
                        disabled={loading}
                    />
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
