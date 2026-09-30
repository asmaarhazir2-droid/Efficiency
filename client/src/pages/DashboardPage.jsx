import { useEffect, useState } from 'react';
import SidebarNav from '../components/SidebarNav';
import { addUserEntry, getUserDropdowns } from '../firebase/services';

const DashboardPage = ({ user }) => {
  const [dropdowns, setDropdowns] = useState([]);
  const [selected, setSelected] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchDropdowns = async () => {
      const rows = await getUserDropdowns(user.id);
      setDropdowns(rows);
    };
    fetchDropdowns();
  }, [user.id]);

  const handleChange = (id, value, category) => {
    setSelected((prev) => ({ ...prev, [id]: { value, category } }));
  };

  const handleSubmit = async () => {
    const entries = Object.entries(selected);
    try {
      await Promise.all(entries.map(([dropdown_id, { value, category }]) => (
        addUserEntry({
          user_id: user.id,
          dropdown_id,
          selected_value: value,
          category
        })
      )));
      setMessage('Sélection enregistrée.');
    } catch (err) {
      setMessage('Erreur lors de l’enregistrement.');
    }
  };

  return (
    <div className="app-shell">
      <SidebarNav />
      <div className="page app-main">
        <header className="topbar">
          <h1>Mon Espace</h1>
          <div>
            <span>{user?.email}</span>
          </div>
        </header>

        <div className="content">
          <section id="add-data" className="card">
          <h2>Liste déroulante personnalisée</h2>
          {dropdowns.length === 0 ? (
            <p>Aucune option disponible pour votre compte.</p>
          ) : (
            dropdowns.map((dropdown) => (
              <div key={dropdown.id} className="field">
                <label>{dropdown.category} - {dropdown.label}</label>
                <select onChange={(e) => handleChange(dropdown.id, e.target.value, dropdown.category)}>
                  <option value="">Sélectionner...</option>
                  <option value={dropdown.value}>{dropdown.label}</option>
                </select>
              </div>
            ))
          )}
            <button onClick={handleSubmit}>Valider</button>
            {message && <p className="info">{message}</p>}
          </section>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
