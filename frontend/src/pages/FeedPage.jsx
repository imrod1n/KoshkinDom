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
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [communities, setCommunities] = useState([]);
  const [communityId, setCommunityId] = useState('');
  const [recentArticles, setRecentArticles] = useState([]);

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
    client.get('/sections/articles/').then(({ data }) => {
      const articles = data.results ?? data;
      setRecentArticles(articles.slice(0, 3));
    }).catch(() => {});
    client.get('/communities/').then(({ data }) => {
      setCommunities((data.results ?? data).filter((c) => c.is_member));
    }).catch(() => {});
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

  const onVideoChange = (e) => {
    const file = e.target.files?.[0];
    setVideoFile(file || null);
    if (file) {
      setVideoPreview(URL.createObjectURL(file));
    } else {
      setVideoPreview(null);
    }
  };

  const publish = async (e) => {
    e.preventDefault();
    if (!draft.text.trim() && !imageFile && !videoFile) return;

    const form = new FormData();
    form.append('content_raw', JSON.stringify(draft.raw));
    form.append('content_text', draft.text);
    if (imageFile) form.append('image', imageFile);
    if (videoFile) form.append('video', videoFile);
    if (communityId) form.append('community_id', communityId);

    await client.post('/posts/', form);
    setDraft({ raw: { blocks: [], entityMap: {} }, text: '' });
    setImageFile(null);
    setImagePreview(null);
    setVideoFile(null);
    setVideoPreview(null);
    setCommunityId('');
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
            <div className="card mb-4 shadow-sm">
              <img src={MyImage} className="card-img"/>
              <div className="card-body">
                <h2 className="card-title">Добро пожаловать в кошкин дом - единое место для владельwев кошек</h2>
                <p>Здесь собрано вместе всё, что вам нужно: чаты, статьи, обсуждения, напоминания о здоровье питомцев, ии-помощник</p>
              </div>
            </div>
            <div className="card mb-4 shadow-sm">
              <div className="card-body">
                <h6 className="card-title">Расскажите о ваших котиках:</h6>
                {user ? (
                  <>
                    <div className="mb-2">
                      <label className="form-label">Публикация от</label>
                      <select
                        className="form-select"
                        value={communityId}
                        onChange={(e) => setCommunityId(e.target.value)}
                      >
                        <option value="">От себя</option>
                        {communities.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="border rounded p-2 mb-2" style={{ minHeight: '150px' }}>
                      <DraftEditor onChange={setDraft} />
                    </div>
                    <div className="mb-2 d-flex gap-2">
                      <div className="flex-grow-1">
                        <label className="btn btn-outline-secondary btn-sm w-100">
                          📷 Добавить фото
                          <input type="file" accept="image/*" onChange={onImageChange} style={{ display: 'none' }} />
                        </label>
                      </div>
                      <div className="flex-grow-1">
                        <label className="btn btn-outline-secondary btn-sm w-100">
                          🎬 Добавить видео
                          <input type="file" accept="video/*" onChange={onVideoChange} style={{ display: 'none' }} />
                        </label>
                      </div>
                    </div>
                    {(imagePreview || videoPreview) && (
                      <div className="mb-2">
                        {imagePreview && (
                          <div className="position-relative d-inline-block me-2">
                            <img src={imagePreview} alt="preview" style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '4px' }} />
                            <button
                              type="button"
                              className="btn btn-sm btn-danger position-absolute top-0 end-0"
                              onClick={() => {
                                setImageFile(null);
                                setImagePreview(null);
                              }}
                              style={{ borderRadius: '50%', width: '24px', height: '24px', padding: '0' }}
                            >
                              ✕
                            </button>
                          </div>
                        )}
                        {videoPreview && (
                          <div className="position-relative d-inline-block">
                            <video src={videoPreview} style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '4px' }} />
                            <button
                              type="button"
                              className="btn btn-sm btn-danger position-absolute top-0 end-0"
                              onClick={() => {
                                setVideoFile(null);
                                setVideoPreview(null);
                              }}
                              style={{ borderRadius: '50%', width: '24px', height: '24px', padding: '0' }}
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    )}
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
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <h6>Последние статьи</h6>
                {recentArticles.length === 0 ? (
                  <p className="text-muted small">Пока нет свежих материалов.</p>
                ) : (
                  <div className="d-flex gap-3 overflow-auto pb-2" style={{ minHeight: '240px' }}>
                    {recentArticles.map((article) => (
                      <Link
                        to={`/sections/articles/${article.id}`}
                        key={article.id}
                        className="text-decoration-none flex-shrink-0"
                        style={{ minWidth: '220px' }}
                      >
                        <div className="p-3 border rounded hover-shadow h-100 bg-white">
                          <strong>{article.title}</strong>
                          <div className="small text-muted mt-2">
                            {article.author?.username ? `@${article.author.username}` : 'Сообщество'}
                          </div>
                          <div className="small text-muted">{new Date(article.created_at).toLocaleDateString('ru-RU')}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
   );
}
