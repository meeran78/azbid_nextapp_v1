"use client";

import { useCallback, useRef, useState } from "react";
import { MessageCircle, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/components/lib/utils";

type Role = "user" | "assistant";

export type ChatMessage = {
  role: Role;
  content: string;
};

function parseOpenAIStream(
  body: ReadableStream<Uint8Array>,
  onDelta: (text: string) => void
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  return (async () => {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          const data = trimmed.slice(6);
          if (data === "[DONE]") continue;
          try {
            const json = JSON.parse(data) as {
              choices?: { delta?: { content?: string } }[];
            };
            const piece = json.choices?.[0]?.delta?.content;
            if (piece) onDelta(piece);
          } catch {
            // ignore malformed chunks
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  })();
}

export function AiChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const scrollToEnd = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setError(null);
    const userMsg: ChatMessage = { role: "user", content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? "Request failed");
      }

      if (!res.body) {
        throw new Error("No response body");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      await parseOpenAIStream(res.body, (piece) => {
        setMessages((prev) => {
          if (prev.length === 0) return prev;
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last?.role === "assistant") {
            copy[copy.length - 1] = {
              ...last,
              content: last.content + piece,
            };
          }
          return copy;
        });
        requestAnimationFrame(scrollToEnd);
      });
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Something went wrong. Try again.";
      setError(msg);
      setMessages((prev) => {
        if (prev.length && prev[prev.length - 1].role === "assistant") {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setLoading(false);
      scrollToEnd();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open AzBid assistant chat"
          className={cn(
            "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full",
            "bg-primary text-primary-foreground shadow-lg transition hover:opacity-95",
            "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none"
          )}
        >
          <MessageCircle className="size-7" aria-hidden />
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex h-full max-h-[100dvh] w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-border px-4 py-4 text-left">
          <SheetTitle>AzBid Assistant</SheetTitle>
          <SheetDescription>
            Ask about bidding, stores, lots, and how AzBid works.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1 overflow-hidden px-4">
          <div className="flex flex-col gap-3 py-4 pr-3">
            {messages.length === 0 && (
              <p className="text-muted-foreground text-sm leading-relaxed">
                Hi — I can help you navigate auctions, understand how bidding
                works, and point you to the right place in the app. What would
                you like to know?
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[90%] rounded-lg px-3 py-2 text-sm leading-relaxed break-words",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground ml-auto"
                    : "bg-muted text-foreground mr-auto"
                )}
              >
                {m.content || (loading && i === messages.length - 1 ? "…" : "")}
              </div>
            ))}
            {loading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Spinner className="size-4" />
                Thinking…
              </div>
            )}
            <div ref={endRef} />
          </div>
        </ScrollArea>

        {error && (
          <p className="text-destructive px-4 text-sm" role="alert">
            {error}
          </p>
        )}

        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask a question…"
              rows={2}
              disabled={loading}
              className="min-h-[72px] resize-none"
            />
            <Button
              type="button"
              size="icon"
              className="h-[72px] w-11 shrink-0"
              onClick={() => void send()}
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              {loading ? (
                <Spinner className="size-5 text-primary-foreground" />
              ) : (
                <Send className="size-5" />
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
