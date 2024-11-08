// src/pages/Dashboard.jsx
import React from 'react';
import Terminais from '../components/Terminais';
import { Box, Typography } from '@mui/material';

const Dashboard = () => {
  return (
    <Box>
        {/* <Terminais /> */}
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
    </Box>

  );
};

export default Dashboard;