// src/components/dashboard/AddMemberModal.tsx
import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addTeamMember } from "@/lib/firestore";

export default function AddMemberModal() {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreate = async () => {
        if (!name.trim()) {
            setError("Name is required");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await addTeamMember({ 
                name: name.trim(), 
                role: role.trim() || undefined 
            });
            setOpen(false);
            setName("");
            setRole("");
        } catch (e) {
            setError("Failed to add member");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Add Member</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                    <DialogDescription>Enter member details.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
                    <Input placeholder="Role (optional)" value={role} onChange={(e) => setRole(e.target.value)} disabled={loading} />
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
