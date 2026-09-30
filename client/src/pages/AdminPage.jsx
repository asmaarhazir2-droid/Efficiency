import { useEffect, useState } from 'react';
import SidebarNav from '../components/SidebarNav';
import { addDropdownOption, getAdminDropdowns } from '../firebase/services';

const AdminPage = ({ user }) => {
  const [dropdowns, setDropdowns] = useState([]);
  const [form, setForm] = useState({ label: '', value: '', category: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchDropdowns = async () => {
      const rows = await getAdminDropdowns(user);
      setDropdowns(rows);
    };
    fetchDropdowns();
  }, [user]);

  const handleAdd = async () => {
    try {
      await addDropdownOption(user, form);
      setMessage('Option ajoutée. Rechargez la page pour voir le changement.');
      const rows = await getAdminDropdowns(user);
      setDropdowns(rows);
      setForm({ label: '', value: '', category: '' });
    } catch (err) {
      setMessage(err?.message || 'Erreur lors de l’ajout');
    }
  };

  return (
    <div className="app-shell">
      <SidebarNav />
      <div className="page app-main">
        <header className="topbar">
          <h1>Administration</h1>
          <div>
            <span>{user?.email}</span>
          </div>
        </header>

        <div className="content">
          <section className="card">
          <h2>Mes listes déroulantes</h2>
          {dropdowns.length === 0 ? <p>Aucune option enregistrée.</p> : (
            dropdowns.map((item) => (
              <div key={item.id} className="admin-row">
                <span>{item.category}: {item.label}</span>
              </div>
            ))
          )}
          </section>

          <section className="card">
            <h2>Ajouter une option</h2>
            <label>Catégorie</label>
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <label>Libellé</label>
            <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            <label>Valeur</label>
            <input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
            <button onClick={handleAdd}>Ajouter</button>
            {message && <p className="info">{message}</p>}
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
