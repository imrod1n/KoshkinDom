import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function SectionDetailPage() {
  const { category } = useParams();
  const { user } = useAuth();
  const [section, setSection] = useState(null);
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    client.get(`/sections/${category}/`).then(({ data }) => setSection(data));
    client.get('/sections/articles/', { params: { category } }).then(({ data }) => {
      setArticles(data.results ?? data);
    });
  }, [category]);

  if (!section) return <div>Загрузка...</div>;

  return (
    <>
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h1 className="h3">{section.title}</h1>
          <p className="text-muted mb-0">{section.description}</p>
        </div>
        {user && (
          <Link to={`/sections/${category}/new`} className="btn btn-primary btn-sm">
            Написать статью
          </Link>
        )}
      </div>
      <hr />
      {articles.length === 0 ? (
        <p className="text-muted">Статей пока нет.</p>
      ) : (
        <div className="row">
          {articles.map((a) => (
            <div key={a.id} className="col-lg-4 col-md-6 mb-4">
              <Link to={`/sections/articles/${a.id}`} className="text-decoration-none">
                <div className="card h-100 shadow-sm">
                  <div className="card-body d-flex flex-column">
                    <div className="article-meta small text-muted mb-2">
                      {a.community?.name ? `${a.community.name}` : a.author?.username ? `@${a.author.username}` : ''}
                      {a.created_at ? ` · ${new Date(a.created_at).toLocaleDateString('ru-RU')}` : ''}
                    </div>
                    <h2 className="h5 mb-2 flex-grow-0">{a.title}</h2>
                    <p className="text-muted small flex-grow-1 mb-3">
                      {a.description || (a.content_text ? (a.content_text.length > 120 ? `${a.content_text.slice(0, 120)}…` : a.content_text) : '')}
                    </p>
                    <span className="btn btn-sm btn-outline-primary align-self-start">
                      Читать полностью
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
