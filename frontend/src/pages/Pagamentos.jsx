import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Backdrop,
  CircularProgress,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import AuthContext from '../context/AuthContext';

const Pagamentos = () => {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState({});
  const { config } = useContext(AuthContext);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleSnackbarClose = () => setSnackbarOpen(false);

  const fetchData = () => {
    handleOpen();
    axios
      .get(`${config.APP_URL}/api/pagamentos`, {
        params: {
          ...(startDate && { startDate }),
          ...(endDate && { endDate }),
        },
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      })
      .then((response) => {
        handleClose();
        setData(response.data);
        calculateStats(response.data);
      })
      .catch((error) => {
        handleClose();
        setSnackbarMessage('Erro ao buscar os dados');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        console.error(error);
      });
  };

  const calculateStats = (data) => {
    const totalRecords = data.length;
    const totalValuePaid = data.reduce((sum, row) => sum + parseFloat(row.valorpago || 0), 0);
    const totaDiscount = data.reduce((sum, row) => sum + parseFloat(row.desconto || 0), 0);

    // Calcular valor médio pago
    const averageValuePaid = totalValuePaid / totalRecords || 0;
    const averageValueDiscount = totaDiscount / totalRecords || 0;

  
    // Contar formas de pagamento
    const paymentMethods = data.reduce((acc, row) => {
      const method = row.descformadepagamento || 'Desconhecido';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});
  
    // Encontrar a forma de pagamento mais usada
    const mostUsedPaymentMethod = Object.keys(paymentMethods).reduce((a, b) => (paymentMethods[a] > paymentMethods[b] ? a : b), '');
    const mostUsedPaymentMethodCount = paymentMethods[mostUsedPaymentMethod] || 0;
    const mostUsedPaymentMethodPercentage = ((mostUsedPaymentMethodCount / totalRecords) * 100).toFixed(2);
  
    setStats({
        totalRecords,
        totalValuePaid: totalValuePaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        totaDiscount: parseFloat(totaDiscount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        mostUsedPaymentMethod,
        mostUsedPaymentMethodCount,
        mostUsedPaymentMethodPercentage,
        averageValuePaid: averageValuePaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        averageValueDiscount: averageValueDiscount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    });
  };
  
  
  
  const formatDate = (date) => {
    // format yyyy-mm-dd hh:mm:ss to dd/mm/yyyy hh:mm:ss
    const [datePart, timePart] = date.split(' ');
    return datePart.split('-').reverse().join('/') + ' ' + timePart;
};

  useEffect(() => {
    fetchData();
  }, [config.APP_URL]);

  const generatePDF = () => {
    const doc = new jsPDF('landscape');
    doc.text('Relatório de Pagamentos', 14, 10);

    const statsData = [
      ['Total de Registros', stats.totalRecords || 0],
      ['Valor Total Pago', stats.totalValuePaid || '0,00'],
      ['Valor Médio Pago', stats.averageValuePaid || '0,00'],
      ['Total de Descontos', stats.totaDiscount || 0],
      ['Valor Médio Desconto', stats.averageValueDiscount || '0,00'],
      ['Forma de Pagamento Mais Usada', stats.mostUsedPaymentMethod || 'Desconhecido'],
      ['Quantidade', stats.mostUsedPaymentMethodCount || 0],
      ['Porcentagem', stats.mostUsedPaymentMethodPercentage || '0,00%'],      
    ];

    doc.autoTable({
      head: [['Descrição', 'Valor']],
      body: statsData,
      startY: 20,
    });

    const tableData = data.map((row) => [
        row.ticket,
        row.placa,
        formatDate(row.datahoraentrada),
        formatDate(row.datahorasaida),        
        row.valorpago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        row.valorrecebido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        row.desconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        row.descformadepagamento,
        row.nometarifa,        
        row.operador,
        row.descformadepagamento
    ]);

    doc.autoTable({
      head: [
        [
            'Ticket',
            'Placa',
            'Entrada',
            'Saída',            
            'Valor Pago',
            'Valor Recebido',
            'Desconto',
            'Forma de Pagamento',
            'Tarifa',            
            'Operador',
            'Forma de Pagamento',   
        ],
      ],
      body: tableData,
      startY: doc.autoTable.previous.finalY + 10,
    });

    doc.save('pagamentos.pdf');
  };

  const columns = [
    { field: 'ticket', headerName: 'Ticket', width: 120 },
    { field: 'placa', headerName: 'Placa', width: 120 },
    { field: 'datahoraentrada', headerName: 'Entrada', width: 200, renderCell: (params) => formatDate(params.value)},
    { field: 'datahorasaida', headerName: 'Saída', width: 200, renderCell: (params) => formatDate(params.value)},    
    {
        field: 'valorpago',
        headerName: 'Valor Pago',
        width: 150,
        renderCell: (params) => parseFloat(params.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    },
    {
        field: 'valorrecebido',
        headerName: 'Valor Recebido',
        width: 150,
        renderCell: (params) => parseFloat(params.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    },
    { 
        field: 'desconto', 
        headerName: 'Desconto', 
        width: 100 ,
        renderCell: (params) => parseFloat(params.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    },
    { field: 'descformadepagamento', headerName: 'Forma de Pagamento', width: 250 },    
    { field: 'nometarifa', headerName: 'Tarifa', width: 150 },    
    { field: 'operador', headerName: 'Operador', width: 150 },
  ];
  

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Typography variant="h6" align="center" gutterBottom>
        Pagamentos
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Data Inicial"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Data Final"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="contained" onClick={fetchData}>
          Filtrar
        </Button>
        <Button variant="contained" color="secondary" onClick={generatePDF}>
          Gerar Relatório
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6">Total Registros</Typography>
            <Typography>{stats.totalRecords || 0}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6">Valor Total Pago</Typography>
            <Typography>{stats.totalValuePaid || '0,00'}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6">Valor Médio Pago</Typography>
            <Typography>{stats.averageValuePaid || '0,00'}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200 }}>
            <CardContent>
                <Typography variant="h6">Total de Descontos</Typography>
                <Typography>{stats.totaDiscount || 0}</Typography>
            </CardContent>
        </Card>
        <Card sx={{ minWidth: 200 }}>
            <CardContent>
                <Typography variant="h6">Valor Médio Desconto</Typography>
                <Typography>{stats.averageValueDiscount || '0,00'}</Typography>
            </CardContent>
        </Card>
        <Card sx={{ minWidth: 200 }}>
            <CardContent>
            <Typography variant="h6">Forma de Pagamento Mais Usada</Typography>
            <Typography>{stats.mostUsedPaymentMethod || 'Desconhecido'}</Typography>
            <Typography>
                {stats.mostUsedPaymentMethodCount || 0} ({stats.mostUsedPaymentMethodPercentage || '0.00'}%)
            </Typography>
            </CardContent>
        </Card>
      </Box>

      <DataGrid
        rows={data}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 20, 50]}
        getRowId={(row) => row.ticket}
        autoHeight
      />

      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={open}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Pagamentos;
