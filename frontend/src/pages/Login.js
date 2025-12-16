import { useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Login({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [tipo, setTipo] = useState('associado');
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API}/auth/login`, {
        identificador: formData.identificador,
        senha: formData.senha,
        tipo: tipo
      });

      if (response.data.success) {
        onLogin(response.data.user, response.data.tipo);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = tipo === 'associado' ? '/auth/register/associado' : '/auth/register/comercio';
      const response = await axios.post(`${API}${endpoint}`, formData);

      if (response.data.success) {
        alert('Cadastro realizado com sucesso! Faça login.');
        setMode('login');
        setFormData({});
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao realizar cadastro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '24px', fontSize: '28px', fontWeight: '700' }}>
          Sistema de Cupons
        </h1>

        <div className="tabs">
          <button className={`tab ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>
            Login
          </button>
          <button className={`tab ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>
            Cadastrar
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label className="label">Tipo de Usuário</label>
          <select className="input" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="associado">Associado</option>
            <option value="comercio">Comércio</option>
          </select>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {mode === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="label">{tipo === 'associado' ? 'CPF' : 'CNPJ'}</label>
              <input
                type="text"
                name="identificador"
                className="input"
                required
                onChange={handleChange}
                placeholder={tipo === 'associado' ? '000.000.000-00' : '00.000.000/0000-00'}
              />
            </div>

            <div className="form-group">
              <label className="label">Senha</label>
              <input
                type="password"
                name="senha"
                className="input"
                required
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            {tipo === 'associado' ? (
              <>
                <div className="form-group">
                  <label className="label">CPF</label>
                  <input type="text" name="cpf_associado" className="input" required onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="label">Nome Completo</label>
                  <input type="text" name="nom_associado" className="input" required onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="label">Data de Nascimento</label>
                  <input type="date" name="dtn_associado" className="input" required onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="label">Endereço</label>
                  <input type="text" name="end_associado" className="input" required onChange={handleChange} />
                </div>
                <div className="grid grid-cols-2">
                  <div className="form-group">
                    <label className="label">Bairro</label>
                    <input type="text" name="bai_associado" className="input" required onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="label">CEP</label>
                    <input type="text" name="cep_associado" className="input" required onChange={handleChange} />
                  </div>
                </div>
                <div className="grid grid-cols-2">
                  <div className="form-group">
                    <label className="label">Cidade</label>
                    <input type="text" name="cid_associado" className="input" required onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="label">UF</label>
                    <input type="text" name="uf_associado" className="input" maxLength="2" required onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">Celular</label>
                  <input type="text" name="cel_associado" className="input" required onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="label">Email</label>
                  <input type="email" name="email_associado" className="input" required onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="label">Senha</label>
                  <input type="password" name="sen_associado" className="input" required onChange={handleChange} />
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label className="label">CNPJ</label>
                  <input type="text" name="cnpj_comercio" className="input" required onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="label">Razão Social</label>
                  <input type="text" name="raz_social_comercio" className="input" required onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="label">Nome Fantasia</label>
                  <input type="text" name="nom_fantasia_comercio" className="input" required onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="label">Categoria</label>
                  <select name="id_categoria" className="input" required onChange={handleChange}>
                    <option value="">Selecione</option>
                    <option value="cat001">Alimentação</option>
                    <option value="cat002">Vestuário</option>
                    <option value="cat003">Eletrônicos</option>
                    <option value="cat004">Saúde e Beleza</option>
                    <option value="cat005">Serviços</option>
                    <option value="cat006">Outros</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Endereço</label>
                  <input type="text" name="end_comercio" className="input" required onChange={handleChange} />
                </div>
                <div className="grid grid-cols-2">
                  <div className="form-group">
                    <label className="label">Bairro</label>
                    <input type="text" name="bai_comercio" className="input" required onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="label">CEP</label>
                    <input type="text" name="cep_comercio" className="input" required onChange={handleChange} />
                  </div>
                </div>
                <div className="grid grid-cols-2">
                  <div className="form-group">
                    <label className="label">Cidade</label>
                    <input type="text" name="cid_comercio" className="input" required onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="label">UF</label>
                    <input type="text" name="uf_comercio" className="input" maxLength="2" required onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">Telefone de Contato</label>
                  <input type="text" name="con_comercio" className="input" required onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="label">Email</label>
                  <input type="email" name="email_comercio" className="input" required onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="label">Senha</label>
                  <input type="password" name="sen_comercio" className="input" required onChange={handleChange} />
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Login;