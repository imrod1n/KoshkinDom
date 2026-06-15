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
              <div className="mb-3">
                <label className="form-label">Имя пользователя</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.username}
                  onChange={set('username')}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Электронная почта</label>
                <input
                  type="email"
                  className="form-control"
                  value={form.email}
                  onChange={set('email')}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Пароль</label>
                <div className="input-group">
                  <input
                    type={form.showPassword ? 'text' : 'password'}
                    className="form-control"
                    value={form.password}
                    onChange={set('password')}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setForm({ ...form, showPassword: !form.showPassword })}
                  >
                    {form.showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7z" />
                        <path d="M12 9a3 3 0 100 6 3 3 0 000-6z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M2 2l20 20-1.5 1.5L.5 3.5 2 2z" fill="none" />
                        <path d="M17.94 17.94A10.94 10.94 0 0112 19c-7 0-11-7-11-7 1.73-2.72 4.34-4.79 7.26-5.9L2 2l1.41-1.41L20.36 18.94 17.94 17.94z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Подтвердите пароль</label>
                <div className="input-group">
                  <input
                    type={form.showPasswordConfirm ? 'text' : 'password'}
                    className="form-control"
                    value={form.password_confirm}
                    onChange={set('password_confirm')}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setForm({ ...form, showPasswordConfirm: !form.showPasswordConfirm })}
                  >
                    {form.showPasswordConfirm ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7z" />
                        <path d="M12 9a3 3 0 100 6 3 3 0 000-6z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M2 2l20 20-1.5 1.5L.5 3.5 2 2z" fill="none" />
                        <path d="M17.94 17.94A10.94 10.94 0 0112 19c-7 0-11-7-11-7 1.73-2.72 4.34-4.79 7.26-5.9L2 2l1.41-1.41L20.36 18.94 17.94 17.94z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

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
