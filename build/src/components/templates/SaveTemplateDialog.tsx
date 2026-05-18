import { useEffect, useMemo, useState } from "react";
import { Bookmark, Check, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    addTemplateToCollection,
    createCollection,
    getCollections,
    removeTemplateFromCollection,
} from "@/services/collectionService";
import type { TemplateCollection } from "@/types/collection";

interface SaveTemplateDialogProps {
    templateId: string;
    triggerClassName?: string;
}

export function SaveTemplateDialog({ templateId, triggerClassName }: SaveTemplateDialogProps) {
    const [open, setOpen] = useState(false);
    const [collections, setCollections] = useState<TemplateCollection[]>([]);
    const [newCollectionName, setNewCollectionName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [savingCollectionId, setSavingCollectionId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;

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
    }, [open]);

    const savedCollectionIds = useMemo(() => {
        return new Set(
            collections
                .filter((collection) => collection.templates.some((template) => template._id === templateId))
                .map((collection) => collection._id),
        );
    }, [collections, templateId]);

    const handleCreateCollection = async () => {
        if (!newCollectionName.trim()) return;

        setIsCreating(true);
        setError(null);
        try {
            const collection = await createCollection({ name: newCollectionName });
            const savedCollection = await addTemplateToCollection(collection._id, templateId);
            setCollections((current) => [savedCollection, ...current]);
            setNewCollectionName("");
        } catch (err: any) {
            setError(err?.response?.data?.message || "Could not create collection.");
        } finally {
            setIsCreating(false);
        }
    };

    const handleToggleCollection = async (collection: TemplateCollection) => {
        const isSaved = savedCollectionIds.has(collection._id);
        setSavingCollectionId(collection._id);
        setError(null);
        try {
            const updated = isSaved
                ? await removeTemplateFromCollection(collection._id, templateId)
                : await addTemplateToCollection(collection._id, templateId);
            setCollections((current) => current.map((item) => item._id === updated._id ? updated : item));
        } catch (err: any) {
            setError(err?.response?.data?.message || "Could not update collection.");
        } finally {
            setSavingCollectionId(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm" className={triggerClassName}>
                    <Bookmark className="mr-2 size-4" />
                    Save
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Save to Collection</DialogTitle>
                    <DialogDescription>
                        Group templates into reusable collections for future projects.
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {error}
                    </div>
                )}

                <div className="space-y-3">
                    <div className="flex gap-2">
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

                    <div className="max-h-72 space-y-2 overflow-auto">
                        {isLoading && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="size-4 animate-spin" />
                                Loading collections...
                            </div>
                        )}

                        {!isLoading && collections.map((collection) => {
                            const isSaved = savedCollectionIds.has(collection._id);
                            return (
                                <button
                                    key={collection._id}
                                    type="button"
                                    onClick={() => void handleToggleCollection(collection)}
                                    disabled={savingCollectionId === collection._id}
                                    className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm hover:bg-muted/50 disabled:opacity-60"
                                >
                                    <span>
                                        <span className="block font-medium">{collection.name}</span>
                                        <span className="text-xs text-muted-foreground">{collection.templateCount || 0} templates</span>
                                    </span>
                                    {savingCollectionId === collection._id ? (
                                        <Loader2 className="size-4 animate-spin text-muted-foreground" />
                                    ) : isSaved ? (
                                        <Check className="size-4 text-primary" />
                                    ) : (
                                        <Plus className="size-4 text-muted-foreground" />
                                    )}
                                </button>
                            );
                        })}

                        {!isLoading && !collections.length && (
                            <div className="rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">
                                Create your first collection above.
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter showCloseButton />
            </DialogContent>
        </Dialog>
    );
}
