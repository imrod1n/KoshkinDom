import { useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { DraftContentView as View } from './DraftEditor';

export default function PostCard({ post, onUpdate }) {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [likes, setLikes] = useState(post.likes_count);
  const [liked, setLiked] = useState(post.is_liked);

  const toggleLike = async () => {
    const { data } = await client.post(`/posts/${post.id}/like/`);
    setLiked(data.liked);
    setLikes(data.likes_count);
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    const { data } = await client.post(`/posts/${post.id}/comments/`, { text: comment });
    setComments((c) => [...c, data]);
    setComment('');
  };

  const repost = async () => {
    await client.post(`/posts/${post.id}/repost/`);
    onUpdate?.();
  };

  return (
    <div className="card mb-3 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <Link to={`/user/${post.author.username}`} className="fw-semibold text-decoration-none me-2">
              @{post.author.username}
            </Link>
            {post.community && (
              <span className="badge bg-secondary">{post.community.name}</span>
            )}
          </div>
          <small className="text-muted">
            {new Date(post.created_at).toLocaleString('ru-RU')}
          </small>
        </div>
        {post.repost_of_post && (
          <div className="border-start border-3 ps-3 mt-2 text-muted small">
            <View raw={post.repost_of_post.content_raw} text={post.repost_of_post.content_text} />
          </div>
        )}
        <div className="mt-2">
          <View raw={post.content_raw} text={post.content_text} />
        </div>
        {post.image && (
          <img src={post.image} alt="" className="img-fluid rounded mt-2" />
        )}
        {post.video && (
          <video
            src={post.video}
            controls
            className="w-100 rounded mt-2"
            style={{ maxHeight: '400px', width: '100%' }}
          />
        )}
        <div className="d-flex gap-3 mt-3">
          <button
            className={`btn btn-sm ${liked ? 'btn-danger' : 'btn-outline-danger'}`}
            onClick={toggleLike}
            disabled={!user}
            title="Лайк"
          >
            <span aria-hidden="true">❤️</span> Лайк {likes}
          </button>
          <button className="btn btn-sm btn-outline-secondary" onClick={repost} disabled={!user}>
            ↪ Репост
          </button>
          <span className="text-muted small align-self-center">💬 {comments.length}</span>
          <Link to={`/posts/${post.id}`} className="btn btn-sm btn-outline-primary ms-auto">
            Подробнее
          </Link>
        </div>
        {comments.length > 0 && (
          <ul className="list-unstyled mt-3 mb-0 small">
            {comments.map((c) => (
              <li key={c.id} className="mb-1">
                <strong>@{c.author.username}</strong>: {c.text}
              </li>
            ))}
          </ul>
        )}
        {user && (
          <form className="mt-2" onSubmit={submitComment}>
            <div className="input-group input-group-sm">
              <input
                className="form-control"
                placeholder="Комментарий..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">Отправить</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
