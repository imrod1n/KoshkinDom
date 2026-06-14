import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const navLinkClass = ({ isActive }) =>
  `nav-link ${isActive ? 'active fw-semibold' : ''}`;

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <>
      <nav className="navbar navbar-expand-lg sticky-top app-navbar">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">
            🐱 Кошкин Дом
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#nav"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="nav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <NavLink className={navLinkClass} to="/">Лента</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className={navLinkClass} to="/sections">Разделы</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className={navLinkClass} to="/forum">Форум</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className={navLinkClass} to="/events">События</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className={navLinkClass} to="/communities">Сообщества</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className={navLinkClass} to="/ai">ИИ-помощник</NavLink>
              </li>
              {user && (
                <>
                  <li className="nav-item">
                    <NavLink className={navLinkClass} to="/messages">Сообщения</NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className={navLinkClass} to="/reminders">Напоминания</NavLink>
                  </li>
                </>
              )}
            </ul>
            <ul className="navbar-nav">
              <li className="nav-item d-flex align-items-center">
                <ThemeToggle />
              </li>
              {user ? (
                <>
                  <li className="nav-item">
                    <NavLink className={navLinkClass} to={`/user/${user.username}`}>
                      @{user.username}
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <button className="nav-link btn btn-link" onClick={logout}>Выйти</button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <NavLink className={navLinkClass} to="/login">Вход</NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className={navLinkClass} to="/register">Регистрация</NavLink>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
      <main className="container py-4">
        <Outlet />
      </main>
      <footer className="text-center text-muted py-4 border-top">
        <small>Кошкин Дом — дипломный проект, социальная сеть для любителей кошек</small>
      </footer>
    </>
  );
}
