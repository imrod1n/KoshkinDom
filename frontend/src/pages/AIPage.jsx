import { useEffect, useState } from 'react';
import client from '../api/client';

export default function AIPage() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [faq, setFaq] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    client.get('/ai/faq/').then(({ data }) => setFaq(data));
    client.get('/ai/history/').then(({ data }) => {
      const list = data.results ?? data;
      // ensure oldest -> newest order
      setMessages(Array.isArray(list) ? list.slice().reverse() : list);
    }).catch(() => {});
  }, []);

  const ask = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    try {
      const { data } = await client.post('/ai/ask/', { question });
      // append newest at the end
      setMessages((m) => [...m, data]);
      setQuestion('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row">
      <div className="col-lg-8 d-flex flex-column" style={{ height: '80vh' }}>
        <div>
          <h1 className="h3 mb-3">ИИ-помощник по уходу и здоровью</h1>
          <p className="text-muted small">Отвечает на частые вопросы по базе знаний. Не заменяет консультацию ветеринара.</p>
        </div>

        <div className="flex-grow-1 overflow-auto mb-3" style={{ paddingBottom: 80 }}>
          {messages.length === 0 && (
            <div className="text-muted">Пока нет диалогов. Задайте вопрос внизу.</div>
          )}
          {messages.map((m, idx) => (
            <div key={m.id ?? idx} className={`d-flex mb-3 ${m.from === 'assistant' ? '' : 'justify-content-end'}`}>
              <div style={{ maxWidth: '75%' }}>
                <div className={`p-3 rounded ${m.from === 'assistant' ? 'bg-light' : 'bg-primary text-white'}`}>
                  {m.from !== 'assistant' && <div className="small text-muted mb-1">Вы</div>}
                  <div>{m.from === 'assistant' ? m.answer : m.question}</div>
                  {m.from === 'assistant' && <div className="small text-success mt-2">Помощник</div>}
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

      <div className="col-lg-4">
        <h2 className="h6">Популярные темы</h2>
        <ul className="list-group list-group-flush">
          {faq.map((f, i) => (
            <li className="list-group-item small" key={i}>
              <strong>{f.topic}</strong>
              <br />
              {f.preview}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
