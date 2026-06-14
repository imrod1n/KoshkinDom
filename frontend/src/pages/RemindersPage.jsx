import { useEffect, useState } from 'react';
import client from '../api/client';

const TYPE_LABELS = {
  vaccination: 'Вакцинация',
  parasite: 'Паразиты',
  other: 'Другое',
};

export default function RemindersPage() {
  const [pets, setPets] = useState([]);
  const [petForm, setPetForm] = useState({ name: '', breed: '', birth_date: '' });
  const [remForm, setRemForm] = useState({
    pet: '', reminder_type: 'vaccination', title: '', due_date: '',
  });

  const load = () => {
    client.get('/reminders/pets/').then(({ data }) => setPets(data.results ?? data));
  };

  useEffect(() => {
    load();
  }, []);

  const addPet = async (e) => {
    e.preventDefault();
    await client.post('/reminders/pets/', petForm);
    setPetForm({ name: '', breed: '', birth_date: '' });
    load();
  };

  const addReminder = async (e) => {
    e.preventDefault();
    await client.post('/reminders/', remForm);
    setRemForm({ pet: '', reminder_type: 'vaccination', title: '', due_date: '' });
    load();
  };

  const toggleDone = async (r) => {
    await client.patch(`/reminders/${r.id}/`, { is_done: !r.is_done });
    load();
  };

  return (
    <>
      <h1 className="h3 mb-3">Напоминания о здоровье питомцев</h1>
      <div className="row g-4">
        <div className="col-md-5">
          <form className="card" onSubmit={addPet}>
            <div className="card-body">
              <h2 className="h6">Добавить кота</h2>
              <input className="form-control mb-2" placeholder="Кличка" value={petForm.name} onChange={(e) => setPetForm({ ...petForm, name: e.target.value })} required />
              <input className="form-control mb-2" placeholder="Порода" value={petForm.breed} onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })} />
              <input type="date" className="form-control mb-2" value={petForm.birth_date} onChange={(e) => setPetForm({ ...petForm, birth_date: e.target.value })} />
              <button className="btn btn-success" type="submit">Сохранить</button>
            </div>
          </form>
          <form className="card mt-3" onSubmit={addReminder}>
            <div className="card-body">
              <h2 className="h6">Напоминание</h2>
              <select className="form-select mb-2" value={remForm.pet} onChange={(e) => setRemForm({ ...remForm, pet: e.target.value })} required>
                <option value="">Питомец</option>
                {pets.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <select className="form-select mb-2" value={remForm.reminder_type} onChange={(e) => setRemForm({ ...remForm, reminder_type: e.target.value })}>
                <option value="vaccination">Вакцинация</option>
                <option value="parasite">Обработка от паразитов</option>
                <option value="other">Другое</option>
              </select>
              <input className="form-control mb-2" placeholder="Название" value={remForm.title} onChange={(e) => setRemForm({ ...remForm, title: e.target.value })} required />
              <input type="date" className="form-control mb-2" value={remForm.due_date} onChange={(e) => setRemForm({ ...remForm, due_date: e.target.value })} required />
              <button className="btn btn-primary" type="submit">Добавить</button>
            </div>
          </form>
        </div>
        <div className="col-md-7">
          {pets.map((pet) => (
            <div className="card mb-3" key={pet.id}>
              <div className="card-body">
                <h2 className="h5">🐱 {pet.name} {pet.breed && <small className="text-muted">({pet.breed})</small>}</h2>
                {pet.reminders?.length === 0 ? (
                  <p className="text-muted small">Нет напоминаний</p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {pet.reminders.map((r) => (
                      <li className="list-group-item d-flex justify-content-between align-items-center" key={r.id}>
                        <div>
                          <span className={`badge me-2 ${r.is_done ? 'bg-secondary' : 'bg-warning text-dark'}`}>
                            {TYPE_LABELS[r.reminder_type]}
                          </span>
                          {r.title} — {r.due_date}
                        </div>
                        <button type="button" className="btn btn-sm btn-outline-success" onClick={() => toggleDone(r)}>
                          {r.is_done ? '↩' : '✓'}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
