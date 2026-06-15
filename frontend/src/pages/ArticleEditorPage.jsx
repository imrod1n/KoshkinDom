import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import client from '../api/client';
import DraftEditor from '../components/DraftEditor';
import { useAuth } from '../context/AuthContext';

export default function ArticleEditorPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { category } = useParams();
  const [sections, setSections] = useState([]);
  const [sectionId, setSectionId] = useState('');
  const [communities, setCommunities] = useState([]);
  const [communityId, setCommunityId] = useState('');
  const [title, setTitle] = useState('');
  const [draft, setDraft] = useState({ raw: { blocks: [], entityMap: {} }, text: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    client.get('/sections/').then(({ data }) => {
      const list = data.results ?? data;
      setSections(list);
      if (category) {
        const match = list.find((s) => s.category === category);
        if (match) setSectionId(String(match.id));
      } else if (list.length) {
        setSectionId(String(list[0].id));
      }
    });
    client.get('/communities/').then(({ data }) => {
      setCommunities((data.results ?? data).filter((c) => c.is_member));
    }).catch(() => {});
  }, [category]);

  if (!user) {
    return (
      <p>
        <Link to="/login">Войдите</Link>, чтобы публиковать статьи.
      </p>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim() || !sectionId) {
      setError('Укажите заголовок и раздел');
      return;
    }
    try {
      await client.post('/sections/articles/', {
        title,
        section_id: Number(sectionId),
        community_id: communityId || null,
        content_raw: draft.raw,
        content_text: draft.text,
      });
      const section = sections.find((s) => String(s.id) === sectionId);
      navigate(section ? `/sections/${section.category}` : '/sections');
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : 'Ошибка сохранения');
    }
  };

  return (
    <div className="row">
      <div className="col-lg-8 mx-auto">
        <h1 className="h3 mb-3">Новая статья</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        <form className="card shadow-sm" onSubmit={submit}>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">Публиковать от</label>
              <select
                className="form-select mb-3"
                value={communityId}
                onChange={(e) => setCommunityId(e.target.value)}
              >
                <option value="">От себя</option>
                {communities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <label className="form-label">Тематический раздел</label>
              <select
                className="form-select"
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                required
              >
                <option value="">Выберите раздел</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Заголовок</label>
              <input
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <label className="form-label">Текст статьи</label>
            <DraftEditor
              placeholder="Содержание статьи..."
              onChange={setDraft}
            />
            <div className="d-flex gap-2 mt-3">
              <button type="submit" className="btn btn-primary">Опубликовать</button>
              <Link to="/sections" className="btn btn-outline-secondary">Отмена</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
