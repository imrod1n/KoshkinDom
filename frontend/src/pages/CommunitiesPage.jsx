import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function CommunitiesPage() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ name: '', slug: '', description: '' });

  const load = () => {
    client.get('/communities/').then(({ data }) => setList(data.results ?? data));
  };

  useEffect(() => {
    load();
  }, []);

  const join = async (slug, isMember) => {
    if (isMember) await client.delete(`/communities/${slug}/join/`);
    else await client.post(`/communities/${slug}/join/`);
    load();
  };

  const create = async (e) => {
    e.preventDefault();
    await client.post('/communities/', form);
    setForm({ name: '', slug: '', description: '' });
    load();
  };

  return (
    <>
      <h1 className="h3 mb-3">Сообщества</h1>
      {user && (
        <form className="card mb-4" onSubmit={create}>
          <div className="card-body row g-2">
            <div className="col-md-4">
              <input className="form-control" placeholder="Название" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="col-md-4">
              <input className="form-control" placeholder="slug (латиница)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
            </div>
            <div className="col-md-4">
              <button className="btn btn-primary w-100" type="submit">Создать</button>
            </div>
            <div className="col-12">
              <textarea className="form-control" placeholder="Описание" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
        </form>
      )}
      <div className="row g-3">
        {list.map((c) => (
          <div className="col-md-6 col-lg-4" key={c.id}>
            <div className="card h-100">
              <div className="card-body">
                <h2 className="h5">
                  <Link to={`/communities/${c.slug}`} className="text-decoration-none">
                    {c.name}
                  </Link>
                </h2>
                <p className="small text-muted">{c.description}</p>
                <p className="small">👥 {c.members_count} участников</p>
                {user && (
                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      type="button"
                      className={`btn btn-sm ${c.is_member ? 'btn-outline-secondary' : 'btn-primary'}`}
                      onClick={() => join(c.slug, c.is_member)}
                    >
                      {c.is_member ? 'Выйти' : 'Вступить'}
                    </button>
                    {c.is_member && c.conversation_id && (
                      <Link
                        to={`/messages?conversation=${c.conversation_id}`}
                        className="btn btn-sm btn-outline-primary"
                      >
                        Чат
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
