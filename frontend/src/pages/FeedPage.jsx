import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import DraftEditor from '../components/DraftEditor';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import MyImage from './NL-AwNVEAA2Ct_hsVujF0.png';

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
    try {
      const { data } = await client.get('/posts/', { params });
      setPosts(data.results ?? data);
    } catch (err) {
      // keep posts as empty array on error
    }
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

  // Fallback sample posts (кошачьи) when feed is empty
  const samplePosts = [
    { id: 's1', author: 'Барсик', text: 'Сегодня поймал солнечного зайчика! 🐾' },
    { id: 's2', author: 'Мурка', text: 'Кто-нибудь знает, где достать лучшую кошачью мяту?' },
  ];

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container">
        <div className="row">

          <div className="col-md-6">
            <div className="card d-flex mb-4 shadow-sm">
              <img src={MyImage} class="card-img" alt="" />
                <h2 className="card-title">Добро пожаловать в кошкин дом - единое место для владельwев кошек</h2>
                <p>Здесь собрано вместе всё, что вам нужно: чаты, статьи, обсуждения, напоминания о здоровье питомцев, ии-помощник</p>
              </div>
            </div>
            <div className="card mb-4 shadow-sm">
              <div className="card-body">
                <h6 className="card-title">Расскажите о ваших котиках:</h6>
                {user ? (
                  <>
                    <div className="border rounded p-2 mb-2" style={{ minHeight: '150px' }}>
                      <DraftEditor onChange={setDraft} />
                    </div>
                    <button className="btn btn-warning w-100 fw-bold" onClick={publish}>Опубликовать</button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted mb-3">Войдите в систему, чтобы делиться постами, статьями, пользоваться наши ии-помощником, общаться с единомышленниками, !</p>
                    <Link to="/login" className="btn btn-primary btn-lg">
                      Войти в систему
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="feed">
              <h4 className="mb-3">Лента новостей</h4>
              {loading && <div className="text-center py-5 text-muted">Загрузка...</div>}

              {!loading && posts.length === 0 && (
                samplePosts.map(post => (
                  <div key={post.id} className="card mb-3 shadow-sm">
                    <div className="card-body">
                      <h6 className="fw-bold text-primary">{post.author}</h6>
                      <p className="card-text" style={{ width: '100%' }}>{post.text}</p>
                      <div className="d-flex gap-2">
                        <button className="btn btn-outline-danger btn-sm">❤ Лайк</button>
                        <button className="btn btn-outline-secondary btn-sm">💬 Мяукнуть</button>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {!loading && posts.length > 0 && (
                posts.map((p) => <PostCard key={p.id} post={p} onUpdate={load} />)
              )}
            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow-sm">
              <div className="card-body">
                <h6>Интересные коты</h6>
                <ul className="list-unstyled">
                  <li className="mb-2">🐾 Кот Матроскин</li>
                  <li className="mb-2">🐾 Чеширский Кот</li>
                  <li className="mb-2">🐾 Кот в Сапогах</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
