import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Badge,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Container,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import useCompareStore from '../store/compareStore';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const compareList = useCompareStore((state) => state.compareList);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems = [
    { label: 'Home', path: '/', icon: <HomeIcon /> },
    { label: 'Search', path: '/results', icon: <SearchIcon /> },
    {
      label: 'Compare',
      path: '/compare',
      icon: <CompareArrowsIcon />,
      badge: compareList.length,
    },
    {
      label: 'Help Tool AI',
      path: '/recommendations',
      icon: <AutoAwesomeIcon />,
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleNavigate = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: '#00856A',
          color: 'white',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: { xs: 56, md: 64 } }}>
            <Box
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', mr: 4 }}
              onClick={() => navigate('/')}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  fontSize: '1.3rem',
                  color: 'white',
                  letterSpacing: '-0.01em',
                }}
              >
                PropertyUK
              </Typography>
            </Box>

            {isMobile ? (
              <Box sx={{ ml: 'auto' }}>
                <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: 'white' }}>
                  <Badge badgeContent={compareList.length} color="error">
                    <MenuIcon />
                  </Badge>
                </IconButton>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 0.5, ml: 'auto', alignItems: 'center' }}>
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    sx={{
                      color: 'white',
                      opacity: isActive(item.path) ? 1 : 0.85,
                      backgroundColor: isActive(item.path) ? 'rgba(255,255,255,0.15)' : 'transparent',
                      fontWeight: isActive(item.path) ? 700 : 500,
                      px: 2,
                      py: 0.75,
                      fontSize: '0.9rem',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        opacity: 1,
                      },
                    }}
                  >
                    {item.badge !== undefined && item.badge > 0 ? (
                      <Badge badgeContent={item.badge} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 11 } }}>
                        {item.label}
                      </Badge>
                    ) : (
                      item.label
                    )}
                  </Button>
                ))}
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 280, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#00856A' }}>
              PropertyUK
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <List>
            {navItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  selected={isActive(item.path)}
                  onClick={() => handleNavigate(item.path)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(0,133,106,0.08)',
                      color: '#00856A',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: isActive(item.path) ? '#00856A' : 'text.secondary' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge badgeContent={item.badge} color="error" />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}

export default Navbar;
