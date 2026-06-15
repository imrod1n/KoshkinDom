import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ForumPage() {
  const { user } = useAuth();
  const [topics, setTopics] = useState([]);
  const [expertOnly, setExpertOnly] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', is_expert_question: false });

  const load = () => {
    const params = expertOnly ? { expert: '1' } : {};
    client.get('/forum/topics/', { params }).then(({ data }) => {
      setTopics(data.results ?? data);
    });
  };

  useEffect(() => {
    load();
  }, [expertOnly]);

  const createTopic = async (e) => {
    e.preventDefault();
    await client.post('/forum/topics/', form);
    setForm({ title: '', body: '', is_expert_question: false });
    load();
  };

  return (
    <>
      <h1 className="h3 mb-3">Форум</h1>
      <div className="form-check form-switch mb-3">
        <input
          className="form-check-input"
          type="checkbox"
          id="expert"
          checked={expertOnly}
          onChange={(e) => setExpertOnly(e.target.checked)}
        />
        <label className="form-check-label" htmlFor="expert">Только вопросы экспертам</label>
      </div>
      {user && (
        <form className="card mb-4" onSubmit={createTopic}>
          <div className="card-body">
            <h2 className="h6">Новая тема</h2>
            <input className="form-control mb-2" placeholder="Заголовок" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <textarea className="form-control mb-2" rows={3} placeholder="Текст" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required />
            <div className="form-check">
              <input className="form-check-input" type="checkbox" checked={form.is_expert_question} onChange={(e) => setForm({ ...form, is_expert_question: e.target.checked })} id="eq" />
              <label className="form-check-label" htmlFor="eq">Вопрос эксперту</label>
            </div>
            <button className="btn btn-primary mt-2" type="submit">Создать</button>
          </div>
        </form>
      )}
      {topics.map((t) => (
        <div className="card mb-3" key={t.id}>
          <div className="card-body">
            <div className="d-flex justify-content-between">
              <h2 className="h6 mb-1">
                {t.title}
                {t.is_expert_question && <span className="badge bg-info ms-2">Эксперт</span>}
                {t.is_answered && <span className="badge bg-success ms-1">Отвечено</span>}
              </h2>
              <button type="button" className="btn btn-sm btn-link" onClick={() => openTopic(t.id)}>Подробнее</button>
            </div>
            <p className="small text-muted">@{t.author.username}</p>
            <p>{t.body}</p>
            <div className="small text-muted">
              Ответов: {t.replies_count}
              {t.is_answered && <span className="badge bg-success ms-2">Отвечено</span>}
            </div>
            <Link to={`/forum/questions/${t.id}`} className="btn btn-sm btn-link mt-2 p-0">
              Открыть вопрос
            </Link>
          </div>
        </div>
      ))}
    </>
  );
}
