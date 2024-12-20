import { useContext, useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, CardHeader, IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

import Terminais from '../components/Terminais';

const Dashboard = () => {
  const { config } = useContext(AuthContext);
  const [vagas, setVagas] = useState(0); // Vagas ocupadas
  const [vagasLivres, setVagasLivres] = useState(0); // Vagas livres
  const [ocupacaoPercentual, setOcupacaoPercentual] = useState(0); // Porcentagem de ocupação
  const [totalVagas, setTotalVagas] = useState(1200); // Total de vagas

  const patio = () => {
    axios
      .get(`${config.APP_URL}/api/patio`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      })
      .then((response) => {
        const vagasOcupadas = response.data.patio; // Supondo que API retorna vagas ocupadas
        const vagasLivresCalculadas = totalVagas - vagasOcupadas;
        const ocupacaoPercentualCalculada = ((vagasOcupadas / totalVagas) * 100).toFixed(2);

        // Atualiza os estados com base nos cálculos
        setVagas(vagasOcupadas);
        setVagasLivres(vagasLivresCalculadas);
        setOcupacaoPercentual(ocupacaoPercentualCalculada);
      })
      .catch((error) => {
        console.error('Houve um erro ao buscar as vagas:', error);
      });
  };

  useEffect(() => {
    patio(); // Chamada inicial
    const interval = setInterval(patio, 10000); // Chamada periódica

    return () => clearInterval(interval); // Limpeza ao desmontar
  }, [config.APP_URL]);

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        gap: '20px',
        justifyContent: 'center',
        flexDirection: { xs: 'column', md: 'row' },
      }}
    >
      <Box sx={{ display: 'flex', width: { xs: '100%', md: '55%' } }}>
        <Terminais />
      </Box>
      <Box
        sx={{
          display: 'flex',
          width: { xs: '100%', md: '42%' },
          gap: '20px',
          flexWrap: 'wrap',
          alignItems: 'start',
          justifyContent: 'start',
        }}
      >
        <Card sx={{ width: '100%', height: '220px', backgroundColor: '#33eb91' }}>
          <CardHeader title="Vagas livres" subheader="Vagas livres para estacionar" />
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h1" color="text.primary">
              {vagasLivres} <span style={{ fontSize: '36px' }}>({(100 - ocupacaoPercentual).toFixed(2)}%)</span>
            </Typography>
          </CardContent>
        </Card>
        <Card
          sx={{
            flexGrow: 1,
            width: { xs: '100%', md: 'auto' },
            height: '150px',
            backgroundColor: '#33c9dc',
          }}
        >
          <CardHeader
            title="Total de Vagas"
            action={
              <IconButton aria-label="settings">
                <MoreVertIcon />
              </IconButton>
            }
          />
          <CardContent sx={{ textAlign: 'right' }}>
            <Typography variant="h4" color="text.primary">
              {totalVagas}
            </Typography>
          </CardContent>
        </Card>
        <Card
          sx={{
            flexGrow: 1,
            width: { xs: '100%', md: 'auto' },
            height: '150px',
            backgroundColor: '#ffef62',
          }}
        >
          <CardHeader title="No pátio" />
          <CardContent sx={{ textAlign: 'right' }}>
            <Typography variant="h4" color="text.primary">
              {vagas} <span style={{ fontSize: '18px' }}>({ocupacaoPercentual}%)</span>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard;
