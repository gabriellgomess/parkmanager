import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { DataGrid } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import HistoryIcon from '@mui/icons-material/History';
import { IconButton, Modal, Box, CircularProgress, Typography } from '@mui/material';

const Credenciados = () => {
    const [credenciados, setCredenciados] = useState([]);
    const [historyData, setHistoryData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { config } = useContext(AuthContext);

    const fetchData = async () => {
        const response = await axios.get(`${config.APP_URL}/api/credenciados`, {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem('token')}`,
            }
        });
        setCredenciados(response.data);
    }

    useEffect(() => {
        fetchData();
    }, []);

    const columns = [
        { field: 'cartao', headerName: 'Cartao', width: 100 },
        { field: 'nome', headerName: 'Nome', width: 250 },
        { field: 'grupo', headerName: 'Grupo', width: 100 },
        { field: 'p_placa', headerName: 'Placa', width: 100 },
        { field: 'p_cor', headerName: 'Cor', width: 100 },
        { field: 'p_marca', headerName: 'Marca', width: 100 },
        { field: 'p_modelo', headerName: 'Modelo', width: 100 },
        { field: 'p_ano', headerName: 'Ano', width: 100 },
        { field: 'validadeinicio', headerName: 'Validade Inicio', width: 130, renderCell: (params) => <span>{params.row.validadeinicio.split(' ')[0].split('-').reverse().join('/')}</span> },
        { field: 'validadefim', headerName: 'Validade Fim', width: 130, renderCell: (params) => <span>{params.row.validadefim.split(' ')[0].split('-').reverse().join('/')}</span> },
        { field: 'inativo', headerName: 'Status', width: 100, renderCell: (params) => <span>{params.row.inativo === 'F' ? 'Ativo' : 'Inativo'}</span> },
        { field: 'historico', headerName: 'Histórico', width: 100, renderCell: (params) => <IconButton onClick={() => handleGetHistory(params.row.cartao)} color="primary" aria-label="histórico de acesso"><HistoryIcon /></IconButton> }
    ];

    const handleGetHistory = async (cartao) => {
        setIsLoading(true);
        setIsModalOpen(true);
        try {
            const response = await axios.get(`${config.APP_URL}/api/credenciado-acessos`, {
                params: { cartao: cartao },
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                }
            });
            setHistoryData(response.data);
            console.log(response.data);
        } catch (error) {
            console.error('Erro ao buscar o histórico:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setHistoryData([]);
    };

    const columnsHistory = [
        { field: 'etetickets_ticket', headerName: 'Cartao', width: 100 },
        { field: 'etetickets_placa', headerName: 'Placa', width: 100 },
        { field: 'etetickets_data', headerName: 'Data Entrada', width: 200},
        { field: 'etetickets_descricao', headerName: 'Terminal', width: 200 },
        { field: 'etetickets_origemacesso', headerName: 'Modo de Acesso', width: 200 },
        { field: 'etstickets_data', headerName: 'Data Saída', width: 200},
        { field: 'etstickets_descricao', headerName: 'Terminal', width: 200 },
        { field: 'etstickets_origemacesso', headerName: 'Modo de Acesso', width: 200 },
        { field: 'etstickets_permanencia', headerName: 'Permanência', width: 200 }
    ];

    return (
        <div>
            <h1>Credenciados</h1>
            <DataGrid
                sx={{ display: { xs: 'none', sm: 'none', md: 'flex' } }}
                localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
                rows={credenciados}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 20, 50]}
                disableRowSelectionOnClick
                getRowId={(row) => row.cartao}
            /> 

            {/* Modal for History */}
            <Modal open={isModalOpen} onClose={closeModal}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '90vw', height: '80vh', bgcolor: 'background.paper',
                    boxShadow: 24, p: 4,
                }}>
                    <Typography variant="h6" component="h2">
                        Histórico do Cartão
                    </Typography>
                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <DataGrid
                            localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
                            rows={historyData}
                            columns={columnsHistory}
                            pageSize={5}
                            rowsPerPageOptions={[5, 10]}
                            disableRowSelectionOnClick
                            getRowId={(row) => row.etetickets_id}
                        />
                    )}
                </Box>
            </Modal>
        </div>
    );
}

export default Credenciados;
