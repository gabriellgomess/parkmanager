import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Box, Typography, TextField, Button, Tooltip, Backdrop, Card, CardContent, Snackbar, Alert } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { DataGrid } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import dayjs from 'dayjs';
import AuthContext from '../context/AuthContext';

const EntradasSaidas = () => {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [ticket, setTicket] = useState('');
  const [placa, setPlaca] = useState('');
  const [open, setOpen] = useState(false);
  const [averages, setAverages] = useState({});
  const [stats, setStats] = useState({});
  const { config } = useContext(AuthContext);

  // States for Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');

  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  // Close Snackbar
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const fetchData = (start = '', end = '', ticket = '', placa = '') => {
    handleOpen();
    const params = {};
    if (start) params.dataA = start;
    if (end) params.dataB = end;
    if (ticket) params.ticket = ticket;
    if (placa) params.placa = placa;

    axios.get(`${config.APP_URL}/api/entradas-saidas`, {
      params: params,
      headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
      },
    })
    .then(response => {
      handleClose();
      setData(response.data);
    })
    .catch(error => {
      handleClose();
      console.error("Erro ao buscar os dados:", error);
    });
  };

  useEffect(() => {
    fetchData();
  }, [config.APP_URL]);

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

  const calculateAverages = (data) => {
    const totalPermanencia = data.reduce((sum, row) => sum + (row.etstickets_permanencia || 0), 0);
    const totalTickets = data.length;

    return {
      mediaPermanencia: totalPermanencia / totalTickets,
      totalTickets: totalTickets
    };
  };

  useEffect(() => {
    if (data.length > 0) {
      const averages = calculateAverages(data);
      setAverages(averages);
    }
  }, [data]);

  const generatePDF = () => {
    handleOpen();
    const doc = new jsPDF('landscape');
    doc.text("Relatório de Entradas e Saídas", 14, 10);

    const mediaData = [
      ["Total de Tickets", averages.totalTickets],
      ["Tempo médio de Permanência", formatPermanencia(Math.ceil(averages.mediaPermanencia) || 0)]
    ];

    doc.autoTable({
      head: [["Descrição", "Valor"]],
      body: mediaData,
      startY: 20,
      theme: 'grid'
    });

    const tableData = data.map(row => ([
      row.etetickets_ticket,
      row.etetickets_placa || 'Sem captura',
      formatData(row.etetickets_entrada),
      row.etetickets_descricao || 'N/A',
      formatData(row.etstickets_saida),
      row.etstickets_descricao || 'N/A',
      formatPermanencia(row.etstickets_permanencia),
      row.etstickets_saiucomhiper ? 'Sim' : 'Não'
    ]));

    doc.autoTable({
      head: [['Ticket', 'Placa', 'Entrada', 'Terminal Entrada', 'Saída', 'Terminal Saída', 'Permanência', 'Saiu com Hiper']],
      body: tableData,
      startY: doc.autoTable.previous.finalY + 10,
      theme: 'grid'
    });

    doc.save('entradas_saidas.pdf');
    handleClose();
  };

  const handleApplyFilter = () => {
    if (startDate && endDate && startDate > endDate) {
      setSnackbarMessage('Data Inicial não pode ser maior que Data Final');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const start = dayjs(startDate);
    const end = dayjs(endDate);

    if (startDate && endDate && end.diff(start, 'day') > 30) {
      setSnackbarMessage('O período de busca não pode exceder 30 dias.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    fetchData(
      startDate ? `${startDate} 00:00:00` : '',
      endDate ? `${endDate} 23:59:59` : '',
      ticket,
      placa
    );
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    setTicket('');
    setPlaca('');
    fetchData();
  };

  const columns = [
    { field: 'etetickets_ticket', headerName: 'Ticket', width: 120 },
    { field: 'etetickets_placa', headerName: 'Placa', width: 150 },
    { field: 'etetickets_entrada', headerName: 'Entrada', width: 180, renderCell: (params) => <span>{formatData(params.row.etetickets_entrada)}</span> },
    { field: 'etetickets_descricao', headerName: 'Terminal Entrada', width: 150 },
    { field: 'etstickets_saida', headerName: 'Saída', width: 180, renderCell: (params) => <span>{formatData(params.row.etstickets_saida)}</span> },
    { field: 'etstickets_descricao', headerName: 'Terminal Saída', width: 150 },
    { field: 'etstickets_permanencia', headerName: 'Permanência', width: 180, renderCell: (params) => <span>{formatPermanencia(params.row.etstickets_permanencia)}</span> },
    { field: 'etstickets_saiucomhiper', headerName: 'Saiu com Hiper', width: 150, renderCell: (params) => <span>{params.row.etstickets_saiucomhiper ? 'Sim' : 'Não'}</span> }
  ];

  const calculateStatistics = (data) => {
    const eteticketsDescCount = {};
    const eteticketsOrigemCount = {};
    const etsticketsDescCount = {};
    let totalVehicles = data.length;
    let vehiclesExited = 0;
    let vehiclesWithPlate = 0;

    data.forEach(row => {
      // Contagem das descrições de entrada
      eteticketsDescCount[row.etetickets_descricao] = (eteticketsDescCount[row.etetickets_descricao] || 0) + 1;
      // Contagem das origens de acesso
      eteticketsOrigemCount[row.etetickets_origemacesso] = (eteticketsOrigemCount[row.etetickets_origemacesso] || 0) + 1;
      // Contagem das descrições de saída
      if (row.etstickets_descricao) {
        etsticketsDescCount[row.etstickets_descricao] = (etsticketsDescCount[row.etstickets_descricao] || 0) + 1;
        vehiclesExited += 1;
      }
      // Contagem de veículos com placa registrada
      if (row.etetickets_placa) {
        vehiclesWithPlate += 1;
      }
    });

    // Descrição mais utilizada
    const mostUsedEteticketsDesc = Object.keys(eteticketsDescCount).reduce((a, b) => eteticketsDescCount[a] > eteticketsDescCount[b] ? a : b, '');
    const mostUsedEteticketsOrigem = Object.keys(eteticketsOrigemCount).reduce((a, b) => eteticketsOrigemCount[a] > eteticketsOrigemCount[b] ? a : b, '');
    const mostUsedEtsticketsDesc = Object.keys(etsticketsDescCount).reduce((a, b) => etsticketsDescCount[a] > etsticketsDescCount[b] ? a : b, '');

    // Percentuais
    const exitPercentage = ((vehiclesExited / totalVehicles) * 100).toFixed(2);
    const platePercentage = ((vehiclesWithPlate / totalVehicles) * 100).toFixed(2);

    return {
      mostUsedEteticketsDesc,
      mostUsedEteticketsOrigem,
      mostUsedEtsticketsDesc,
      exitPercentage,
      platePercentage,
    };
  };

  useEffect(() => {
    if (data.length > 0) {
      setStats(calculateStatistics(data));
    }
  }, [data]);

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Typography variant="h6" align="center" gutterBottom>
        Entradas e Saídas
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', gap: 2, mb: 2 }}>        
        <Box sx={{display: 'flex', alignItems: 'end', justifyContent: 'center', gap: '15px', flexWrap: 'wrap'}}>
          <TextField label="Ticket" value={ticket} onChange={(e) => setTicket(e.target.value)} sx={{width: {xs: '100%', sm: '100%', md: '170px'}}} />
          <TextField label="Placa" value={placa} onChange={(e) => setPlaca(e.target.value)} sx={{width: {xs: '100%', sm: '100%', md: '170px'}}} />
          <TextField label="Data Inicial" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{width: {xs: '100%', sm: '100%', md: '170px'}}} />
          <TextField label="Data Final" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{width: {xs: '100%', sm: '100%', md: '170px'}}} />
          <Box sx={{display: 'flex', gap: '10px'}}>
          <Tooltip sx={{flexGrow: '1'}} arrow title="Aplicar Filtro">
            <Button variant="contained" onClick={handleApplyFilter}><FilterAltIcon /></Button>
          </Tooltip>
          <Tooltip sx={{flexGrow: '1'}} arrow title="Limpar Filtro">
            <Button variant="outlined" onClick={handleClearFilter}><FilterAltOffIcon /></Button>
          </Tooltip>
          <Tooltip sx={{flexGrow: '1'}} arrow title="Gerar Relatório">
            <Button variant="contained" color="secondary" onClick={generatePDF}><TextSnippetIcon /></Button>
          </Tooltip>
          </Box>
        </Box>
      

      <Box sx={{display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap'}}>
          <Card elevation={3} sx={{minWidth: '270px', width:{xs: '100%', sm: '100%', md: '170px'}}}>
            <CardContent>
            <Typography variant='caption'>Entrada mais utilizada</Typography>
            <Typography variant='h6'>{stats.mostUsedEteticketsDesc || 'N/A'}</Typography>
            </CardContent>
          </Card>
          <Card elevation={3} sx={{minWidth: '270px', width:{xs: '100%', sm: '100%', md: '170px'}}}>
            <CardContent>
            <Typography variant='caption'>Saída mais utilizada</Typography>
            <Typography variant='h6'>{stats.mostUsedEtsticketsDesc || 'N/A'}</Typography>
            </CardContent>
          </Card>
          <Card elevation={3} sx={{minWidth: '170px', width:{xs: '100%', sm: '100%', md: '170px'}}}>
            <CardContent>
            <Typography variant='caption'>Placas Capturadas</Typography>
            <Typography variant='h6'>{stats.platePercentage || '0'}%</Typography>
            </CardContent>
          </Card>
          <Card elevation={3} sx={{minWidth: '170px', width:{xs: '100%', sm: '100%', md: '170px'}}}>
            <CardContent>
            <Typography variant='caption'>Veículos que saíram</Typography>
            <Typography variant='h6'>{stats.exitPercentage || '0'}%</Typography>
            </CardContent>
          </Card>
          <Card elevation={3} sx={{minWidth: '170px', width:{xs: '100%', sm: '100%', md: '170px'}}}>
            <CardContent>
            <Typography variant='caption'>Total de Tickets</Typography>
            <Typography variant='h6'>{averages.totalTickets || '0'}</Typography>
            </CardContent>
          </Card>
          <Card elevation={3} sx={{minWidth: '170px', width:{xs: '100%', sm: '100%', md: '170px'}}}>
            <CardContent>
            <Typography variant='caption'>Média de Permanência</Typography>
            <Typography variant='h6'>{formatPermanencia(Math.ceil(averages.mediaPermanencia) || 0)}</Typography>
            </CardContent>
          </Card>
          

        </Box>
        </Box>
      
      <DataGrid
        sx={{display: {xs: 'none', sm: 'none', md: 'flex'}}}
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        rows={data.filter(row => row.ticket !== '100')}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 20, 50, data.length]}
        disableRowSelectionOnClick
        getRowId={(row) => row.etetickets_id}
      />


      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={open} onClick={handleClose}>
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* Snackbar for messages */}
      <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'center' }} open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EntradasSaidas;
