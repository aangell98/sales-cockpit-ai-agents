// =============================================================================
// Cliente del backend EN VIVO (FastAPI · Azure OpenAI).
// SSE por streaming con fetch + ReadableStream; WebSocket para el feed en vivo.
// =============================================================================

export const LIVE_API: string =
  (import.meta as any).env?.VITE_LIVE_API?.replace(/\/$/, '') || 'http://localhost:8000';

export const LIVE_WS: string = LIVE_API.replace(/^http/, 'ws');

export interface Health {
  status: string;
  mode: 'live' | 'mock';
  azure_connected: boolean;
  deployment: string | null;
  service: string;
}

export interface Citation { source: string; ref: string; }

export interface ClientLite {
  id: string;
  name: string;
  initials: string;
  segment: string;
  signals: string[];
  context: string;
}

export interface Nba {
  product: string;
  propensity: number;
  reason: string;
  signals_used: string[];
  best_channel: string;
  best_time: string;
  premium_eur: number;
  commission_eur: number;
  script: string;
}

export interface LiveSignal {
  id: string;
  client: string;
  signal: string;
  product: string;
  heat: 'hot' | 'warm' | 'cool';
  ts: number;
}

export async function getHealth(signal?: AbortSignal): Promise<Health> {
  const r = await fetch(`${LIVE_API}/api/health`, { signal });
  if (!r.ok) throw new Error(`health ${r.status}`);
  return r.json();
}

export async function getClients(): Promise<ClientLite[]> {
  const r = await fetch(`${LIVE_API}/api/clients`);
  if (!r.ok) throw new Error(`clients ${r.status}`);
  const data = await r.json();
  return data.clients as ClientLite[];
}

type SSEHandler = (ev: any) => void;

async function streamSSE(path: string, body: unknown, onEvent: SSEHandler, signal?: AbortSignal): Promise<void> {
  const res = await fetch(`${LIVE_API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let idx: number;
    while ((idx = buf.indexOf('\n\n')) !== -1) {
      const raw = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      const dataLine = raw.split('\n').find((l) => l.startsWith('data: '));
      if (!dataLine) continue;
      try {
        onEvent(JSON.parse(dataLine.slice(6)));
      } catch {
        /* ignora líneas mal formadas */
      }
    }
  }
}

// --- Copilot (Teams) ---------------------------------------------------------
export interface ChatCallbacks {
  onStart?: () => void;
  onFirstToken?: (latencyMs: number) => void;
  onToken?: (text: string) => void;
  onDone?: (info: { citations: Citation[]; followups: string[]; usage: any; mode: string }) => void;
  onEnd?: (elapsedMs: number) => void;
  onError?: (message: string) => void;
}

export function streamChat(
  question: string,
  history: { who: string; text: string }[] | undefined,
  cb: ChatCallbacks,
  signal?: AbortSignal,
): Promise<void> {
  return streamSSE('/api/copilot/chat', { question, history }, (ev) => {
    switch (ev.type) {
      case 'start': cb.onStart?.(); break;
      case 'first_token': cb.onFirstToken?.(ev.latency_ms); break;
      case 'token': cb.onToken?.(ev.text); break;
      case 'done': cb.onDone?.({ citations: ev.citations ?? [], followups: ev.followups ?? [], usage: ev.usage ?? {}, mode: ev.mode }); break;
      case 'end': cb.onEnd?.(ev.elapsed_ms); break;
      case 'error': cb.onError?.(ev.message); break;
    }
  }, signal);
}

// --- Next Best Action --------------------------------------------------------
export interface NbaCallbacks {
  onStart?: (client: { name: string; initials: string }) => void;
  onReasoning?: (text: string) => void;
  onDone?: (info: { nba: Nba; usage: any; mode: string }) => void;
  onEnd?: (elapsedMs: number) => void;
  onError?: (message: string) => void;
}

export function streamNba(clientId: string, cb: NbaCallbacks, signal?: AbortSignal): Promise<void> {
  return streamSSE('/api/nba/generate', { client_id: clientId }, (ev) => {
    switch (ev.type) {
      case 'start': cb.onStart?.(ev.client); break;
      case 'reasoning': cb.onReasoning?.(ev.text); break;
      case 'done': cb.onDone?.({ nba: ev.nba, usage: ev.usage ?? {}, mode: ev.mode }); break;
      case 'end': cb.onEnd?.(ev.elapsed_ms); break;
      case 'error': cb.onError?.(ev.message); break;
    }
  }, signal);
}

// --- Feed en vivo (WebSocket) ------------------------------------------------
export function connectLiveFeed(onSignal: (s: LiveSignal) => void, onStatus?: (open: boolean) => void): () => void {
  let ws: WebSocket | null = null;
  let closed = false;
  let retry: ReturnType<typeof setTimeout> | null = null;

  const open = () => {
    if (closed) return;
    try {
      ws = new WebSocket(`${LIVE_WS}/ws/live`);
    } catch {
      onStatus?.(false);
      retry = setTimeout(open, 3000);
      return;
    }
    ws.onopen = () => onStatus?.(true);
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'signal') onSignal(data as LiveSignal);
      } catch { /* ignore */ }
    };
    ws.onclose = () => {
      onStatus?.(false);
      if (!closed) retry = setTimeout(open, 3000);
    };
    ws.onerror = () => ws?.close();
  };
  open();

  return () => {
    closed = true;
    if (retry) clearTimeout(retry);
    ws?.close();
  };
}

// --- Hook de salud (poll) ----------------------------------------------------
import { useEffect, useState } from 'react';

export type LiveStatus = 'connecting' | 'online' | 'offline';

export function useHealth(): { health: Health | null; status: LiveStatus; online: boolean } {
  const [health, setHealth] = useState<Health | null>(null);
  const [status, setStatus] = useState<LiveStatus>('connecting');
  useEffect(() => {
    let active = true;
    let firstFailAt: number | null = null;
    const GRACE_MS = 25000; // ventana de "activando" antes de declarar offline
    const tick = async () => {
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), 8000);
      try {
        const h = await getHealth(ctrl.signal);
        clearTimeout(to);
        if (!active) return;
        setHealth(h);
        setStatus('online');
        firstFailAt = null;
      } catch {
        clearTimeout(to);
        if (!active) return;
        setStatus((prev) => {
          if (prev === 'online') { firstFailAt = Date.now(); return 'connecting'; }
          if (firstFailAt == null) firstFailAt = Date.now();
          return Date.now() - firstFailAt > GRACE_MS ? 'offline' : 'connecting';
        });
      }
    };
    tick();
    const id = setInterval(tick, 3000);
    return () => { active = false; clearInterval(id); };
  }, []);
  return { health, status, online: status === 'online' };
}
