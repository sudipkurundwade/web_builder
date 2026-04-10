import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useGrapesEditor } from "@/editor/context/EditorContext";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

export function AIChatSidebar() {
    const { } = useGrapesEditor();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: "Hello! I'm your AI design assistant. How can I help you build your website today?",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        // Simulated AI response
        setTimeout(() => {
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "I'm currently connected as a UI placeholder. In the next update, I'll be able to directly modify your canvas components based on your requests!",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botMsg]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <aside className="group relative flex w-[320px] shrink-0 flex-col border-l bg-background/50 backdrop-blur-xl transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/20">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm">
                        <Sparkles className="size-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold leading-none">AI Assistant</h3>
                        <p className="text-[10px] text-muted-foreground mt-1">Harness the power of AI</p>
                    </div>
                </div>
                <Badge variant="outline" className="text-[9px] h-4 px-1.5 bg-indigo-500/10 text-indigo-600 border-indigo-200">
                    Pro
                </Badge>
            </div>

            {/* Chat Area */}
            <ScrollArea className="flex-1 px-4 py-4">
                <div className="flex flex-col gap-4">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"}`}
                        >
                            <div className="flex items-center gap-2">
                                {msg.role === "assistant" && (
                                    <Avatar className="size-6 border">
                                        <AvatarImage src="" />
                                        <AvatarFallback className="bg-indigo-50 text-[10px] text-indigo-600">AI</AvatarFallback>
                                    </Avatar>
                                )}
                                <span className="text-[10px] text-muted-foreground font-medium">
                                    {msg.role === "assistant" ? "Assistant" : "You"}
                                </span>
                            </div>
                            <div
                                className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs shadow-sm ${
                                    msg.role === "user"
                                        ? "bg-primary text-primary-foreground rounded-tr-none"
                                        : "bg-muted/80 text-foreground rounded-tl-none border"
                                }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex flex-col gap-2 items-start animate-pulse">
                            <div className="flex items-center gap-2">
                                <Avatar className="size-6 border">
                                    <AvatarFallback className="bg-indigo-50 text-[10px] text-indigo-600">AI</AvatarFallback>
                                </Avatar>
                                <span className="text-[10px] text-muted-foreground font-medium">Assistant thinking...</span>
                            </div>
                            <div className="h-8 w-16 bg-muted/50 rounded-2xl rounded-tl-none border" />
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Suggestions */}
            <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t bg-muted/5">
                <button className="text-[10px] px-2 py-1 rounded-full border bg-background hover:bg-muted transition-colors text-muted-foreground">
                    "Add a hero section"
                </button>
                <button className="text-[10px] px-2 py-1 rounded-full border bg-background hover:bg-muted transition-colors text-muted-foreground">
                    "Change theme to dark"
                </button>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-background/80 border-t">
                <div className="relative flex items-center">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Type a command..."
                        className="pr-10 h-10 text-xs focus-visible:ring-indigo-500 rounded-xl"
                    />
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleSend}
                        className="absolute right-1 size-8 rounded-lg hover:bg-indigo-50 hover:text-indigo-600"
                    >
                        <Send className="size-4" />
                    </Button>
                </div>
                <div className="mt-2 flex items-center justify-between text-[9px] text-muted-foreground px-1">
                    <span>Powered by Gemini 1.5 Pro</span>
                    <span className="flex items-center gap-1 hover:text-foreground cursor-pointer">
                        <Eraser className="size-3" /> Clear Chat
                    </span>
                </div>
            </div>
        </aside>
    );
}
