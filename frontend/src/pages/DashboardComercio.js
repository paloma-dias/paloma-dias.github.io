import { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function DashboardComercio({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('criar');
  const [cupons, setCupons] = useState([]);
  const [filtro, setFiltro] = useState('ativos');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    tit_cupom: '',
    dta_inicio_cupom: '',
    dta_termino_cupom: '',
    per_desc_cupom: '',
    qtd_cupons: ''
  });

  useEffect(() => {
    if (activeTab === 'listar' || activeTab === 'registrar') {
      carregarCupons();
    }
  }, [activeTab, filtro]);

  const carregarCupons = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/cupons`, {
        params: {
          cnpj: user.cnpj_comercio,
          filtro: filtro
        }
      });
      setCupons(response.data);
    } catch (err) {
      setMessage('Erro ao carregar cupons');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCriarCupom = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post(`${API}/cupons`, formData, {
        params: { cnpj: user.cnpj_comercio }
      });

      if (response.data.success) {
        setMessage(`Sucesso! ${response.data.message}`);
        setFormData({
          tit_cupom: '',
          dta_inicio_cupom: '',
          dta_termino_cupom: '',
          per_desc_cupom: '',
          qtd_cupons: ''
        });
      }
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Erro ao criar cupom');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrarUso = async (numCupom) => {
    if (!window.confirm('Confirma o uso deste cupom?')) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API}/cupons/registrar-uso`, null, {
        params: {
          num_cupom: numCupom,
          cnpj: user.cnpj_comercio
        }
      });

      if (response.data.success) {
        alert('Uso registrado com sucesso!');
        carregarCupons();
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao registrar uso');
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
              {user.nom_fantasia_comercio}
            </h1>
            <p style={{ color: '#6b7280' }}>CNPJ: {user.cnpj_comercio}</p>
          </div>
          <button className="btn btn-secondary" onClick={onLogout}>
            Sair
          </button>
        </div>
      </div>

      <div className="container">
        <div className="tabs">
          <button className={`tab ${activeTab === 'criar' ? 'active' : ''}`} onClick={() => setActiveTab('criar')}>
            Criar Cupons
          </button>
          <button className={`tab ${activeTab === 'listar' ? 'active' : ''}`} onClick={() => setActiveTab('listar')}>
            Listar Cupons
          </button>
          <button className={`tab ${activeTab === 'registrar' ? 'active' : ''}`} onClick={() => setActiveTab('registrar')}>
            Registrar Uso
          </button>
        </div>

        {activeTab === 'criar' && (
          <div className="card">
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
              Criar Novos Cupons
            </h2>

            {message && (
              <div className={`alert ${message.includes('Sucesso') ? 'alert-success' : 'alert-error'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleCriarCupom}>
              <div className="form-group">
                <label className="label">Título da Promoção</label>
                <input
                  type="text"
                  name="tit_cupom"
                  className="input"
                  value={formData.tit_cupom}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2">
                <div className="form-group">
                  <label className="label">Data de Início</label>
                  <input
                    type="date"
                    name="dta_inicio_cupom"
                    className="input"
                    value={formData.dta_inicio_cupom}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label">Data de Término</label>
                  <input
                    type="date"
                    name="dta_termino_cupom"
                    className="input"
                    value={formData.dta_termino_cupom}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2">
                <div className="form-group">
                  <label className="label">Percentual de Desconto (%)</label>
                  <input
                    type="number"
                    name="per_desc_cupom"
                    className="input"
                    value={formData.per_desc_cupom}
                    onChange={handleChange}
                    min="1"
                    max="100"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label">Quantidade de Cupons</label>
                  <input
                    type="number"
                    name="qtd_cupons"
                    className="input"
                    value={formData.qtd_cupons}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Criando...' : 'Criar Cupons'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'listar' && (
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
            ) : cupons.length === 0 ? (
              <div className="card">
                <p>Nenhum cupom encontrado</p>
              </div>
            ) : (
              cupons.map((cupom) => (
                <div key={cupom.num_cupom} className="cupom-card">
                  <h3>{cupom.tit_cupom}</h3>
                  <p><strong>Código:</strong> {cupom.num_cupom}</p>
                  <p><strong>Desconto:</strong> {cupom.per_desc_cupom}%</p>
                  <p><strong>Período:</strong> {cupom.dta_inicio_cupom} a {cupom.dta_termino_cupom}</p>
                  <p><strong>Emissão:</strong> {cupom.dta_emissao_cupom}</p>
                  {cupom.dta_uso && (
                    <>
                      <p><strong>Usado em:</strong> {cupom.dta_uso}</p>
                      <p><strong>CPF Associado:</strong> {cupom.cpf_associado}</p>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'registrar' && (
          <div>
            <div className="card">
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>
                Registrar Uso de Cupom
              </h2>
              <p style={{ color: '#6b7280' }}>
                Clique em "Registrar Uso" quando o associado apresentar o cupom
              </p>
            </div>

            {loading ? (
              <p>Carregando...</p>
            ) : cupons.length === 0 ? (
              <div className="card">
                <p>Nenhum cupom reservado disponível</p>
              </div>
            ) : (
              cupons.map((cupom) => (
                <div key={cupom.num_cupom} className="cupom-card">
                  <h3>{cupom.tit_cupom}</h3>
                  <p><strong>Código:</strong> {cupom.num_cupom}</p>
                  <p><strong>Desconto:</strong> {cupom.per_desc_cupom}%</p>
                  <p><strong>Válido até:</strong> {cupom.dta_termino_cupom}</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleRegistrarUso(cupom.num_cupom)}
                    style={{ marginTop: '12px' }}
                  >
                    Registrar Uso
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardComercio;
