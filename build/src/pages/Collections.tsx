import { useEffect, useState } from "react";
import { Bookmark, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CommunityTemplateCard } from "@/components/templates/CommunityTemplateCard";
import { createCollection, getCollections } from "@/services/collectionService";
import type { TemplateCollection } from "@/types/collection";
import type { CommunityTemplate } from "@/types/template";

export default function Collections() {
    const [collections, setCollections] = useState<TemplateCollection[]>([]);
    const [newCollectionName, setNewCollectionName] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);
        setError(null);

        getCollections()
            .then((data) => {
                if (!cancelled) setCollections(data);
            })
            .catch((err: any) => {
                if (!cancelled) setError(err?.response?.data?.message || "Could not load collections.");
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const handleCreateCollection = async () => {
        if (!newCollectionName.trim()) return;

        setIsCreating(true);
        setError(null);
        try {
            const collection = await createCollection({ name: newCollectionName });
            setCollections((current) => [collection, ...current]);
            setNewCollectionName("");
        } catch (err: any) {
            setError(err?.response?.data?.message || "Could not create collection.");
        } finally {
            setIsCreating(false);
        }
    };

    const patchTemplate = (templateId: string, patch: Partial<CommunityTemplate>) => {
        setCollections((current) => current.map((collection) => ({
            ...collection,
            templates: collection.templates.map((template) => (
                template._id === templateId ? { ...template, ...patch } : template
            )),
        })));
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Collections</h1>
                    <p className="text-sm text-muted-foreground">
                        Save templates into focused groups for upcoming websites and client ideas.
                    </p>
                </div>
                <div className="flex w-full gap-2 md:w-[420px]">
                    <Input
                        value={newCollectionName}
                        onChange={(event) => setNewCollectionName(event.target.value)}
                        placeholder="New collection name"
                    />
                    <Button
                        type="button"
                        onClick={() => void handleCreateCollection()}
                        disabled={isCreating || !newCollectionName.trim()}
                    >
                        {isCreating ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Plus className="mr-2 size-4" />}
                        Create
                    </Button>
                </div>
            </div>

            {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            {isLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Loading collections...
                </div>
            )}

            {!isLoading && !collections.length && (
                <div className="rounded-lg border border-dashed p-8 text-center">
                    <Bookmark className="mx-auto mb-3 size-8 text-muted-foreground" />
                    <p className="font-medium">No collections yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Create a collection, then save templates from the community library.
                    </p>
                </div>
            )}

            <div className="space-y-5">
                {collections.map((collection) => (
                    <Card key={collection._id}>
                        <CardHeader>
                            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                                <CardTitle className="text-lg">{collection.name}</CardTitle>
                                <span className="text-sm text-muted-foreground">
                                    {collection.templateCount || collection.templates.length} templates
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {collection.templates.length ? (
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {collection.templates.map((template) => (
                                        <CommunityTemplateCard
                                            key={template._id}
                                            template={template}
                                            onTemplateChange={patchTemplate}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                                    No templates saved here yet.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
