import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const TYPE_LABELS = {
  event: { label: 'Событие', icon: '🗓️' },
  post: { label: 'Пост', icon: '📰' },
  reminder: { label: 'Напоминание', icon: '💊' },
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    client.get('/accounts/notifications/').then(({ data }) => {
      setItems(data.results ?? []);
    }).catch(() => {
      setError('Не удалось загрузить уведомления');
    }).finally(() => {
      setLoading(false);
    });
  }, [user]);

  if (!user) {
    return (
      <div className="alert alert-warning">Войдите, чтобы увидеть уведомления.</div>
    );
  }

  return (
    <>
      <h1 className="h3 mb-3">Уведомления</h1>
      {loading && <div className="text-muted">Загрузка...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && items.length === 0 && (
        <div className="alert alert-secondary">У вас пока нет новых уведомлений.</div>
      )}
      <div className="list-group">
        {items.map((item) => (
          <Link to={item.url} key={item.id} className="list-group-item list-group-item-action">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <span className="me-2">{TYPE_LABELS[item.type]?.icon}</span>
                <strong>{item.title}</strong>
                <div className="small text-muted">{item.message}</div>
              </div>
              <small className="text-muted">
                {item.created_at ? new Date(item.created_at).toLocaleString('ru-RU') : ''}
              </small>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
