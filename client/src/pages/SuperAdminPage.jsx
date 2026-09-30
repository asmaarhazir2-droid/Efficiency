import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import SidebarNav from '../components/SidebarNav';
import { getStatistics } from '../firebase/services';

const SuperAdminPage = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const data = await getStatistics();
      setStats(data);
    };
    fetchStats();
  }, []);

  return (
    <div className="app-shell">
      <SidebarNav />
      <div className="page app-main">
        <header className="topbar">
          <h1>Tableau de bord Super Admin</h1>
        </header>

        <div className="content">
          <section className="card">
          <h2>Statistiques globales</h2>
          {!stats ? (
            <p>Chargement...</p>
          ) : (
            <>
              <div className="stats-grid">
                <div className="stat-card">Utilisateurs : {stats.totalUsers}</div>
                <div className="stat-card">Options : {stats.totalOptions}</div>
                <div className="stat-card">Entrées : {stats.totalEntries}</div>
              </div>
              <div className="chart-card">
                <h3>Entrées par utilisateur</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.byUser}>
                    <XAxis dataKey="email" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="entries" fill="#4f46e5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminPage;
