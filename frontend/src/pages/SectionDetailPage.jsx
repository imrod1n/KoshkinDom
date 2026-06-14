import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import client from '../api/client';
import { DraftContentView } from '../components/DraftEditor';
import { useAuth } from '../context/AuthContext';

export default function SectionDetailPage() {
  const { category } = useParams();
  const { user } = useAuth();
  const [section, setSection] = useState(null);
  const [articles, setArticles] = useState([]);
  const [expanded, setExpanded] = useState({});

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
        articles.map((a) => (
          <div className="card mb-3" key={a.id}>
            <div className="card-body article-preview">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <h2 className="h5 mb-1">{a.title}</h2>
                  <div className="article-meta">
                    {a.author?.username ? `@${a.author.username}` : ''}
                    {a.created_at ? ` · ${new Date(a.created_at).toLocaleDateString('ru-RU')}` : ''}
                  </div>
                </div>
                <div>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setExpanded((s) => ({ ...s, [a.id]: !s[a.id] }))}
                  >
                    {expanded[a.id] ? 'Свернуть' : 'Читать'}
                  </button>
                </div>
              </div>

              {expanded[a.id] ? (
                <DraftContentView raw={a.content_raw} text={a.content_text} />
              ) : (
                <p className="mb-0">
                  {a.content_text ? (a.content_text.length > 300 ? `${a.content_text.slice(0, 300)}…` : a.content_text) : ''}
                </p>
              )}
            </div>
          </div>
        ))
      )}
    </>
  );
}
