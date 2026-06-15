import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import client from '../api/client';
import { useChatWebSocket } from '../hooks/useChatWebSocket';

export default function MessagesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const initialOpenDone = useRef(false);

  const loadConversations = useCallback(() => {
    return client.get('/messaging/conversations/').then(({ data }) => {
      const list = data.results ?? data;
      setConversations(list);
      return list;
    });
  }, []);

  const appendMessage = useCallback((msg) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }, []);

  const { sendMessage } = useChatWebSocket(active?.id, appendMessage);

  const openChat = useCallback(async (conv) => {
    setActive(conv);
    const { data } = await client.get(`/messaging/conversations/${conv.id}/messages/`);
    setMessages(data.results ?? data);
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const list = await loadConversations();
      if (cancelled || initialOpenDone.current) return;

      const convId = searchParams.get('conversation');
      let conv = null;

      if (convId) {
        conv = list.find((c) => String(c.id) === convId);
        if (!conv) {
          try {
            const { data } = await client.get(`/messaging/conversations/${convId}/`);
            conv = data;
          } catch {
            conv = null;
          }
        }
        if (conv) setSearchParams({}, { replace: true });
      } else if (list.length > 0) {
        conv = list[0];
      }

      if (conv) {
        initialOpenDone.current = true;
        await openChat(conv);
      }
    })();

    return () => { cancelled = true; };
  }, [loadConversations, openChat, searchParams, setSearchParams]);

  const send = async (e) => {
    e.preventDefault();
    if ((!text.trim() && !image) || !active) return;

    const body = text.trim();

    // If there's an image, send it via FormData
    if (image) {
      const form = new FormData();
      if (body) form.append('text', body);
      form.append('image', image);

      setText('');
      setImage(null);
      setImagePreview(null);

      const { data } = await client.post(
        `/messaging/conversations/${active.id}/messages/`,
        form,
      );
      appendMessage(data);
      return;
    }

    // Text only
    setText('');

    if (sendMessage(body)) return;

    const { data } = await client.post(
      `/messaging/conversations/${active.id}/messages/`,
      { text: body },
    );
    appendMessage(data);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImage(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const chatTitle = (c) => {
    if (c.is_group && c.title) return c.title;
    return c.participants?.map((p) => p.username).join(', ') || `Чат #${c.id}`;
  };

  return (
    <div className="row" style={{ minHeight: 400 }}>
      <div className="col-md-4 border-end">
        <h1 className="h5 mb-3">Чаты</h1>
        <ul className="list-group list-group-flush">
          {conversations.map((c) => (
            <button
              type="button"
              key={c.id}
              className={`list-group-item list-group-item-action ${active?.id === c.id ? 'active' : ''}`}
              onClick={() => openChat(c)}
            >
              {c.is_group && <span className="me-1">👥</span>}
              {chatTitle(c)}
              {c.unread_count > 0 && (
                <span className="badge bg-danger float-end">{c.unread_count}</span>
              )}
            </button>
          ))}
        </ul>
      </div>
      <div className="col-md-8 d-flex flex-column">
        {active ? (
          <>
            <strong className="mb-2">{chatTitle(active)}</strong>
            <div className="flex-grow-1 overflow-auto mb-3 border rounded p-2" style={{ maxHeight: 320 }}>
              {messages.map((m) => (
                <div key={m.id} className={`mb-3 ${m.is_read ? '' : 'fw-semibold'}`}>
                  <small className="text-muted">@{m.sender.username}</small>
                  {m.image && (
                    <div className="mt-1 mb-2">
                      <img src={m.image} alt="message" style={{ maxWidth: '100%', maxHeight: 200 }} className="rounded" />
                    </div>
                  )}
                  {m.text && <div>{m.text}</div>}
                </div>
              ))}
            </div>
            {imagePreview && (
              <div className="mb-2">
                <img src={imagePreview} alt="preview" style={{ maxWidth: '100%', maxHeight: 120 }} className="rounded me-2" />
                <button type="button" className="btn btn-sm btn-outline-danger" onClick={clearImage}>
                  Удалить
                </button>
              </div>
            )}
            <form onSubmit={send} className="input-group">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => fileInputRef.current?.click()}
                title="Прикрепить картинку"
              >
                🖼️
              </button>
              <input
                className="form-control"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Сообщение..."
              />
              <button className="btn btn-primary" type="submit" disabled={!text.trim() && !image}>Отправить</button>
            </form>
          </>
        ) : (
          <p className="text-muted mt-4">Нет доступных диалогов</p>
        )}
      </div>
    </div>
  );
}
