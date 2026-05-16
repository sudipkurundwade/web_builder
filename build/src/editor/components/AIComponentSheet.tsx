import { useEffect, useMemo, useState } from "react";
import type { Editor } from "grapesjs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendChatMessage } from "@/services/aiService";
import type { ChatMessage } from "@/services/aiService";
import { useTheme } from "next-themes";
import { sanitizeHtml } from "@/editor/lib/sanitizeHtml";

interface AIComponentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editor: Editor | null;
  initialHtml: string;
  initialMessages: ChatMessage[];
}

export function AIComponentSheet({
  open,
  onOpenChange,
  editor,
  initialHtml,
  initialMessages,
}: AIComponentSheetProps) {
  const [previewHtml, setPreviewHtml] = useState(() => sanitizeHtml(initialHtml));
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [editPrompt, setEditPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setPreviewHtml(sanitizeHtml(initialHtml));
    setMessages(initialMessages);
    setError(null);
  }, [initialHtml, initialMessages]);

  const previewDocument = useMemo(() => {
    const isDark = resolvedTheme === "dark";
    const safeHtml = sanitizeHtml(previewHtml);

    return `<!DOCTYPE html>
<html class="${isDark ? "dark" : ""}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 20px;
      background: ${isDark ? "#09090b" : "#f4f4f5"};
      min-height: 100vh;
      display: flex;
      align-items: flex-start;
      justify-content: center;
    }
    .preview-shell {
      width: 100%;
      max-width: 980px;
      background: ${isDark ? "#18181b" : "#ffffff"};
      border: 1px solid ${isDark ? "#27272a" : "#e4e4e7"};
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }
    .preview-shell > * {
      width: 100%;
    }
  </style>
</head>
<body>
<div class="preview-shell">${safeHtml}</div>
</body>
</html>`;
  }, [previewHtml, resolvedTheme]);

  const handleEdit = async () => {
    if (!editPrompt.trim() || isLoading) return;

    const contextMessage: ChatMessage = {
      role: "user",
      content: `Here is the current HTML of the component I want to edit:\n\`\`\`html\n${previewHtml}\n\`\`\`\n\nInstruction: ${editPrompt}`,
    };

    const newMessages = [...messages, contextMessage];
    setMessages(newMessages);
    setEditPrompt("");
    setIsLoading(true);
    setError(null);

    try {
      const reply = await sendChatMessage(newMessages);

      const htmlMatch = reply.match(/```html\n([\s\S]*?)```/);
      if (htmlMatch) {
        setPreviewHtml(sanitizeHtml(htmlMatch[1].trim()));
      }

      const assistantMessage: ChatMessage = { role: "assistant", content: reply };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to get AI response");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCanvas = () => {
    if (!editor || !previewHtml) return;
    editor.addComponents(sanitizeHtml(previewHtml));
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleEdit();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="top-12 h-[calc(100vh-3rem)] w-[480px] sm:w-[540px] flex flex-col p-0 gap-0 bg-background border-border z-[120]"
      >
        <SheetHeader className="px-4 py-3 border-b border-border shrink-0">
          <SheetTitle className="text-foreground text-sm font-medium">
            AI Component Preview
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Refine your component, then drag it to the canvas
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-hidden border-b border-border min-h-0">
          <iframe
            className="w-full h-full"
            title="Component Preview"
            sandbox=""
            srcDoc={previewDocument}
          />
        </div>

        <div className="shrink-0 p-4 flex flex-col gap-3 bg-background">
          {error && (
            <div className="text-xs text-destructive bg-destructive/10 border border-destructive rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <Textarea
            value={editPrompt}
            onChange={(e) => setEditPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Describe a change... e.g. "make the button gradient blue-purple" or "add a second pricing tier"'
            className="resize-none bg-muted border-input text-foreground text-sm placeholder:text-muted-foreground min-h-[80px] focus-visible:ring-1 focus-visible:ring-ring"
            disabled={isLoading}
          />

          <div className="flex gap-2">
            <Button
              onClick={handleEdit}
              disabled={!editPrompt.trim() || isLoading}
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
                  Updating...
                </span>
              ) : (
                "Apply Edit  ⌘↵"
              )}
            </Button>

            <Button
              onClick={handleAddToCanvas}
              disabled={!previewHtml || !editor}
              size="sm"
              className="flex-1 text-xs font-semibold"
            >
              Add to Canvas →
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            {messages.length > 1
              ? `${Math.floor((messages.length - 1) / 2)} edit${Math.floor((messages.length - 1) / 2) !== 1 ? "s" : ""} made`
              : "No edits yet"}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
