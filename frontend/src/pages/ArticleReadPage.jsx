import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import client from '../api/client';
import { DraftContentView } from '../components/DraftEditor';

export default function ArticleReadPage() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        setLoading(true);
        const { data } = await client.get(`/sections/articles/${id}/`);
        setArticle(data);
      } catch (err) {
        setError('Статья не найдена');
      } finally {
        setLoading(false);
      }
    };
    loadArticle();
  }, [id]);

  if (loading) return <div className="text-center py-5">Загрузка...</div>;
  if (error || !article) return <div className="alert alert-danger">{error || 'Статья не найдена'}</div>;

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <Link to={`/sections/${article.section}`} className="btn btn-link text-decoration-none mb-3">
          ← Вернуться к статьям
        </Link>

        <article>
          <header className="mb-4">
            <h1 className="display-6 mb-3">{article.title}</h1>
            <div className="text-muted small mb-3">
              <span>
                {article.community?.name ? `${article.community.name}` : article.author?.username ? `@${article.author.username}` : 'Автор'}
              </span>
              {article.created_at && (
                <>
                  <span> · </span>
                  <time dateTime={article.created_at}>
                    {new Date(article.created_at).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                </>
              )}
            </div>
            {article.description && (
              <p className="lead text-muted">{article.description}</p>
            )}
          </header>

          <hr />

          <div className="article-content">
            <DraftContentView raw={article.content_raw} text={article.content_text} />
          </div>
        </article>
      </div>
    </div>
  );
}
