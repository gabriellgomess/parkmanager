// src/pages/Home.jsx
import { useState, useContext } from 'react';
import { Button, Modal, TextField, Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import AuthContext from '../context/AuthContext';
import BgHome from '../assets/bg-home.jpg';

const Home = () => {
  const [open, setOpen] = useState(false);
  const { login, loading, error } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const theme = useTheme();
  // const isXs = useMediaQuery(theme.breakpoints.down('xs'));
  const isSm = useMediaQuery(theme.breakpoints.up('sm'));
  const isMd = useMediaQuery(theme.breakpoints.up('md'));
  const isLg = useMediaQuery(theme.breakpoints.up('lg'));
  const isXl = useMediaQuery(theme.breakpoints.up('xl'));

  let variant = 'h5'; // Default para xs

  if (isXl) {
    variant = 'h2';
  } else if (isLg) {
    variant = 'h2';
  } else if (isMd) {
    variant = 'h3';
  } else if (isSm) {
    variant = 'h4';
  }

  const handleLogin = async () => {
    await login(email, password);
    setOpen(false);  // Fecha modal após login
  };

  return (
    <div style={{ backgroundImage: `url(${BgHome})`, backgroundSize: 'cover', backgroundPositionX: '50%', backgroundPositionY: '50%', width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', justifyContent: 'end', padding: '20px 30px 0 0 ' }}>
        <Button onClick={() => setOpen(true)} variant="contained">Login</Button>
      </div>

      <Box sx={{
        background: 'rgba(1, 1, 1, 0.33)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(8.7px)',
        padding: '20px',
      }}>
        <Typography
          variant={variant}
          align="center"
          style={{
            color: '#fff',
            textShadow: '4px 4px 3px rgba(0,0,0,0.5)',
          }}
        >
          {`${import.meta.env.VITE_REACT_APP_TITLE_HOME}`}
        </Typography>
        <Typography variant="h6" align="center" style={{ color: '#fff', textShadow: '4px 4px 3px rgba(0,0,0,0.5)' }}>
          {`${import.meta.env.VITE_REACT_APP_SUBTITLE_HOME}`}
        </Typography>
      </Box>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" align="center" style={{ color: '#fff', textShadow: '4px 4px 3px rgba(0,0,0,0.5)' }}>
          &copy; NexusTech {new Date().getFullYear()} - Todos os direitos reservados
        </Typography>
      </Box>


      <Modal open={open} onClose={() => setOpen(false)} sx={{ position: 'absolute', top: '40%' }}>
        <Box sx={{ padding: 3, backgroundColor: '#fff', margin: 'auto', width: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <TextField label="Email" fullWidth onChange={(e) => setEmail(e.target.value)} />
          <TextField label="Senha" type="password" fullWidth onChange={(e) => setPassword(e.target.value)} />
          <Button variant="contained" fullWidth onClick={handleLogin} disabled={loading}>
            {loading ? 'Carregando...' : 'Entrar'}
          </Button>
          <Typography variant='caption'>admin@admin | Nexus@2024</Typography>
          {error && <Typography>{error}</Typography>}
        </Box>
      </Modal>
    </div>
  );
};

export default Home;
