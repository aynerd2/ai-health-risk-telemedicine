"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, SectionHeader } from "@/components/ui/Card";
import { api } from "@/lib/api";

interface ChatMessage {
  sender: string;
  message: string;
}

export function ChatPanel({ apptId, self }: { apptId: number; self: "patient" | "doctor" }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = new WebSocket(api.consultationSocketUrl(apptId, self));
    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data) as ChatMessage;
      setMessages((prev) => [...prev, data]);
    };
    socketRef.current = socket;
    return () => socket.close();
  }, [apptId, self]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function sendMessage() {
    if (!draft.trim() || !socketRef.current) return;
    socketRef.current.send(draft);
    setDraft("");
  }

  return (
    <Card padded={false} className="flex h-full min-h-[420px] flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
        <SectionHeader>Chat</SectionHeader>
        <span className="flex items-center gap-1.5 text-xs text-neutral-400">
          <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-success-500" : "bg-neutral-300"}`} />
          {connected ? "Connected" : "Connecting..."}
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto px-5 py-4">
        {messages.length === 0 && (
          <p className="mt-8 text-center text-xs text-neutral-400">No messages yet — say hello.</p>
        )}
        <AnimatePresence initial={false}>
          {messages.map((m, i) => {
            const mine = m.sender === self;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                    mine ? "rounded-br-sm bg-primary-700 text-white" : "rounded-bl-sm bg-neutral-100 text-neutral-800"
                  }`}
                >
                  {!mine && <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide opacity-60">{m.sender}</p>}
                  {m.message}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="flex gap-2 border-t border-neutral-100 p-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600/30"
        />
        <Button onClick={sendMessage} size="md">
          Send
        </Button>
      </div>
    </Card>
  );
}
