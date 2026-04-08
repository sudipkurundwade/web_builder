/**
 * RightSidebar
 * ------------
 * Tabbed right rail with:
 *  - Styles      (inline CSS via addStyle)
 *  - Traits      (component traits API)
 *  - Classes     (SelectorManager)
 *  - Assets      (AssetManager)
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Palette, SlidersHorizontal, Tags, Images } from "lucide-react";
import { StylePanel } from "@/editor/components/StylePanel";
import { TraitsPanel } from "@/editor/components/TraitsPanel";
import { SelectorPanel } from "@/editor/components/SelectorPanel";
import { AssetPanel } from "@/editor/components/AssetPanel";

export function RightSidebar() {
    return (
        <aside className="flex w-72 shrink-0 flex-col border-l bg-sidebar">
            <Tabs defaultValue="styles" className="flex min-h-0 flex-1 flex-col gap-0">
                <div className="shrink-0 border-b px-3">
                    <TabsList className="mt-1 grid h-8 w-full grid-cols-4">
                        <TabsTrigger value="styles" className="gap-1 text-[11px]">
                            <Palette className="size-3" />
                            Styles
                        </TabsTrigger>
                        <TabsTrigger value="traits" className="gap-1 text-[11px]">
                            <SlidersHorizontal className="size-3" />
                            Traits
                        </TabsTrigger>
                        <TabsTrigger value="classes" className="gap-1 text-[11px]">
                            <Tags className="size-3" />
                            Classes
                        </TabsTrigger>
                        <TabsTrigger value="assets" className="gap-1 text-[11px]">
                            <Images className="size-3" />
                            Assets
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent
                    value="styles"
                    className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden data-[state=inactive]:hidden"
                >
                    <ScrollArea className="min-h-0 flex-1">
                        <StylePanel />
                    </ScrollArea>
                </TabsContent>

                <TabsContent
                    value="traits"
                    className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden data-[state=inactive]:hidden"
                >
                    <ScrollArea className="min-h-0 flex-1">
                        <TraitsPanel />
                    </ScrollArea>
                </TabsContent>

                <TabsContent
                    value="classes"
                    className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden data-[state=inactive]:hidden"
                >
                    <ScrollArea className="min-h-0 flex-1">
                        <SelectorPanel />
                    </ScrollArea>
                </TabsContent>

                <TabsContent
                    value="assets"
                    className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden data-[state=inactive]:hidden"
                >
                    <ScrollArea className="min-h-0 flex-1">
                        <AssetPanel />
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </aside>
    );
}

