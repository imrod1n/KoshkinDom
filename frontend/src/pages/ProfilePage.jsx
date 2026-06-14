import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../api/client';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: me } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const isSelf = me?.username === username;

  const load = useCallback(async () => {
    const [u, p] = await Promise.all([
      client.get(`/accounts/users/${username}/`),
      client.get('/posts/', { params: { author: username } }),
    ]);
    setProfile(u.data);
    setPosts(p.data.results ?? p.data);
  }, [username]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleFollow = async () => {
    if (profile.is_following) {
      await client.delete(`/accounts/users/${username}/follow/`);
    } else {
      await client.post(`/accounts/users/${username}/follow/`);
    }
    load();
  };

  const startChat = async () => {
    setChatLoading(true);
    try {
      const { data } = await client.post(`/messaging/start/${profile.id}/`);
      navigate(`/messages?conversation=${data.id}`);
    } finally {
      setChatLoading(false);
    }
  };

  if (!profile) return <div>Загрузка...</div>;

  return (
    <div className="row">
      <div className="col-lg-8 mx-auto">
        <div className="card mb-4">
          <div className="card-body">
            <h1 className="h4">@{profile.username}</h1>
            {profile.bio && <p>{profile.bio}</p>}
            <p className="text-muted small mb-0">
              {profile.city && <>📍 {profile.city} · </>}
              {profile.favorite_breed && <>🐾 {profile.favorite_breed} · </>}
              Подписчики: {profile.followers_count} · Подписки: {profile.following_count}
            </p>
            {me && !isSelf && (
              <div className="d-flex gap-2 mt-2">
                <button className="btn btn-primary btn-sm" onClick={toggleFollow}>
                  {profile.is_following ? 'Отписаться' : 'Подписаться'}
                </button>
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={startChat}
                  disabled={chatLoading}
                >
                  {chatLoading ? '...' : 'Написать'}
                </button>
              </div>
            )}
          </div>
        </div>
        <h2 className="h5">Публикации</h2>
        {posts.map((p) => (
          <PostCard key={p.id} post={p} onUpdate={load} />
        ))}
      </div>
    </div>
  );
}
