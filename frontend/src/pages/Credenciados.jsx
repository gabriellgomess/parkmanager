import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { DataGrid } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import HistoryIcon from '@mui/icons-material/History';
import { IconButton, Modal, Box, CircularProgress, Typography, Button, Tooltip } from '@mui/material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
    };

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
        { field: 'etetickets_data', headerName: 'Data Entrada', width: 200 },
        { field: 'etetickets_descricao', headerName: 'Terminal', width: 200 },
        { field: 'etetickets_origemacesso', headerName: 'Modo de Acesso', width: 200 },
        { field: 'etstickets_data', headerName: 'Data Saída', width: 200 },
        { field: 'etstickets_descricao', headerName: 'Terminal', width: 200 },
        { field: 'etstickets_origemacesso', headerName: 'Modo de Acesso', width: 200 },
        { field: 'etstickets_permanencia', headerName: 'Permanência', width: 200 }
    ];

    // Função para gerar o PDF do histórico
    const generateHistoryPDF = () => {
        const doc = new jsPDF('landscape');

        // Título do relatório
        doc.text('Histórico do Cartão', 14, 10);

        // Dados do histórico
        const historyTableData = historyData.map(row => [
            row.etetickets_ticket || 'N/A',
            row.etetickets_placa || 'N/A',
            row.etetickets_data || 'N/A',
            row.etetickets_descricao || 'N/A',
            row.etetickets_origemacesso || 'N/A',
            row.etstickets_data || 'N/A',
            row.etstickets_descricao || 'N/A',
            row.etstickets_origemacesso || 'N/A',
            row.etstickets_permanencia || 'N/A',
        ]);

        doc.autoTable({
            head: [['Cartao', 'Placa', 'Data Entrada', 'Terminal Entrada', 'Modo de Acesso Entrada', 'Data Saída', 'Terminal Saída', 'Modo de Acesso Saída', 'Permanência']],
            body: historyTableData,
            startY: 20,
            theme: 'grid',
            headStyles: { fillColor: [22, 160, 133] },
            styles: { fontSize: 8, halign: 'center' }
        });

        // Salva o arquivo
        doc.save('historico_cartao.pdf');
    };

    // Função para gerar o PDF dos credenciados
    const generateCredenciadosPDF = () => {
        const doc = new jsPDF('landscape');

        // Título do relatório
        doc.text('Relatório de Credenciados', 14, 10);

        // Dados da tabela principal
        const tableData = credenciados.map(row => [
            row.cartao,
            row.nome,
            row.grupo,
            row.p_placa || 'N/A',
            row.p_cor || 'N/A',
            row.p_marca || 'N/A',
            row.p_modelo || 'N/A',
            row.p_ano || 'N/A',
            row.validadeinicio.split(' ')[0].split('-').reverse().join('/') || 'N/A',
            row.validadefim.split(' ')[0].split('-').reverse().join('/') || 'N/A',
            row.inativo === 'F' ? 'Ativo' : 'Inativo'
        ]);

        doc.autoTable({
            head: [['Cartao', 'Nome', 'Grupo', 'Placa', 'Cor', 'Marca', 'Modelo', 'Ano', 'Validade Inicio', 'Validade Fim', 'Status']],
            body: tableData,
            startY: 20,
            theme: 'grid',
            headStyles: { fillColor: [22, 160, 133] },
            styles: { fontSize: 8, halign: 'center' }
        });

        // Salva o arquivo
        doc.save('relatorio_credenciados.pdf');
    };

    return (
        <div>
            <h1>Credenciados</h1>
            <Tooltip arrow title="Gerar Relatório">
                <Button variant="contained" color="secondary" onClick={generateCredenciadosPDF}>
                    Gerar PDF
                </Button>
            </Tooltip>
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
                    <Tooltip arrow title="Gerar PDF do Histórico">
                        <Button variant="contained" color="primary" onClick={generateHistoryPDF} sx={{ mb: 2 }}>
                            Gerar PDF
                        </Button>
                    </Tooltip>
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
};

export default Credenciados;
