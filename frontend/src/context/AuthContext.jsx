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
  const navigate = useNavigate(); // Hook para redirecionamento

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_REACT_APP_URL}/api/login`, { email, password });
      const { token } = response.data;
      sessionStorage.setItem('token', token);
      setAuthToken(token);
      getUser();
      navigate('/dashboard');
    } catch (err) {
      setError('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const getUser = async () => {
    let tokenProfile = sessionStorage.getItem('token');
    try {
      const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/profile`, {
        headers: {
          Authorization: `Bearer ${tokenProfile}`,
        },
      });
      setUser(response.data.data);
    } catch (err) {
      console.info("Get User: ", err);
    }
  }

  useEffect(() => {
    if (authToken) {
      getUser();
    }
  }, [authToken]);


  const logout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_REACT_APP_URL}/api/logout`, {}, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      sessionStorage.removeItem('token');
      setAuthToken(null);
      setUser(null);
      navigate('/'); // Redirecionar para a página pública após o logout
    } catch (err) {
      setError('Erro ao fazer logout');
    }
  };

  return (
    <AuthContext.Provider value={{ authToken, login, logout, user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
