import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { DataGrid } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import HistoryIcon from '@mui/icons-material/History';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { IconButton, Modal, Box, CircularProgress, Typography, Button, Tooltip, Card, CardContent } from '@mui/material';
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

    const formatData = (data) => {
        if (!data) return "N/A";
        const [date, time] = data.split(' ');
        return `${date.split('-').reverse().join('/')} ${time}`;
    };

    const formatPermanencia = (minutos) => {
        if (!minutos && minutos !== 0) return "N/A";
        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;
        return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
      };

      const calculateStatistics = () => {
        const terminalEntradaCounts = {};
        const terminalSaidaCounts = {};
        const accessModeCounts = { entrada: {}, saida: {} };
        let totalPermanence = 0;
        let countPermanence = 0;
    
        historyData.forEach(row => {
            // Terminal de Entrada
            if (row.etetickets_descricao) {
                terminalEntradaCounts[row.etetickets_descricao] =
                    (terminalEntradaCounts[row.etetickets_descricao] || 0) + 1;
            }
            // Terminal de Saída
            if (row.etstickets_descricao) {
                terminalSaidaCounts[row.etstickets_descricao] =
                    (terminalSaidaCounts[row.etstickets_descricao] || 0) + 1;
            }
            // Modos de Acesso
            if (row.etetickets_origemacesso) {
                accessModeCounts.entrada[row.etetickets_origemacesso] =
                    (accessModeCounts.entrada[row.etetickets_origemacesso] || 0) + 1;
            }
            if (row.etstickets_origemacesso) {
                accessModeCounts.saida[row.etstickets_origemacesso] =
                    (accessModeCounts.saida[row.etstickets_origemacesso] || 0) + 1;
            }
            // Tempo de Permanência
            if (row.etstickets_permanencia) {
                totalPermanence += row.etstickets_permanencia;
                countPermanence++;
            }
        });
    
        const mostAccessedTerminalEntrada = Object.entries(terminalEntradaCounts).reduce(
            (a, b) => (b[1] > a[1] ? b : a),
            ['', 0]
        );
        const mostAccessedTerminalSaida = Object.entries(terminalSaidaCounts).reduce(
            (a, b) => (b[1] > a[1] ? b : a),
            ['', 0]
        );
        const mostUsedAccessModeEntrada = Object.entries(accessModeCounts.entrada).reduce(
            (a, b) => (b[1] > a[1] ? b : a),
            ['', 0]
        );
        const mostUsedAccessModeSaida = Object.entries(accessModeCounts.saida).reduce(
            (a, b) => (b[1] > a[1] ? b : a),
            ['', 0]
        );
        const averagePermanence = countPermanence ? totalPermanence / countPermanence : 0;
    
        // Tratamento para NaN nas porcentagens e no tempo médio de permanência
        const safePercentage = (value, total) =>
            isNaN(value) || isNaN(total) || total === 0 ? '0.00%' : `${((value / total) * 100).toFixed(2)}%`;
    
        return {
            terminalEntrada: `${mostAccessedTerminalEntrada[0]} (${safePercentage(mostAccessedTerminalEntrada[1], historyData.length)})`,
            terminalSaida: `${mostAccessedTerminalSaida[0]} (${safePercentage(mostAccessedTerminalSaida[1], historyData.length)})`,
            accessModeEntrada: `${mostUsedAccessModeEntrada[0]} (${safePercentage(mostUsedAccessModeEntrada[1], historyData.length)})`,
            accessModeSaida: `${mostUsedAccessModeSaida[0]} (${safePercentage(mostUsedAccessModeSaida[1], historyData.length)})`,
            averagePermanence: isNaN(averagePermanence) ? 'N/A' : formatPermanencia(Math.round(averagePermanence)),
        };
    };
    
    

    const columnsHistory = [
        { field: 'etetickets_ticket', headerName: 'Cartao', width: 100 },
        { field: 'etetickets_placa', headerName: 'Placa', width: 100 },
        { field: 'etetickets_data', headerName: 'Data Entrada', width: 200, renderCell: (params) => <span>{formatData(params.row.etetickets_data)}</span> },
        { field: 'etetickets_descricao', headerName: 'Terminal', width: 200 },
        { field: 'etetickets_origemacesso', headerName: 'Modo de Acesso', width: 200 },
        { field: 'etstickets_data', headerName: 'Data Saída', width: 200, renderCell: (params) => <span>{formatData(params.row.etstickets_data)}</span>  },
        { field: 'etstickets_descricao', headerName: 'Terminal', width: 200 },
        { field: 'etstickets_origemacesso', headerName: 'Modo de Acesso', width: 200 },
        { field: 'etstickets_permanencia', headerName: 'Permanência', width: 200, renderCell: (params) => <span>{formatPermanencia(params.row.etstickets_permanencia)}</span> }
    ];

    // Função para gerar o PDF do histórico
    const generateHistoryPDF = () => {
        const doc = new jsPDF('landscape');
        const stats = calculateStatistics();
    
        // Título do relatório
        doc.text('Histórico do Cartão', 14, 10);
    
        // Configurar dados para a tabela de médias
        const mediaData = [
            ["Terminal de entrada mais acessado", stats.terminalEntrada],
            ["Terminal de saída mais acessado", stats.terminalSaida],
            ["Modo de acesso mais usado (Entrada)", stats.accessModeEntrada],
            ["Modo de acesso mais usado (Saída)", stats.accessModeSaida],
            ["Tempo médio de permanência", stats.averagePermanence]
        ];
    
        // Adicionar a tabela de médias no topo do PDF
        doc.autoTable({
            head: [["Descrição", "Valor"]],
            body: mediaData,
            startY: 20,
            theme: 'grid',
            headStyles: { fillColor: [22, 160, 133] },
            styles: { fontSize: 12, halign: 'center' }
        });
    
        // Calcular a próxima posição para iniciar a tabela de histórico
        const nextY = doc.previousAutoTable.finalY + 10;
    
        // Dados do histórico
        const historyTableData = historyData.map(row => [
            row.etetickets_ticket || '-',
            row.etetickets_placa || '-',
            row.etetickets_data?.split(' ')[0].split('-').reverse().join('/') || '-',
            row.etetickets_descricao || '-',
            row.etetickets_origemacesso || '-',
            row.etstickets_data?.split(' ')[0].split('-').reverse().join('/') || '-',
            row.etstickets_descricao || '-',
            row.etstickets_origemacesso || '-',
            formatPermanencia(row.etstickets_permanencia) || '-',
        ]);
    
        // Adicionar a tabela de histórico
        doc.autoTable({
            head: [['Cartao', 'Placa', 'Data Entrada', 'Terminal Entrada', 'Modo de Acesso Entrada', 'Data Saída', 'Terminal Saída', 'Modo de Acesso Saída', 'Permanência']],
            body: historyTableData,
            startY: nextY, // Inicia após a tabela de médias
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
            row.p_placa || '-',
            row.p_cor || '-',
            row.p_marca || '-',
            row.p_modelo || '-',
            row.p_ano || '-',
            row.validadeinicio.split(' ')[0].split('-').reverse().join('/') || '-',
            row.validadefim.split(' ')[0].split('-').reverse().join('/') || '-',
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
            <Tooltip sx={{margin: '15px 0'}} arrow title="Gerar Relatório">
                <Button variant="contained" color="primary" onClick={generateCredenciadosPDF} startIcon={<PictureAsPdfIcon />}>
                    Impressão
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
                    width: '90vw', height: '90vh', bgcolor: 'background.paper',
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
                    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '15px'}}>
                        <Card sx={{minWidth: '280px'}}>
                            <CardContent>
                                <Typography variant='caption'>Entrada mais acessada</Typography>
                                <Typography variant='h6'>{calculateStatistics()?.terminalEntrada}</Typography>
                            </CardContent>
                        </Card>
                        <Card sx={{minWidth: '280px'}}>
                            <CardContent>
                                <Typography variant='caption'>Saida mais acessada</Typography>
                                <Typography variant='h6'>{calculateStatistics()?.terminalSaida}</Typography>
                            </CardContent>
                        </Card>
                        <Card sx={{minWidth: '280px'}}>
                            <CardContent>
                                <Typography variant='caption'>Modo de acesso mais usado (Entrada)</Typography>
                                <Typography variant='h6'>{calculateStatistics()?.accessModeEntrada}</Typography>
                            </CardContent>
                        </Card>
                        <Card sx={{minWidth: '280px'}}>
                            <CardContent>
                                <Typography variant='caption'>Modo de acesso mais usado (Saída)</Typography>
                                <Typography variant='h6'>{calculateStatistics()?.accessModeSaida}</Typography>
                            </CardContent>
                        </Card>
                        <Card sx={{minWidth: '280px'}}>
                            <CardContent>
                                <Typography variant='caption'>Tempo médio de permanência</Typography>
                                <Typography variant='h6'>{calculateStatistics()?.averagePermanence}</Typography>
                            </CardContent>
                        </Card>
                    </Box>                   
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
                            style={{height: '60vh'}}
                        />
                    )}
                </Box>
            </Modal>
        </div>
    );
};

export default Credenciados;
