import { useEffect, useMemo, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const TYPE_LABELS = {
  exhibition: 'Выставка',
  meetup: 'Встреча',
  other: 'Другое',
};

const WEEK_DAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

function buildMonthCalendar(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const days = [];
  for (let i = 0; i < startOffset; i += 1) {
    days.push(null);
  }
  for (let day = 1; day <= totalDays; day += 1) {
    days.push(new Date(year, month, day));
  }
  while (days.length % 7 !== 0) {
    days.push(null);
  }
  return days;
}

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
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

  const calendarDays = useMemo(() => buildMonthCalendar(currentDate), [currentDate]);
  const monthName = currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });

  const eventsByDay = useMemo(() => {
    return events.reduce((acc, event) => {
      const date = new Date(event.starts_at);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      acc[key] = acc[key] || [];
      acc[key].push(event);
      return acc;
    }, {});
  }, [events]);

  const dayEvents = (day) => {
    if (!day) return [];
    const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
    return eventsByDay[key] || [];
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Календарь мероприятий</h1>
          <p className="text-muted mb-0">Реальный календарь событий и записи на мероприятия.</p>
        </div>
        <div>
          <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>
            ← Предыдущий
          </button>
          <button className="btn btn-sm btn-outline-secondary" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>
            Следующий →
          </button>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h5 mb-0">{monthName}</h2>
              </div>
              <div className="calendar grid gap-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
                {WEEK_DAYS.map((name) => (
                  <div key={name} className="text-center fw-semibold py-2 border-bottom">{name}</div>
                ))}
                {calendarDays.map((day, index) => {
                  const isToday = day && day.toDateString() === new Date().toDateString();
                  const items = dayEvents(day);
                  return (
                    <div
                      key={index}
                      className={`p-2 border rounded ${isToday ? 'border-primary bg-white' : 'bg-light'}`}
                      style={{ minHeight: '100px' }}
                    >
                      {day ? (
                        <>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="fw-semibold">{day.getDate()}</span>
                            {items.length > 0 && <span className="badge bg-primary">{items.length}</span>}
                          </div>
                          {items.slice(0, 2).map((ev) => (
                            <div key={ev.id} className="small mb-1 text-truncate">
                              <strong>{TYPE_LABELS[ev.event_type]}</strong>: {ev.title}
                            </div>
                          ))}
                        </>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          {user && (
            <form className="card mb-4" onSubmit={create}>
              <div className="card-body">
                <h2 className="h6">Добавить событие</h2>
                <div className="row g-2">
                  <div className="col-12">
                    <input className="form-control" placeholder="Название" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                  </div>
                  <div className="col-12">
                    <select className="form-select" value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })}>
                      <option value="exhibition">Выставка</option>
                      <option value="meetup">Встреча</option>
                      <option value="other">Другое</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <input className="form-control" placeholder="Место" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
                  </div>
                  <div className="col-12">
                    <input type="datetime-local" className="form-control" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} required />
                  </div>
                  <div className="col-12">
                    <textarea className="form-control" placeholder="Описание" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  </div>
                </div>
                <button className="btn btn-primary mt-3" type="submit">Создать</button>
              </div>
            </form>
          )}
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h2 className="h6">События</h2>
              {events.length === 0 ? (
                <p className="small text-muted">Пока нет мероприятий.</p>
              ) : (
                events.map((ev) => (
                  <div key={ev.id} className="mb-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <strong>{ev.title}</strong>
                        <div className="small text-muted">{TYPE_LABELS[ev.event_type]}, {new Date(ev.starts_at).toLocaleDateString('ru-RU')}</div>
                      </div>
                      {user && (
                        <button
                          className={`btn btn-sm ${ev.is_attending ? 'btn-outline-danger' : 'btn-outline-primary'}`}
                          onClick={() => attend(ev.id, ev.is_attending)}
                        >
                          {ev.is_attending ? 'Отменить' : 'Пойду'}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
