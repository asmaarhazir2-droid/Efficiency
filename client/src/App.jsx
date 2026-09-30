import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import SuperAdminPage from './pages/SuperAdminPage';
import { subscribeToAuth } from './utils/auth';

const App = () => {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsubscribe = subscribeToAuth(setUser);
    return () => unsubscribe();
  }, []);

  if (user === undefined) {
    return (
      <div className="page center-page">
        <div className="card">Chargement...</div>
      </div>
    );
  }

  const defaultPath = user?.role === 'superadmin' ? '/superadmin' : '/dashboard';

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={defaultPath} /> : <LoginPage />} />
      <Route path="/dashboard" element={user ? <DashboardPage user={user} /> : <Navigate to="/" />} />
      <Route path="/admin" element={user ? <AdminPage user={user} /> : <Navigate to="/" />} />
      <Route path="/superadmin" element={user && user.role === 'superadmin' ? <SuperAdminPage /> : <Navigate to={user ? '/dashboard' : '/'} />} />
    </Routes>
  );
};

export default App;
