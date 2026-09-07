"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

/**
 * Placeholder for a managed WebRTC provider's widget (Daily/Twilio/Agora).
 * The backend only relays chat over WebSocket — video is intentionally out
 * of scope for this build (see backend README).
 */
export function VideoPanel() {
  return (
    <Card padded={false} className="flex h-64 flex-col items-center justify-center gap-3 overflow-hidden bg-neutral-900 text-white">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.55-2.9A1 1 0 0121 8v8a1 1 0 01-1.45.9L15 14M5 6h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-white">Video call</p>
      <Button size="sm" variant="secondary" className="!bg-white/10 !text-white !border-white/20 hover:!bg-white/20">
        Start video call
      </Button>
    </Card>
  );
}
