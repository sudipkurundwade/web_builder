import { useEffect, useRef, useState } from "react";
import { Eraser, Send, Sparkles, ChevronDown } from "lucide-react";
import type { Editor } from "grapesjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { sendChatMessage } from "@/services/aiService";
import type { ChatMessage } from "@/services/aiService";
import { AIComponentSheet } from "./AIComponentSheet";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    hasPreviewCard?: boolean;
}

interface AIChatSidebarProps {
    editor: Editor | null;
}

function stripHtmlBlocks(content: string): string {
    return content.replace(/```html\n[\s\S]*?```/g, "").trim();
}

export function AIChatSidebar({ editor }: AIChatSidebarProps) {
    const initialAssistantMessage: Message = {
        id: "1",
        role: "assistant",
        content:
            "Hello! I'm your AI design assistant. How can I help you build your website today?",
        timestamp: new Date(),
    };

    const [messages, setMessages] = useState<Message[]>([
        initialAssistantMessage,
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [showScrollBottom, setShowScrollBottom] = useState(false);
    const [selectedComponentType, setSelectedComponentType] = useState<string | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [sheetHtml, setSheetHtml] = useState("");
    const [sheetMessages, setSheetMessages] = useState<ChatMessage[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const quickPrompts = [
        "Add a hero section with CTA",
        "Improve mobile spacing",
        "Switch theme to dark mode",
    ];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    useEffect(() => {
        if (!editor) return;

        const onSelected = () => {
            const selected = editor.getSelected();
            if (!selected) {
                setSelectedComponentType(null);
                return;
            }
            setSelectedComponentType(selected.get("type") || "component");
        };

        const onDeselected = () => {
            setSelectedComponentType(null);
        };

        editor.on("component:selected", onSelected);
        editor.on("component:deselected", onDeselected);
        onSelected();

        return () => {
            editor.off("component:selected", onSelected);
            editor.off("component:deselected", onDeselected);
        };
    }, [editor]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50;
        setShowScrollBottom(!isAtBottom);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        setShowScrollBottom(false);
    };

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;
        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
            timestamp: new Date(),
        };

        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput("");
        setIsTyping(true);

        try {
            const chatHistory: ChatMessage[] = newMessages.map(m => ({
                role: m.role,
                content: m.content
            }));
            
            const replyText = await sendChatMessage(chatHistory);
            const htmlMatch = replyText.match(/```html\n([\s\S]*?)```/);

            if (htmlMatch) {
                const parsedHtml = htmlMatch[1].trim();
                const assistantPayload: ChatMessage = { role: "assistant", content: replyText };
                const nonCodeReply = stripHtmlBlocks(replyText);

                setSheetHtml(parsedHtml);
                setSheetMessages([...chatHistory, assistantPayload]);
                setSheetOpen(true);

                const botMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: nonCodeReply,
                    timestamp: new Date(),
                    hasPreviewCard: true,
                };
                setMessages((prev) => [...prev, botMsg]);
            } else {
                const botMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: replyText,
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, botMsg]);
            }
        } catch (error: any) {
            console.error("AI Error:", error);
            const backendMessage = error.response?.data?.message;
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: backendMessage || "I'm sorry, I encountered an error connecting to my servers. Please check your connection or API key and try again.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleQuickPrompt = (prompt: string) => {
        setInput(prompt);
    };

    const clearChat = () => {
        setMessages([
            {
                ...initialAssistantMessage,
                id: Date.now().toString(),
                timestamp: new Date(),
            },
        ]);
    };

    return (
        <>
        <aside className="group relative flex w-[340px] h-full shrink-0 flex-col border-l border-border/40 bg-transparent backdrop-blur-xl transition-all duration-300 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/40 bg-background/10 px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-violet-500/90 to-indigo-500/90 shadow-md shadow-violet-500/20">
                        <Sparkles className="size-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold leading-none">
                            AI Assistant
                        </h3>
                        <p className="mt-1 text-[10px] text-muted-foreground">
                            Ask, generate, refine
                        </p>
                    </div>
                </div>
                <Badge
                    variant="outline"
                    className="h-5 border-violet-300/40 bg-violet-500/10 px-1.5 text-[9px] text-violet-600"
                >
                    Beta
                </Badge>
            </div>

            {/* Chat Area */}
            <div className="relative flex-1 min-h-0">
                <ScrollArea 
                    ref={scrollAreaRef}
                    onScroll={handleScroll}
                    className="h-full px-4 py-4 scrollbar-thin scrollbar-thumb-border/40 scrollbar-track-transparent hover:scrollbar-thumb-border/60"
                >
                    <div className="flex flex-col gap-4 max-h-full">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex flex-col gap-2",
                                msg.role === "user" ? "items-end" : "items-start",
                            )}
                        >
                            <div className="flex items-center gap-2">
                                {msg.role === "assistant" && (
                                    <Avatar className="size-6 border border-border/60 bg-background/30">
                                        <AvatarImage src="" />
                                        <AvatarFallback className="bg-violet-500/10 text-[10px] text-violet-700">
                                            AI
                                        </AvatarFallback>
                                    </Avatar>
                                )}
                                <span className="text-[10px] font-medium text-muted-foreground">
                                    {msg.role === "assistant" ? "Assistant" : "You"}
                                </span>
                                <span className="text-[10px] text-muted-foreground/70">
                                    {msg.timestamp.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            </div>
                            <div
                                className={cn(
                                    "max-w-[90%] rounded-2xl px-3 py-2 text-xs shadow-sm backdrop-blur-sm",
                                    msg.role === "user"
                                        ? "rounded-tr-none bg-primary/95 text-primary-foreground"
                                        : "rounded-tl-none border border-border/50 bg-background/40 text-foreground",
                                )}
                            >
                                <div className="space-y-2">
                                    {msg.content && (
                                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                    )}
                                    {msg.hasPreviewCard && (
                                        <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-3 mt-2 flex items-center justify-between">
                                            <span className="text-xs text-zinc-300">Component ready to preview</span>
                                            <button
                                                onClick={() => setSheetOpen(true)}
                                                className="text-xs bg-white text-black rounded px-2 py-1 font-medium hover:bg-zinc-200"
                                            >
                                                Open Preview →
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="animate-pulse items-start gap-2">
                            <div className="flex items-center gap-2">
                                <Avatar className="size-6 border border-border/60 bg-background/30">
                                    <AvatarFallback className="bg-violet-500/10 text-[10px] text-violet-700">
                                        AI
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-[10px] font-medium text-muted-foreground">
                                    Assistant thinking...
                                </span>
                            </div>
                            <div className="h-8 w-16 rounded-2xl rounded-tl-none border border-border/50 bg-background/40" />
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>
                
                {/* Scroll to Bottom Button */}
                {showScrollBottom && (
                    <Button
                        onClick={scrollToBottom}
                        size="sm"
                        className="absolute bottom-4 right-4 h-8 w-8 rounded-full border-border/60 bg-background/80 shadow-lg backdrop-blur-sm hover:bg-background/90"
                    >
                        <ChevronDown className="size-4" />
                    </Button>
                )}
            </div>

            {/* Suggestions */}
            <div className="flex flex-wrap gap-1.5 border-t border-border/40 bg-background/5 px-4 py-2">
                {quickPrompts.map((prompt) => (
                    <Button
                        key={prompt}
                        variant="outline"
                        size="sm"
                        className="h-6 rounded-full border-border/60 bg-background/20 px-2 text-[10px] text-muted-foreground hover:bg-background/40"
                        onClick={() => handleQuickPrompt(prompt)}
                    >
                        {prompt}
                    </Button>
                ))}
            </div>

            {/* Input Area */}
            <div className="border-t border-border/40 bg-background/10 p-4">
                <div className="mb-2">
                    {selectedComponentType ? (
                        <div className="inline-flex items-center rounded-full border border-amber-300/50 bg-amber-500/15 px-2.5 py-1 text-[10px] text-amber-700">
                            {`✏ Editing: ${selectedComponentType} - your prompt will modify this component`}
                        </div>
                    ) : (
                        <div className="text-[10px] text-muted-foreground">
                            Select a component on canvas to edit it with AI
                        </div>
                    )}
                </div>
                <div className="relative flex items-center">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Describe what you want to build..."
                        className="h-10 rounded-xl border-border/60 bg-background/30 pr-10 text-xs focus-visible:ring-violet-500"
                    />
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        className="absolute right-1 size-8 rounded-lg hover:bg-violet-500/10 hover:text-violet-600 disabled:opacity-50"
                    >
                        <Send className="size-4" />
                    </Button>
                </div>
                <Separator className="my-2 bg-border/40" />
                <div className="mt-2 flex items-center justify-between px-1 text-[9px] text-muted-foreground">
                    <span>AI actions are currently in preview</span>
                    <button
                        type="button"
                        onClick={clearChat}
                        className="flex items-center gap-1 transition-colors hover:text-foreground"
                    >
                        <Eraser className="size-3" /> Clear chat
                    </button>
                </div>
            </div>
        </aside>
        <AIComponentSheet
            open={sheetOpen}
            onOpenChange={setSheetOpen}
            editor={editor}
            initialHtml={sheetHtml}
            initialMessages={sheetMessages}
        />
        </>
    );
}
