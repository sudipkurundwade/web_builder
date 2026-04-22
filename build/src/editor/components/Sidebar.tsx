/**
 * Sidebar
 * -------
 * Tabbed left rail with:
 *  - Blocks catalog
 *  - Layers (component tree)
 *  - Pages manager
 */

import { LayoutGrid, Layers, FileStack } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BlocksPanel } from "@/editor/components/BlocksPanel";
import { LayersPanel } from "@/editor/components/LayersPanel";
import { PagesPanel } from "@/editor/components/PagesPanel";

export function Sidebar() {
    return (
        <aside className="flex w-56 shrink-0 flex-col border-r bg-sidebar">
            <Tabs defaultValue="blocks" className="flex min-h-0 flex-1 flex-col gap-0">
                <div className="shrink-0 border-b p-1.5">
                    <TabsList className="grid h-8 w-full grid-cols-3">
                        <TabsTrigger value="blocks" className="gap-1 text-xs">
                            <LayoutGrid className="size-3" />
                            Blocks
                        </TabsTrigger>
                        <TabsTrigger value="layers" className="gap-1 text-xs">
                            <Layers className="size-3" />
                            Layers
                        </TabsTrigger>
                        <TabsTrigger value="pages" className="gap-1 text-xs">
                            <FileStack className="size-3" />
                            Pages
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
            </Tabs>
        </aside>
    );
}
