import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function PostDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState(null);

  useEffect(() => {
    loadPost();
  }, [id]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const { data } = await client.get(`/posts/${id}/`);
      setPost(data);
      setLikeCount(data.likes_count || 0);
      setIsLiked(data.is_liked || false);
      setComments(data.comments || []);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить пост');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      await client.post(`/posts/${id}/like/`);
      loadPost();
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setCommentError(null);
      await client.post(`/posts/${id}/comments/`, { text: newComment });
      setNewComment('');
      loadPost();
    } catch (err) {
      setCommentError('Не удалось добавить комментарий');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-muted text-center py-5">Загрузка...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!post) {
    return <div className="alert alert-warning">Пост не найден</div>;
  }

  const authorDisplay = post.community ? (
    <Link to={`/communities/${post.community.slug}`} className="text-decoration-none">
      <strong>{post.community.name}</strong>
    </Link>
  ) : (
    <Link to={`/user/${post.author.username}`} className="text-decoration-none">
      <strong>@{post.author.username}</strong>
    </Link>
  );

  return (
    <div className="row">
      <div className="col-md-8 mx-auto">
        <div className="card mb-4">
          <div className="card-body">
            <div className="mb-3">
              {authorDisplay}
              <div className="small text-muted">
                {new Date(post.created_at).toLocaleString('ru-RU')}
              </div>
            </div>

            {post.content_text && (
              <p className="card-text mb-3">{post.content_text}</p>
            )}

            {post.image && (
              <img
                src={typeof post.image === 'object' ? post.image.url : post.image}
                alt="post"
                className="img-fluid mb-3"
              />
            )}

            {post.video && (
              <video
                src={typeof post.video === 'object' ? post.video.url : post.video}
                controls
                className="img-fluid mb-3"
                style={{ maxHeight: '500px', width: '100%' }}
              />
            )}

            <div className="d-flex gap-2 mb-3">
              <button
                className={`btn btn-sm ${isLiked ? 'btn-danger' : 'btn-outline-danger'}`}
                onClick={handleLike}
              >
                ❤️ {likeCount}
              </button>
              <span className="btn btn-sm btn-outline-secondary disabled">
                💬 {comments.length}
              </span>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Комментарии</h5>
          </div>
          <div className="card-body">
            {user && (
              <form onSubmit={handleAddComment} className="mb-3">
                <textarea
                  className="form-control mb-2"
                  rows={3}
                  placeholder="Добавить комментарий..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button className="btn btn-sm btn-primary" type="submit">
                  Опубликовать
                </button>
                {commentError && (
                  <div className="alert alert-danger mt-2 mb-0">{commentError}</div>
                )}
              </form>
            )}

            {comments.length === 0 ? (
              <p className="text-muted small">Комментариев нет</p>
            ) : (
              <div className="list-group">
                {comments.map((comment) => (
                  <div key={comment.id} className="list-group-item">
                    <div className="d-flex justify-content-between">
                      <Link
                        to={`/user/${comment.author.username}`}
                        className="text-decoration-none"
                      >
                        <strong>@{comment.author.username}</strong>
                      </Link>
                      <small className="text-muted">
                        {new Date(comment.created_at).toLocaleString('ru-RU')}
                      </small>
                    </div>
                    <p className="mb-0 mt-1">{comment.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
