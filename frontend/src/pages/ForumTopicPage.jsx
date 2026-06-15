import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ForumTopicPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [topic, setTopic] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadTopic = async () => {
    try {
      const { data } = await client.get(`/forum/topics/${id}/`);
      setTopic(data);
    } catch (err) {
      setError('Тема не найдена');
    }
  };

  useEffect(() => {
    loadTopic();
  }, [id]);

  const sendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      await client.post(`/forum/topics/${id}/replies/`, {
        body: replyText,
        parent_id: replyTo || null,
      });
      setReplyText('');
      setReplyTo(null);
      loadTopic();
    } catch (err) {
      setError('Не удалось отправить ответ');
    }
  };

  const renderReplies = (replies, level = 0) => (
    replies.map((reply) => (
      <div key={reply.id} className={`border rounded p-3 mb-3 ${level ? 'bg-light' : ''}`} style={{ marginLeft: level * 20 }}>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <strong>@{reply.author.username}</strong>
            {reply.is_expert_answer && <span className="badge bg-success ms-2">Эксперт</span>}
          </div>
          <small className="text-muted">{new Date(reply.created_at).toLocaleString('ru-RU')}</small>
        </div>
        <p className="mt-2 mb-2">{reply.body}</p>
        {user && (
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={() => setReplyTo(reply.id)}
          >
            Ответить на этот ответ
          </button>
        )}
        {reply.children?.length > 0 && renderReplies(reply.children, level + 1)}
      </div>
    ))
  );

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!topic) {
    return <div className="text-muted">Загрузка...</div>;
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="h3 mb-1">{topic.title}</h1>
          <div className="text-muted small">
            @{topic.author.username} · {new Date(topic.created_at).toLocaleString('ru-RU')}
          </div>
        </div>
        <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate('/forum')}>
          Назад в форум
        </button>
      </div>
      <div className="card mb-4">
        <div className="card-body">
          <p>{topic.body}</p>
          {topic.is_expert_question && <span className="badge bg-info">Вопрос экспертам</span>}
          {topic.is_answered && <span className="badge bg-success ms-2">Отвечено</span>}
        </div>
      </div>
      <h2 className="h5 mb-3">Ответы</h2>
      {topic.replies.length === 0 ? (
        <p className="text-muted">Пока нет ответов.</p>
      ) : renderReplies(topic.replies)}
      {user ? (
        <form className="card p-3" onSubmit={sendReply}>
          {replyTo && (
            <div className="alert alert-info py-2 mb-3">
              Ответ будет на сообщение #{replyTo}. <button type="button" className="btn btn-sm btn-link" onClick={() => setReplyTo(null)}>Отмена</button>
            </div>
          )}
          <textarea
            className="form-control mb-3"
            rows={4}
            placeholder="Ваш ответ"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <button className="btn btn-primary">Отправить ответ</button>
        </form>
      ) : (
        <div className="alert alert-warning">Войдите, чтобы отвечать на вопросы.</div>
      )}
    </>
  );
}
