import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
} from '@mui/material';
import AuthContext from '../context/AuthContext';
import alertaSound from '../assets/alerta.mp3'; // Importa o arquivo de som

const PlacasIndesejadas = () => {
  const [placas, setPlacas] = useState([]);
  const [lastIds, setLastIds] = useState([]); // IDs processados anteriormente
  const [audioEnabled, setAudioEnabled] = useState(false); // Controle para áudio autorizado
  const { config } = useContext(AuthContext);

  const BuscaPlacas = () => {
    axios
      .get(`${config.APP_URL}/api/blacklist`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      })
      .then((response) => {
        processPlacas(response.data);
      })
      .catch((error) => {
        console.error('Houve um erro ao buscar as placas:', error);
      });
  };

  const processPlacas = (data) => {
    // Identifica novas placas
    const novasPlacas = data.filter((placa) => !lastIds.includes(placa.id));

    if (novasPlacas.length > 0 && audioEnabled) {
      // Toca som de alerta se houver novas placas e áudio estiver autorizado
      playAlertSound();
    }

    // Atualiza o estado com novas placas e IDs processados
    setPlacas(data);
    setLastIds(data.map((placa) => placa.id));
  };

  const playAlertSound = () => {
    const alertSound = new Audio(alertaSound);
    alertSound.play().catch((error) => console.error('Erro ao tocar o som:', error));
  };

  const enableAudio = () => {
    // O botão interage com o documento e desbloqueia a reprodução de áudio
    const alertSound = new Audio(alertaSound);
    alertSound.play().catch(() => {
      console.log('Áudio autorizado, aguardando eventos futuros.');
    });
    setAudioEnabled(true);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      BuscaPlacas();
    }, 5000);

    return () => clearInterval(interval); // Limpeza do intervalo ao desmontar
  }, [config.APP_URL]);

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" sx={{ marginBottom: 2 }}>
        Placas Indesejadas
      </Typography>

      {!audioEnabled && (
        <Box sx={{ textAlign: 'center', marginBottom: 2 }}>
          <Button variant="contained" color="primary" onClick={enableAudio}>
            Ativar Áudio
          </Button>
        </Box>
      )}

      <TableContainer component={Paper} sx={{ height: 300, width: '100%' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center"><strong>Placa</strong></TableCell>
              <TableCell align="center"><strong>Motivo</strong></TableCell>
              <TableCell align="center"><strong>Estação</strong></TableCell>
              <TableCell align="center"><strong>Evento</strong></TableCell>
              <TableCell align="center"><strong>Momento</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {placas.map((placa, index) => (
              <TableRow key={index}>
                <TableCell align="center">{placa.placa}</TableCell>
                <TableCell align="center">{placa.motivo}</TableCell>
                <TableCell align="center">{placa.estacao.trim()}</TableCell>
                <TableCell align="center">{placa.evento}</TableCell>
                <TableCell align="center">
                  {new Date(placa.momento).toLocaleString('pt-BR')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PlacasIndesejadas;
