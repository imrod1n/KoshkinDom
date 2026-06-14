import { useEffect, useRef, useCallback } from 'react';

const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:7000';

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
