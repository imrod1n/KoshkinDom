import { lazy, Suspense } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';

const AIPage = lazy(() => import('./pages/AIPage'));
const CommunitiesPage = lazy(() => import('./pages/CommunitiesPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const FeedPage = lazy(() => import('./pages/FeedPage'));
const ForumPage = lazy(() => import('./pages/ForumPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const RemindersPage = lazy(() => import('./pages/RemindersPage'));
const SectionDetailPage = lazy(() => import('./pages/SectionDetailPage'));
const ArticleEditorPage = lazy(() => import('./pages/ArticleEditorPage'));
const ArticleReadPage = lazy(() => import('./pages/ArticleReadPage'));
const SectionsPage = lazy(() => import('./pages/SectionsPage'));

function PageLoader() {
  return <div className="text-center py-5 text-muted">Загрузка...</div>;
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<FeedPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="user/:username" element={<ProfilePage />} />
          <Route path="sections" element={<SectionsPage />} />
          <Route path="sections/articles/new" element={<ArticleEditorPage />} />
          <Route path="sections/articles/:id" element={<ArticleReadPage />} />
          <Route path="sections/:category/new" element={<ArticleEditorPage />} />
          <Route path="sections/:category" element={<SectionDetailPage />} />
          <Route path="forum" element={<ForumPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="communities" element={<CommunitiesPage />} />
          <Route path="ai" element={<AIPage />} />
          <Route path="messages" element={<PrivateRoute><MessagesPage /></PrivateRoute>} />
          <Route path="reminders" element={<PrivateRoute><RemindersPage /></PrivateRoute>} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
}
