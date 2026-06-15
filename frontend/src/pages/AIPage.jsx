import { useEffect, useState } from 'react';
import client from '../api/client';

export default function AIPage() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    client.get('/ai/history/').then(({ data }) => {
      const list = data.results ?? data;
      if (Array.isArray(list)) {
        const flat = list.slice().reverse().flatMap((r) => ([
          { id: `${r.id}-q`, role: 'user', text: r.question, raw: r },
          { id: `${r.id}-a`, role: 'assistant', text: r.answer, raw: r },
        ]));
        setMessages(flat);
      } else {
        setMessages([]);
      }
    }).catch(() => {});
  }, []);

  const ask = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    try {
      const { data } = await client.post('/ai/ask/', { question });
      setMessages((m) => [...m, { id: `${data.id}-q`, role: 'user', text: data.question, raw: data }, { id: `${data.id}-a`, role: 'assistant', text: data.answer, raw: data }]);
      setQuestion('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8 d-flex flex-column" style={{ height: '80vh' }}>
        <div>
          <h1 className="h3 mb-3">ИИ-помощник по уходу и здоровью</h1>
          <p className="text-muted small">Задавайте вопросы об уходе и здоровье ваших кошек.</p>
        </div>

        <div className="flex-grow-1 overflow-auto mb-3" style={{ paddingBottom: 80 }}>
          {messages.length === 0 && (
            <div className="text-muted">Пока нет диалогов. Задайте вопрос внизу.</div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`d-flex mb-3 ${m.role === 'assistant' ? '' : 'justify-content-end'}`}>
              <div style={{ maxWidth: '75%' }}>
                <div className={`p-3 rounded ${m.role === 'assistant' ? 'bg-light' : 'bg-primary text-white'}`}>
                  {m.role === 'user' && <div className="small text-muted mb-1 text-end">Вы</div>}
                  <div>{m.text}</div>
                  {m.role === 'assistant' && <div className="small text-success mt-2">Помощник</div>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={ask} className="position-sticky" style={{ bottom: 0 }}>
          <div className="d-flex justify-content-center">
            <div className="w-100" style={{ maxWidth: 720, padding: '0 12px 12px' }}>
              <div className="input-group">
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Например: когда делать прививки котёнку?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
                <button className="btn btn-primary" disabled={loading} type="submit">
                  {loading ? 'Думаю...' : 'Спросить'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}