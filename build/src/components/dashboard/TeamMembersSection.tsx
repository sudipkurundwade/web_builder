// src/components/dashboard/TeamMembersSection.tsx
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useUserTeamMembers } from "@/lib/firestore";
import AddMemberModal from "./AddMemberModal";

export default function TeamMembersSection() {
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState<any[]>([]);

    useEffect(() => {
        const unsubscribe = useUserTeamMembers((data) => {
            setMembers(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <Card className="space-y-4">
            <CardHeader>
                <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <p className="text-muted-foreground">Loading...</p>
                ) : members.length === 0 ? (
                    <p className="text-muted-foreground">No team members yet.</p>
                ) : (
                    <ul className="space-y-2">
                        {members.map((m) => (
                            <li key={m.id} className="p-2 border rounded">
                                <div className="font-medium">{m.name}</div>
                                {m.role && <div className="text-sm text-muted-foreground">{m.role}</div>}
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
            <CardFooter>
                <AddMemberModal />
            </CardFooter>
        </Card>
    );
}
