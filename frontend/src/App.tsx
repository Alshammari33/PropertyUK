import { Routes, Route } from 'react-router-dom';
import { Box, Container, Typography, Link } from '@mui/material';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Results from './pages/Results';
import PropertyDetails from './pages/PropertyDetails';
import Compare from './pages/Compare';
import Recommendations from './pages/Recommendations';

function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/results" element={<Results />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/recommendations" element={<Recommendations />} />
        </Routes>
      </Box>
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: '#2d2d2d',
          color: 'rgba(255,255,255,0.5)',
          fontSize: '0.85rem',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography sx={{ fontWeight: 700, color: 'white', fontSize: '1rem' }}>
              Property<span style={{ color: '#00A884' }}>UK</span>
            </Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Link href="/results" underline="hover" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', '&:hover': { color: 'white' } }}>
                Search
              </Link>
              <Link href="/compare" underline="hover" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', '&:hover': { color: 'white' } }}>
                Compare
              </Link>
              <Link href="/recommendations" underline="hover" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', '&:hover': { color: 'white' } }}>
                Help Tool AI
              </Link>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default App;
