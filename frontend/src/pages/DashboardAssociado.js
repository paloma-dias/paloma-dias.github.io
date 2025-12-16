import { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function DashboardAssociado({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('buscar');
  const [cuponsDisponiveis, setCuponsDisponiveis] = useState([]);
  const [cuponsReservados, setCuponsReservados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [filtro, setFiltro] = useState('ativos');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    carregarCategorias();
  }, []);

  useEffect(() => {
    if (activeTab === 'buscar') {
      carregarCuponsDisponiveis();
    } else if (activeTab === 'meus') {
      carregarCuponsReservados();
    }
  }, [activeTab, categoriaFiltro, filtro]);

  const carregarCategorias = async () => {
    try {
      const response = await axios.get(`${API}/categorias`);
      setCategorias(response.data);
    } catch (err) {
      console.error('Erro ao carregar categorias');
    }
  };

  const carregarCuponsDisponiveis = async () => {
    setLoading(true);
    try {
      const params = {};
      if (categoriaFiltro) {
        params.categoria = categoriaFiltro;
      }
      const response = await axios.get(`${API}/cupons/disponiveis`, { params });
      setCuponsDisponiveis(response.data);
    } catch (err) {
      setMessage('Erro ao carregar cupons');
    } finally {
      setLoading(false);
    }
  };

  const carregarCuponsReservados = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/cupons/reservados`, {
        params: {
          cpf: user.cpf_associado,
          filtro: filtro
        }
      });
      setCuponsReservados(response.data);
    } catch (err) {
      setMessage('Erro ao carregar cupons reservados');
    } finally {
      setLoading(false);
    }
  };

  const handleReservar = async (numCupom) => {
    if (!window.confirm('Deseja reservar este cupom?')) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API}/cupons/reservar`, null, {
        params: {
          num_cupom: numCupom,
          cpf: user.cpf_associado
        }
      });

      if (response.data.success) {
        alert('Cupom reservado com sucesso!');
        carregarCuponsDisponiveis();
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao reservar cupom');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="header">
        <div className="header-content">
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>
              {user.nom_associado}
            </h1>
            <p style={{ color: '#6b7280' }}>CPF: {user.cpf_associado}</p>
          </div>
          <button className="btn btn-secondary" onClick={onLogout}>
            Sair
          </button>
        </div>
      </div>

      <div className="container">
        <div className="tabs">
          <button className={`tab ${activeTab === 'buscar' ? 'active' : ''}`} onClick={() => setActiveTab('buscar')}>
            Buscar Cupons
          </button>
          <button className={`tab ${activeTab === 'meus' ? 'active' : ''}`} onClick={() => setActiveTab('meus')}>
            Meus Cupons
          </button>
        </div>

        {activeTab === 'buscar' && (
          <div>
            <div className="card">
              <label className="label">Filtrar por Categoria</label>
              <select className="input" value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)}>
                <option value="">Todas as Categorias</option>
                {categorias.map((cat) => (
                  <option key={cat.id_categoria} value={cat.id_categoria}>
                    {cat.nom_categoria}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <p>Carregando...</p>
            ) : cuponsDisponiveis.length === 0 ? (
              <div className="card">
                <p>Nenhum cupom disponível no momento</p>
              </div>
            ) : (
              cuponsDisponiveis.map((cupom) => (
                <div key={cupom.num_cupom} className="cupom-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h3>{cupom.tit_cupom}</h3>
                      <p><strong>Estabelecimento:</strong> {cupom.nom_fantasia_comercio}</p>
                      <p><strong>Categoria:</strong> {cupom.nom_categoria}</p>
                      <p><strong>Desconto:</strong> {cupom.per_desc_cupom}%</p>
                      <p><strong>Válido até:</strong> {cupom.dta_termino_cupom}</p>
                      <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                        Código: {cupom.num_cupom}
                      </p>
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleReservar(cupom.num_cupom)}
                      disabled={loading}
                    >
                      Reservar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'meus' && (
          <div>
            <div className="card">
              <label className="label">Filtrar por</label>
              <select className="input" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
                <option value="ativos">Cupons Ativos</option>
                <option value="utilizados">Cupons Utilizados</option>
                <option value="vencidos">Cupons Vencidos</option>
              </select>
            </div>

            {loading ? (
              <p>Carregando...</p>
            ) : cuponsReservados.length === 0 ? (
              <div className="card">
                <p>Nenhum cupom encontrado</p>
              </div>
            ) : (
              cuponsReservados.map((reserva) => {
                const cupom = reserva.cupom_info;
                const usado = reserva.dta_uso_cupom_associado;
                const vencido = cupom.dta_termino_cupom < new Date().toISOString().split('T')[0];

                return (
                  <div key={reserva.id_cupom_associado} className="cupom-card">
                    <div style={{ marginBottom: '12px' }}>
                      {usado && <span className="badge badge-danger">Utilizado</span>}
                      {!usado && vencido && <span className="badge badge-warning">Vencido</span>}
                      {!usado && !vencido && <span className="badge badge-success">Ativo</span>}
                    </div>

                    <h3>{cupom.tit_cupom}</h3>
                    <p><strong>Estabelecimento:</strong> {cupom.nom_fantasia_comercio}</p>
                    <p><strong>Categoria:</strong> {cupom.nom_categoria}</p>
                    <p><strong>Desconto:</strong> {cupom.per_desc_cupom}%</p>
                    <p><strong>Válido até:</strong> {cupom.dta_termino_cupom}</p>
                    <p><strong>Reservado em:</strong> {reserva.dta_cupom_associado}</p>

                    {usado && (
                      <p><strong>Utilizado em:</strong> {reserva.dta_uso_cupom_associado}</p>
                    )}

                    <div style={{ 
                      marginTop: '16px', 
                      padding: '12px', 
                      background: '#f3f4f6', 
                      borderRadius: '6px',
                      textAlign: 'center'
                    }}>
                      <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                        Código do Cupom
                      </p>
                      <p style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '2px' }}>
                        {cupom.num_cupom}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardAssociado;
