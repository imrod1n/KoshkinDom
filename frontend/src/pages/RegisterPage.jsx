import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '', email: '', password: '', password_confirm: '',
  });
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      const data = err.response?.data;
      setError(data ? JSON.stringify(data) : 'Ошибка регистрации');
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card shadow">
          <div className="card-body">
            <h1 className="h4 mb-3">Регистрация</h1>
            {error && <div className="alert alert-danger small">{error}</div>}
            <form onSubmit={submit}>
              {['username', 'email', 'password', 'password_confirm'].map((field) => (
                <div className="mb-3" key={field}>
                  <label className="form-label text-capitalize">{field.replace('_', ' ')}</label>
                  <input
                    type={field.includes('password') ? 'password' : field === 'email' ? 'email' : 'text'}
                    className="form-control"
                    value={form[field]}
                    onChange={set(field)}
                    required
                  />
                </div>
              ))}
              <button className="btn btn-success w-100" type="submit">Создать профиль</button>
            </form>
            <p className="mt-3 mb-0 text-center small">
              Уже есть аккаунт? <Link to="/login">Войти</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
