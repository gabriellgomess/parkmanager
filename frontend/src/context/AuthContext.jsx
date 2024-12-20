// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(sessionStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [config, setConfig] = useState(null); // Estado para a configuração
  const navigate = useNavigate();

  // Função para carregar o config.json
  const loadConfig = async () => {
    try {
      const response = await axios.get('/config.json'); // Caminho para o config.json no public
      setConfig(response.data);
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post(`${config.APP_URL}/api/login`, { email, password });
      const { token } = response.data;
      sessionStorage.setItem('token', token);
      setAuthToken(token);
      getUser();
      // navigate('/dashboard');
      navigate('/entradas-saidas');
    } catch (err) {
      setError('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const getUser = async () => {
    let tokenProfile = sessionStorage.getItem('token');
    try {
      const response = await axios.get(`${config.APP_URL}/api/profile`, {
        headers: {
          Authorization: `Bearer ${tokenProfile}`,
        },
      });
      setUser(response.data.data);
    } catch (err) {
      console.info("Get User: ", err);
    }
  };

  useEffect(() => {
    loadConfig(); // Carrega a configuração ao iniciar
  }, []);

  useEffect(() => {
    if (authToken && config) {
      getUser();
    }
  }, [authToken, config]); // Executa getUser somente quando config está disponível

  const logout = async () => {
    try {
      await axios.post(`${config.APP_URL}/api/logout`, {}, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      sessionStorage.removeItem('token');
      setAuthToken(null);
      setUser(null);
      navigate('/');
    } catch (err) {
      setError('Erro ao fazer logout');
    }
  };

  if (!config) return <p>Carregando configuração...</p>; // Exibe loading até o config estar disponível

  return (
    <AuthContext.Provider value={{ authToken, login, logout, user, loading, error, config }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
