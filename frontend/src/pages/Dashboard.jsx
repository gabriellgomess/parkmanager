import { useContext, useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Modal,
  TextField,
  Button,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

import Terminais from '../components/Terminais';
import PlacasIndesejadas from '../components/PlacasIndesejadas';
import { useParams } from 'react-router-dom';

const Dashboard = () => {
  const { ip } = useContext(AuthContext);
  const [vagas, setVagas] = useState(0); // Vagas ocupadas
  const [vagasLivres, setVagasLivres] = useState(0); // Vagas livres
  const [ocupacaoPercentual, setOcupacaoPercentual] = useState(0); // Porcentagem de ocupação
  const [totalVagas, setTotalVagas] = useState(0); // Total de vagas
  const [isModalOpen, setIsModalOpen] = useState(false); // Controle do modal
  const [newTotalVagas, setNewTotalVagas] = useState(totalVagas); // Novo valor temporário


  // Função para buscar o total de vagas na API
  const fetchTotalVagas = () => {
    axios
      .get(`http://${ip}/api/vagas`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      })
      .then((response) => {
        setTotalVagas(response.data.vagas); // Supondo que a API retorna o total de vagas
        setNewTotalVagas(response.data.vagas); // Atualiza o valor temporário também
      })
      .catch((error) => {
        console.error('Erro ao buscar total de vagas:', error);
      });
  };

  // Função para buscar dados do pátio
  const patio = () => {
    axios
      .get(`http://${ip}/api/patio`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      })
      .then((response) => {
        const vagasOcupadas = response.data.patio ? response.data.patio : 0; // Supondo que API retorna vagas ocupadas
        const vagasLivresCalculadas = totalVagas - vagasOcupadas;
        const ocupacaoPercentualCalculada = ((vagasOcupadas / totalVagas) * 100).toFixed(2);

        setVagas(vagasOcupadas);
        setVagasLivres(vagasLivresCalculadas);
        setOcupacaoPercentual(ocupacaoPercentualCalculada);
      })
      .catch((error) => {
        console.error('Erro ao buscar vagas do pátio:', error);
      });
  };

  // Atualiza o total de vagas
  const updateTotalVagas = () => {
    axios
      .put(
        `http://${ip}/api/vagas`,
        { vagas: newTotalVagas },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          },
        }
      )
      .then(() => {
        setTotalVagas(newTotalVagas);
        setIsModalOpen(false);
      })
      .catch((error) => {
        console.error('Erro ao atualizar total de vagas:', error);
      });
  };

  useEffect(() => {
    fetchTotalVagas(); // Busca inicial do total de vagas
    patio(); // Busca inicial do pátio
    const interval = setInterval(patio, 10000); // Atualização periódica do pátio

    return () => clearInterval(interval); // Limpeza ao desmontar
  }, [totalVagas]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-center' }}>
      <Box
        sx={{
          display: 'flex',
          width: { xs: '100%', md: '50%' },
          gap: '20px',
          justifyContent: 'center',
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        {/* <Box sx={{ display: 'flex', width: { xs: '100%', md: '55%' } }}>
          <Terminais />
        </Box> */}
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            gap: '20px',
            flexWrap: 'wrap',
            alignItems: 'start',
            justifyContent: 'start',
            alignContent: 'start',
          }}
        >
          <Card sx={{ width: '100%', height: '220px', backgroundColor: '#33eb91' }}>
            <CardHeader title="Vagas livres" subheader="Vagas livres para estacionar" />
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h1" color="text.primary">
                {vagasLivres.toLocaleString('pt-BR')} <span style={{ fontSize: '36px' }}>({(100 - ocupacaoPercentual).toFixed(2)}%)</span>
              </Typography>
            </CardContent>
          </Card>
          <Card
            sx={{
              flexGrow: 1,
              maxWidth: { xs: '100%', md: '50%' },
              width: { xs: '100%', md: 'auto' },
              height: '150px',
              backgroundColor: '#33c9dc',
            }}
          >
            <CardHeader
              title="Total de Vagas"
              action={
                <IconButton
                  aria-label="settings"
                  onClick={() => setIsModalOpen(true)} // Abre o modal
                >
                  <MoreVertIcon />
                </IconButton>
              }
            />
            <CardContent sx={{ textAlign: 'right' }}>
              <Typography variant="h4" color="text.primary">
                {totalVagas.toLocaleString('pt-BR')}
              </Typography>
            </CardContent>
          </Card>
          <Card
            sx={{
              flexGrow: 1,
              maxWidth: { xs: '100%', md: '50%' },
              width: { xs: '100%', md: 'auto' },
              height: '150px',
              backgroundColor: '#ffef62',
            }}
          >
            <CardHeader title="No pátio" />
            <CardContent sx={{ textAlign: 'right' }}>
              <Typography variant="h4" color="text.primary">
                {vagas.toLocaleString('pt-BR')} <span style={{ fontSize: '18px' }}>({ocupacaoPercentual}%)</span>
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
      <Box>
        <PlacasIndesejadas />
      </Box>

      {/* Modal para edição do total de vagas */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="modal-title" variant="h6" component="h2">
            Editar Total de Vagas
          </Typography>
          <TextField
            fullWidth
            type="number"
            value={newTotalVagas}
            onChange={(e) => setNewTotalVagas(Number(e.target.value))}
            margin="normal"
            label="Total de Vagas"
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={() => setIsModalOpen(false)} sx={{ mr: 2 }}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={updateTotalVagas}>
              Salvar
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Dashboard;
