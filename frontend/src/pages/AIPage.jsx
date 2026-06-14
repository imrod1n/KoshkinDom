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
      setMessages(data.results ?? data);
    }).catch(() => {});
  }, []);

  const ask = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    try {
      const { data } = await client.post('/ai/ask/', { question });
      setMessages((m) => [data, ...m]);
      setQuestion('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row">
      <div className="col-lg-8">
        <h1 className="h3 mb-3">ИИ-помощник по уходу и здоровью</h1>
        <p className="text-muted small">
          Отвечает на частые вопросы по базе знаний. Не заменяет консультацию ветеринара.
        </p>
        <form onSubmit={ask} className="mb-4">
          <textarea
            className="form-control mb-2"
            rows={3}
            placeholder="Например: когда делать прививки котёнку?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button className="btn btn-primary" disabled={loading}>
            {loading ? 'Думаю...' : 'Спросить'}
          </button>
        </form>
        {messages.map((m) => (
          <div className="card mb-2" key={m.id}>
            <div className="card-body">
              <p className="mb-1"><strong>Вы:</strong> {m.question}</p>
              <p className="mb-0 text-success"><strong>Помощник:</strong> {m.answer}</p>
            </div>
          </div>
        ))}
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
