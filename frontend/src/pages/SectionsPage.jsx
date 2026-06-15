import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const ICONS = {
  breeds: '🐈',
  care: '🧼',
  health: '💊',
  nutrition: '🍽️',
  training: '🎓',
  misc: '📦',
};

export default function SectionsPage() {
  const { user } = useAuth();
  const [sections, setSections] = useState([]);

  useEffect(() => {
    client.get('/sections/').then(({ data }) => setSections(data.results ?? data));
  }, []);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Тематические разделы</h1>
        {user && (
          <Link to="/sections/articles/new" className="btn btn-outline-primary btn-sm">
            Новая статья
          </Link>
        )}
      </div>
      <div className="row g-3">
        {sections.map((s) => (
          <div className="col-md-6 col-lg-4" key={s.id}>
            <Link to={`/sections/${s.category}`} className="text-decoration-none">
                <div className="card h-100 shadow-sm hover-shadow">
                  <div className="card-body d-flex gap-3">
                    <div className="section-card-icon">{ICONS[s.category] || '📁'}</div>
                    <div>
                      <h2 className="h5 card-title mt-2">{s.title}</h2>
                      <p className="card-text text-muted small">{s.description}</p>
                      <span className="badge bg-primary">{s.articles_count} статей</span>
                    </div>
                  </div>
                </div>
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}
