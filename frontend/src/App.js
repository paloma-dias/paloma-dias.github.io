import { useState } from 'react';
import '@/App.css';
import Login from './pages/Login';
import DashboardComercio from './pages/DashboardComercio';
import DashboardAssociado from './pages/DashboardAssociado';

function App() {
  const [user, setUser] = useState(null);
  const [tipo, setTipo] = useState(null);

  const handleLogin = (userData, userTipo) => {
    setUser(userData);
    setTipo(userTipo);
  };

  const handleLogout = () => {
    setUser(null);
    setTipo(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (tipo === 'comercio') {
    return <DashboardComercio user={user} onLogout={handleLogout} />;
  }

  if (tipo === 'associado') {
    return <DashboardAssociado user={user} onLogout={handleLogout} />;
  }

  return null;
}

export default App;