import { useEffect, useRef, useCallback } from 'react';

function getWebSocketBase() {
  const envUrl = import.meta.env.VITE_WS_URL?.trim();
  let base = envUrl || '';

  if (!base && typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    base = `${protocol}//${window.location.host}`;
  }

  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && base.startsWith('ws://')) {
    base = base.replace(/^ws:\/\//i, 'wss://');
  }

  if (!base) {
    base = 'ws://127.0.0.1:7000';
  }

  return base.replace(/\/+$/, '');
}

const WS_BASE = getWebSocketBase();

export function useChatWebSocket(conversationId, onMessage) {
  const wsRef = useRef(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const sendMessage = useCallback((text) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ text }));
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    if (!conversationId) return undefined;

    const token = localStorage.getItem('access_token');
    if (!token) return undefined;

    const ws = new WebSocket(`${WS_BASE}/ws/chat/${conversationId}/?token=${token}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        onMessageRef.current(JSON.parse(event.data));
      } catch {
        /* ignore */
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [conversationId]);

  return { sendMessage };
}
