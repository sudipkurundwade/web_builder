/**
 * Sidebar
 * -------
 * Tabbed left rail with:
 *  - Blocks catalog
 *  - Layers (component tree)
 *  - Pages manager
 */

import { FileStack, Layers, LayoutGrid, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BlocksPanel } from "@/editor/components/BlocksPanel";
import { LayersPanel } from "@/editor/components/LayersPanel";
import { PagesPanel } from "@/editor/components/PagesPanel";
import { TemplateRemixPanel } from "@/editor/components/TemplateRemixPanel";

interface SidebarProps {
    onTemplateRemixPersist?: () => Promise<void>;
}

export function Sidebar({ onTemplateRemixPersist }: SidebarProps) {
    return (
        <aside className="flex w-64 shrink-0 flex-col border-r bg-sidebar">
            <Tabs defaultValue="blocks" className="flex min-h-0 flex-1 flex-col gap-0">
                <div className="shrink-0 border-b p-1 h-15">
                    <TabsList className="grid h-auto w-full grid-cols-4 gap-1 bg-transparent">
                        <TabsTrigger value="blocks" className="flex-col gap-1 py-2 text-[10px]">
                            <LayoutGrid className="size-4" />
                            Blocks
                        </TabsTrigger>
                        <TabsTrigger value="layers" className="flex-col gap-1 py-2 text-[10px]">
                            <Layers className="size-4" />
                            Layers
                        </TabsTrigger>
                        <TabsTrigger value="pages" className="flex-col gap-1 py-2 text-[10px]">
                            <FileStack className="size-4" />
                            Pages
                        </TabsTrigger>
                        <TabsTrigger value="remix" className="flex-col gap-1 py-2 text-[10px]">
                            <Sparkles className="size-4" />
                            Remix
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent
                    value="blocks"
                    className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden data-[state=inactive]:hidden"
                >
                    <BlocksPanel />
                </TabsContent>

                <TabsContent
                    value="layers"
                    className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden data-[state=inactive]:hidden"
                >
                    <ScrollArea className="min-h-0 flex-1">
                        <LayersPanel />
                    </ScrollArea>
                </TabsContent>

                <TabsContent
                    value="pages"
                    className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden data-[state=inactive]:hidden"
                >
                    <ScrollArea className="min-h-0 flex-1">
                        <PagesPanel />
                    </ScrollArea>
                </TabsContent>

                <TabsContent
                    value="remix"
                    className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden data-[state=inactive]:hidden"
                >
                    <TemplateRemixPanel onPersist={onTemplateRemixPersist} />
                </TabsContent>
            </Tabs>
        </aside>
    );
}
