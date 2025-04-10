// src/components/Terminais.jsx
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Box, Card, Typography, Divider, Button, Modal, Backdrop } from '@mui/material';
import CenterFocusWeakIcon from '@mui/icons-material/CenterFocusWeak';
import CircularProgress from '@mui/material/CircularProgress';
import IconEntrada from '../assets/entrada.png';
import IconSaida from '../assets/saida.png';
import IconCaixa from '../assets/caixa.png';
import AuthContext from '../context/AuthContext';
import { useParams } from 'react-router-dom';

const Terminais = () => {
    const [terminais, setTerminais] = useState([]);
    const [open, setOpen] = useState(false);
    const [openBackdrop, setOpenBackdrop] = useState(false);
    const [ipt, setIpT] = useState('');
    const { config } = useContext(AuthContext); // Pega o config do contexto
    const hostname = window.location.hostname;
const port = window.location.port; 
const ip = port ? `${hostname}:${port}` : hostname;

    const handleOpen = (ipcam) => { 
        setOpen(true);
        setIpT(ipcam);
    };
    
    const handleClose = () => {
        setOpen(false);
        setIpT('');
    };

    const handleCloseBackdrop = () => {
        setOpenBackdrop(false);
    };

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    useEffect(() => {
        setOpenBackdrop(true);
        axios.get(`http://${ip}/api/terminais`, {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem('token')}`,
              },
        }) 
            .then((response) => {
                setOpenBackdrop(false);
                setTerminais(response.data);                
            })
            .catch((error) => {
                setOpenBackdrop(false);
                console.error('Houve um erro ao buscar os terminais:', error);
            });
    }, []); 

    // formata datetime para o padrão brasileiro
    const formatDateTime = (datetime) => {
        const date = new Date(datetime);
        return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
    };

    const formatVersion = (version) => {
        let v = version?.split(' ');
        let versao = v[0];
        return 'ParkingPlus ' + versao;
    };

    return (
        <Box sx={{display: 'flex', gap: '15px', flexWrap: 'wrap', width: '100%'}}>
            {
                terminais.map((terminal) => (
                    <>
                    <Card key={terminal.idestacao} sx={{width: '230px', padding: '10px', display: {xs:'none', sm: 'none', md: 'none', lg: 'none', xl: 'flex'}, flexDirection: 'column', gap: '10px'}}>
                        <Box sx={{display: 'flex', alignItems: 'end', gap: '20px'}}>                            
                            <img width={60} src={terminal.tipo === 8 ? IconEntrada : terminal.tipo === 10 ? IconSaida : IconCaixa} alt={terminal.tipo} />
                            <Typography variant='body2'>{terminal.descricao}</Typography>
                        </Box>                          
                        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                            <Box sx={{display: 'flex', flexDirection: 'column'}}>
                                <Typography variant='body2' >Tipo: {terminal.tipo === 8 ? 'Entrada' : terminal.tipo === 10 ? 'Saída' : 'Caixa'}</Typography>
                                <Typography variant='body2' sx={{color: terminal.status === 'online' ? 'green' : 'tomato'}}>Status: {terminal.status}</Typography>
                            </Box>
                            <Box>
                                {(terminal.tipo === 8 || terminal.tipo === 10) &&
                                    <Button size='small' variant="outlined" endIcon={<CenterFocusWeakIcon />} onClick={() => handleOpen(terminal.enderecoip)}>
                                        LPR
                                    </Button>
                                }
                            </Box>
                        </Box>
                        <Divider />
                        <Typography variant='caption' sx={{lineHeight: '7px'}}>IP {terminal.enderecoip}</Typography>
                        <Typography variant='caption' sx={{lineHeight: '7px'}}>Online desde: {formatDateTime(terminal.upsince)}</Typography>
                        {(terminal.tipo === 8 || terminal.tipo === 10) &&
                            <Typography variant='caption' sx={{lineHeight: '7px'}}>Versão: {formatVersion(terminal.versaoparkingplus)}</Typography>
                        }                        
                    </Card>
                    <Card key={terminal.upsince} sx={{width: '100%', padding: '10px', display: {xs:'flex', sm: 'flex', md: 'flex', lg: 'flex', xl: 'none'}, justifyContent: 'space-between', gap: '10px'}}>
                        <Box sx={{display: 'flex', alignItems: 'end', gap: '20px'}}>
                            <img width={40} src={terminal.tipo === 8 ? IconEntrada : terminal.tipo === 10 ? IconSaida : IconCaixa} alt={terminal.tipo} />
                            <Typography variant='body2'>{terminal.descricao}</Typography>
                        </Box>
                        <Box sx={{display: 'flex', gap: '10px'}}>
                           <Box sx={{display: 'flex', flexDirection: 'column'}}>
                                <Typography variant='body2' >Tipo: {terminal.tipo === 8 ? 'Entrada' : terminal.tipo === 10 ? 'Saída' : 'Caixa'}</Typography>
                                <Typography variant='body2' sx={{color: terminal.status === 'online' ? 'green' : 'tomato'}}>Status: {terminal.status}</Typography>
                            </Box>
                            <Box>
                                {(terminal.tipo === 8 || terminal.tipo === 10) ?
                                    <Button size='small' variant="outlined" endIcon={<CenterFocusWeakIcon />} onClick={() => handleOpen(terminal.enderecoip)}>
                                        LPR
                                    </Button>
                                    :
                                    <Box sx={{width: '70px'}}></Box>
                                }
                            </Box> 
                        </Box>
                                            
                    </Card>
                    </>
                    
                ))
            }
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Visualização LPR
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        Imagem ao vivo da LPR do terminal {ip}
                    </Typography>
                </Box>
            </Modal>
            <Backdrop
                sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                open={openBackdrop}
                onClick={handleCloseBackdrop}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </Box>
    );
};

export default Terminais;
