// src/components/dashboard/NotesSection.tsx
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useUserNotes } from "@/lib/firestore";
import NewNoteModal from "./NewNoteModal";

export default function NotesSection() {
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState<any[]>([]);

    useEffect(() => {
        const unsubscribe = useUserNotes((data) => {
            setNotes(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <Card className="space-y-4">
            <CardHeader>
                <CardTitle>My Notes</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <p className="text-muted-foreground">Loading...</p>
                ) : notes.length === 0 ? (
                    <p className="text-muted-foreground">No notes yet.</p>
                ) : (
                    <div className="grid gap-2">
                        {notes.map((note) => (
                            <div key={note.id} className="p-3 border rounded">
                                <h3 className="font-medium">{note.title}</h3>
                                {note.content && <p className="text-sm text-muted-foreground">{note.content}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <NewNoteModal />
            </CardFooter>
        </Card>
    );
}
