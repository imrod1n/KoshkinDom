import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

const TYPE_INFO = {
  event: { label: 'Событие', icon: '🗓️', color: 'info' },
  post: { label: 'Пост', icon: '📰', color: 'primary' },
  reminder: { label: 'Напоминание', icon: '💊', color: 'warning' },
};

export default function NotificationsModal({ show, onHide }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadNotifications = () => {
    setLoading(true);
    client.get('/accounts/notifications/')
      .then(({ data }) => {
        setNotifications(data.results ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (show) {
      loadNotifications();
    }
  }, [show]);

  const handleMarkAsRead = async (id) => {
    await client.post(`/accounts/notifications/${id}/read/`).catch(() => {});
    loadNotifications();
  };

  const handleMarkAllAsRead = async () => {
    await client.post('/accounts/notifications/mark-all-read/').catch(() => {});
    loadNotifications();
  };

  const handleNotificationClick = (notification) => {
    handleMarkAsRead(notification.id);
    // For posts, navigate to detail page
    if (notification.notification_type === 'post') {
      const postId = notification.url.split('-').pop();
      navigate(`/posts/${postId}`);
    } else {
      navigate(notification.url);
    }
    onHide();
  };

  const unreadNotifications = notifications.filter(n => !n.is_read);
  const readNotifications = notifications.filter(n => n.is_read);

  return (
    <div
      className={`modal ${show ? 'show d-block' : ''}`}
      tabIndex="-1"
      style={{ backgroundColor: show ? 'rgba(0,0,0,0.5)' : '' }}
    >
      <div className="modal-dialog modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Уведомления</h5>
            <button type="button" className="btn-close" onClick={onHide} />
          </div>
          <div className="modal-body">
            {loading && <div className="text-muted text-center py-3">Загрузка...</div>}

            {!loading && unreadNotifications.length === 0 && readNotifications.length === 0 && (
              <div className="alert alert-secondary mb-0">
                У вас пока нет уведомлений.
              </div>
            )}

            {/* Unread notifications */}
            {unreadNotifications.length > 0 && (
              <>
                <h6 className="mb-3 text-secondary">
                  Новые ({unreadNotifications.length})
                </h6>
                <div className="list-group list-group-flush mb-3">
                  {unreadNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="list-group-item list-group-item-action"
                      onClick={() => handleNotificationClick(notif)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <span className="me-2">{TYPE_INFO[notif.notification_type]?.icon}</span>
                          <strong>{notif.title}</strong>
                          <div className="small text-muted">{notif.message}</div>
                        </div>
                        <small className="text-muted">
                          {new Date(notif.created_at).toLocaleString('ru-RU')}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Read notifications */}
            {readNotifications.length > 0 && (
              <>
                <h6 className="mb-3 text-muted">
                  Прочитанные ({readNotifications.length})
                </h6>
                <div className="list-group list-group-flush">
                  {readNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="list-group-item list-group-item-action opacity-75"
                      onClick={() => handleNotificationClick(notif)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <span className="me-2">{TYPE_INFO[notif.notification_type]?.icon}</span>
                          <span>{notif.title}</span>
                          <div className="small text-muted">{notif.message}</div>
                        </div>
                        <small className="text-muted">
                          {new Date(notif.created_at).toLocaleString('ru-RU')}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          {unreadNotifications.length > 0 && (
            <div className="modal-footer border-top">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={handleMarkAllAsRead}
              >
                Отметить всё как прочитанное
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
