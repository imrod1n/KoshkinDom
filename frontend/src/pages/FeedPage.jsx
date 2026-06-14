import { useCallback, useEffect, useState } from 'react';
import client from '../api/client';
import DraftEditor from '../components/DraftEditor';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [feed, setFeed] = useState('all');
  const [draft, setDraft] = useState({ raw: { blocks: [], entityMap: {} }, text: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = feed === 'following' ? { feed: 'following' } : {};
    const { data } = await client.get('/posts/', { params });
    setPosts(data.results ?? data);
    setLoading(false);
  }, [feed]);

  useEffect(() => {
    load();
  }, [load]);

  const onImageChange = (e) => {
    const file = e.target.files?.[0];
    setImageFile(file || null);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const publish = async (e) => {
    e.preventDefault();
    if (!draft.text.trim() && !imageFile) return;

    const form = new FormData();
    form.append('content_raw', JSON.stringify(draft.raw));
    form.append('content_text', draft.text);
    if (imageFile) form.append('image', imageFile);

    await client.post('/posts/', form);
    setDraft({ raw: { blocks: [], entityMap: {} }, text: '' });
    setImageFile(null);
    setImagePreview(null);
    load();
  };

  return (
    <div className="row">
      <div className="col-lg-8 mx-auto">
        <h1 className="h3 mb-3">Лента новостей</h1>
        <div className="btn-group mb-3">
          <button
            type="button"
            className={`btn btn-sm ${feed === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFeed('all')}
          >
            Все
          </button>
          {user && (
            <button
              type="button"
              className={`btn btn-sm ${feed === 'following' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFeed('following')}
            >
              Подписки
            </button>
          )}
        </div>
        {user && (
          <form className="card mb-4 shadow-sm" onSubmit={publish}>
            <div className="card-body">
              <h2 className="h6">Новая публикация</h2>
              <DraftEditor onChange={setDraft} />
              <div className="mt-2">
                <label className="form-label small text-muted">Фото к публикации</label>
                <input
                  type="file"
                  className="form-control form-control-sm"
                  accept="image/*"
                  onChange={onImageChange}
                />
              </div>
              {imagePreview && (
                <img src={imagePreview} alt="Превью" className="img-fluid rounded mt-2" style={{ maxHeight: 240 }} />
              )}
              <button className="btn btn-primary mt-2" type="submit">Опубликовать</button>
            </div>
          </form>
        )}
        {loading ? (
          <div className="text-center py-5">Загрузка...</div>
        ) : posts.length === 0 ? (
          <p className="text-muted">Пока нет публикаций. Будьте первым!</p>
        ) : (
          posts.map((p) => <PostCard key={p.id} post={p} onUpdate={load} />)
        )}
      </div>
    </div>
  );
}
