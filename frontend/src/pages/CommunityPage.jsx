import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';

export default function CommunityPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCommunity = async () => {
    try {
      const { data } = await client.get(`/communities/${slug}/`);
      setCommunity(data);
    } catch (err) {
      setError('Сообщество не найдено');
    }
  };

  const loadPosts = async () => {
    try {
      const { data } = await client.get('/posts/', { params: { community: slug } });
      setPosts(data.results ?? data);
    } catch (err) {
      setPosts([]);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadCommunity(), loadPosts()]).finally(() => setLoading(false));
  }, [slug]);

  const toggleMembership = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      if (community.is_member) {
        await client.delete(`/communities/${slug}/join/`);
      } else {
        await client.post(`/communities/${slug}/join/`);
      }
      await loadCommunity();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-5 text-muted">Загрузка...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!community) {
    return <div className="alert alert-warning">Сообщество не найдено.</div>;
  }

  return (
    <div className="row">
      <div className="col-lg-8">
        <div className="card mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
              <div>
                <h1 className="h3 mb-1">{community.name}</h1>
                <p className="small text-muted mb-1">slug: {community.slug}</p>
                <p>{community.description}</p>
                <p className="small text-muted mb-0">Создатель: @{community.owner.username}</p>
                <p className="small text-muted">Участников: {community.members_count}</p>
              </div>
              {user && (
                <button
                  className={`btn btn-sm ${community.is_member ? 'btn-outline-secondary' : 'btn-primary'}`}
                  onClick={toggleMembership}
                >
                  {community.is_member ? 'Покинуть сообщество' : 'Вступить в сообщество'}
                </button>
              )}
            </div>
            {community.conversation_id && community.is_member && (
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => navigate(`/messages?conversation=${community.conversation_id}`)}
              >
                Открыть чат
              </button>
            )}
          </div>
        </div>

        <div className="mb-3">
          <h2 className="h5">Посты сообщества</h2>
          {posts.length === 0 ? (
            <div className="alert alert-secondary">Пока нет постов.</div>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} onUpdate={loadPosts} />)
          )}
        </div>
      </div>
    </div>
  );
}
