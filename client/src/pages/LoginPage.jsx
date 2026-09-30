import { useState } from 'react';
import { login } from '../utils/auth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const user = await login(email, password);
      window.location.href = user.role === 'superadmin' ? '/superadmin' : '/dashboard';
    } catch (err) {
      setError(err?.message || 'Erreur de connexion');
    }
  };

  return (
    <div className="page center-page">
      <div className="card">
        <h1>Connexion</h1>
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label>Mot de passe</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <div className="error">{error}</div>}
          <button type="submit">Se connecter</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
