import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const TYPE_LABELS = {
  exhibition: 'Выставка',
  meetup: 'Встреча',
  other: 'Другое',
};

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', event_type: 'meetup', location: '', starts_at: '',
  });

  const load = () => {
    client.get('/events/').then(({ data }) => setEvents(data.results ?? data));
  };

  useEffect(() => {
    load();
  }, []);

  const attend = async (id, attending) => {
    if (attending) await client.delete(`/events/${id}/attend/`);
    else await client.post(`/events/${id}/attend/`);
    load();
  };

  const create = async (e) => {
    e.preventDefault();
    await client.post('/events/', form);
    setForm({ title: '', description: '', event_type: 'meetup', location: '', starts_at: '' });
    load();
  };

  return (
    <>
      <h1 className="h3 mb-3">Календарь мероприятий</h1>
      {user && (
        <form className="card mb-4" onSubmit={create}>
          <div className="card-body">
            <h2 className="h6">Добавить событие</h2>
            <div className="row g-2">
              <div className="col-md-6">
                <input className="form-control" placeholder="Название" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="col-md-6">
                <select className="form-select" value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })}>
                  <option value="exhibition">Выставка</option>
                  <option value="meetup">Встреча</option>
                  <option value="other">Другое</option>
                </select>
              </div>
              <div className="col-md-6">
                <input className="form-control" placeholder="Место" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
              </div>
              <div className="col-md-6">
                <input type="datetime-local" className="form-control" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} required />
              </div>
              <div className="col-12">
                <textarea className="form-control" placeholder="Описание" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            <button className="btn btn-primary mt-2" type="submit">Создать</button>
          </div>
        </form>
      )}
      <div className="row g-3">
        {events.map((ev) => (
          <div className="col-md-6" key={ev.id}>
            <div className="card h-100">
              <div className="card-body">
                <span className="badge bg-secondary">{TYPE_LABELS[ev.event_type]}</span>
                <h2 className="h5 mt-2">{ev.title}</h2>
                <p className="small text-muted mb-1">📍 {ev.location}</p>
                <p className="small">🗓 {new Date(ev.starts_at).toLocaleString('ru-RU')}</p>
                <p>{ev.description}</p>
                <p className="small">Участников: {ev.attendees_count}</p>
                {user && (
                  <button
                    className={`btn btn-sm ${ev.is_attending ? 'btn-outline-danger' : 'btn-outline-primary'}`}
                    onClick={() => attend(ev.id, ev.is_attending)}
                  >
                    {ev.is_attending ? 'Отменить запись' : 'Пойду!'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
