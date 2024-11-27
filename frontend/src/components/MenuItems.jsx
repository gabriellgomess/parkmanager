// src/MenuItems.jsx
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import StorefrontIcon from '@mui/icons-material/Storefront';
import BadgeIcon from '@mui/icons-material/Badge';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LogoutIcon from '@mui/icons-material/Logout';

const MenuItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardIcon />,
  },
  {
    name: 'Entradas/Saídas',
    path: '/entradas-saidas',
    icon: <SyncAltIcon />,
  },
  {
    name: 'Validação Hiper',
    path: '/validacao-hiper',
    icon: <StorefrontIcon />,
  },
  {
    name: 'Credenciados',
    path: '/credenciados',
    icon: <BadgeIcon />,
  },
  {
    name: 'Pagamentos',
    path: '/pagamentos',
    icon: <AttachMoneyIcon />,
  },
  {
    name: 'Usuários',
    path: '/users',
    icon: <PeopleIcon />,
  },  
  {
    name: 'Sair',
    action: 'logout',
    icon: <LogoutIcon />,
  }
];

export default MenuItems;
