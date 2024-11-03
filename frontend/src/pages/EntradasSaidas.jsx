// src/components/EntradasSaidas.jsx
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Box, Typography, Backdrop } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { DataGrid } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import AuthContext from '../context/AuthContext'; // Importa o contexto

const EntradasSaidas = () => {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const { config } = useContext(AuthContext); // Pega o config do contexto

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    setOpen(true);
    axios.get(`${config.APP_URL}/api/entradas-saidas`) // Usa config em vez da variável de ambiente
      .then((response) => {
        setOpen(false);
        setData(response.data);
      })
      .catch((error) => {
        setOpen(false);
        console.error("Erro ao buscar os dados:", error);
      });
  }, [config.APP_URL]); // Adiciona config.APP_URL como dependência

  const formatData1 = (data) => {
    if (!data) return "N/A";
    let date = data.split(' ')[0].split('-').reverse().join('/');
    let time = data.split(' ')[1];
    return `${date} ${time}`;
  };

  const formatData2 = (data) => {
    if (!data) return "N/A";
    let date = data.split(' ')[0].split('-').join('/');
    let time = data.split(' ')[1];
    return `${date} ${time}`;
  };

  const formatPermanencia = (minutos) => {
    if (!minutos && minutos !== 0) return "N/A";
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  const columns = [
    { field: 'etetickets_ticket', headerName: 'Ticket', width: 120 },
    { 
      field: 'etetickets_placa', 
      headerName: 'Placa', 
      width: 150, 
      renderCell: (params) => <span>{params.row.etetickets_placa || 'Sem captura'}</span> 
    },
    { 
      field: 'etetickets_entrada', 
      headerName: 'Entrada', 
      width: 180, 
      renderCell: (params) => <span>{formatData1(params.row.etetickets_entrada)}</span> 
    },
    { field: 'etetickets_descricao', headerName: 'Terminal de Entrada', width: 150 },
    { 
      field: 'etstickets_saida', 
      headerName: 'Saída', 
      width: 180, 
      renderCell: (params) => <span>{formatData2(params.row.etstickets_saida)}</span> 
    },
    { field: 'etstickets_descricao', headerName: 'Terminal de Saída', width: 150 },
    { 
      field: 'etstickets_permanencia', 
      headerName: 'Permanência', 
      width: 180,
      renderCell: (params) => <span>{formatPermanencia(params.row.etstickets_permanencia)}</span> 
    },
    { 
      field: 'etstickets_saiucomhiper', 
      headerName: 'Saiu com Hiper', 
      width: 150,
      renderCell: (params) => <span>{params.row.etstickets_saiucomhiper ? 'Sim' : 'Não'}</span> 
    }
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Typography variant="h6" align="center" gutterBottom>
        Entradas e Saídas
      </Typography>
      <DataGrid
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        rows={data.filter(row => row.ticket !== '100')} // Filtrando os dados conforme sua condição
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 20, 50]}
        disableRowSelectionOnClick
        getRowId={(row) => row.etetickets_id} // Definindo o identificador único para cada linha
      />
      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
        open={open}
        onClick={handleClose}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
};

export default EntradasSaidas;
