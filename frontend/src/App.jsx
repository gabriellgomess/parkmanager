// src/App.jsx
import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import EntradasSaidas from './pages/EntradasSaidas';
import ValidacaoHiper from './pages/ValidacaoHiper';
import Credenciados from './pages/Credenciados';
import Pagamentos from './pages/Pagamentos';
import Users from './pages/Users';

const App = () => {
  useEffect(() => {
    // Modifica o título da página utilizando a variável de ambiente
    document.title = import.meta.env.VITE_APP_TITLE || 'Sistama';
  }, []);
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <Layout>
                <Users />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/entradas-saidas"
          element={
            <PrivateRoute>
              <Layout>
                <EntradasSaidas />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
        path="/validacao-hiper"
        element={
          <PrivateRoute>
            <Layout>
              <ValidacaoHiper />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/credenciados"
        element={
          <PrivateRoute>
            <Layout>
              <Credenciados />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/pagamentos"
        element={
          <PrivateRoute>
            <Layout>
              <Pagamentos />
            </Layout>
          </PrivateRoute>
        }
      />
      </Routes>      
    </AuthProvider>
  );
};

export default App;
