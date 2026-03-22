import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Paper,
  Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import TuneIcon from '@mui/icons-material/Tune';
import SpeedIcon from '@mui/icons-material/Speed';
import Chip from '@mui/material/Chip';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const POPULAR_CITIES = [
  { name: 'London', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=260&fit=crop' },
  { name: 'Manchester', img: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=400&h=260&fit=crop' },
  { name: 'Birmingham', img: 'https://images.unsplash.com/photo-1598128558393-70ff21f8be44?w=400&h=260&fit=crop' },
  { name: 'Edinburgh', img: 'https://images.unsplash.com/photo-1506377585622-bedcbb5f6568?w=400&h=260&fit=crop' },
  { name: 'Bristol', img: 'https://images.unsplash.com/photo-1571168136613-46401b03904e?w=400&h=260&fit=crop' },
  { name: 'Leeds', img: 'https://images.unsplash.com/photo-1590075254806-fb228a70bfb8?w=400&h=260&fit=crop' },
  { name: 'Glasgow', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=260&fit=crop' },
  { name: 'Liverpool', img: 'https://images.unsplash.com/photo-1560179406-1c6c60e0dc76?w=400&h=260&fit=crop' },
  { name: 'Sheffield', img: 'https://images.unsplash.com/photo-1642427749670-f20e2e76ed8c?w=400&h=260&fit=crop' },
  { name: 'Cardiff', img: 'https://images.unsplash.com/photo-1572883454114-efb93fc35b32?w=400&h=260&fit=crop' },
  { name: 'Newcastle', img: 'https://images.unsplash.com/photo-1589920527942-477a8e04a1f2?w=400&h=260&fit=crop' },
  { name: 'Nottingham', img: 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?w=400&h=260&fit=crop' },
  { name: 'Brighton', img: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=400&h=260&fit=crop' },
  { name: 'Cambridge', img: 'https://images.unsplash.com/photo-1579862132201-ac5f2990bc8e?w=400&h=260&fit=crop' },
  { name: 'Oxford', img: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=400&h=260&fit=crop' },
  { name: 'Bath', img: 'https://images.unsplash.com/photo-1580406458354-cc49419d4649?w=400&h=260&fit=crop' },
  { name: 'Reading', img: 'https://images.unsplash.com/photo-1617128734662-66da6c1d3505?w=400&h=260&fit=crop' },
];

function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    navigate(`/results?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <Box>
      {/* Hero */}
      <Box
        sx={{
          background: 'linear-gradient(180deg, #e6f5f1 0%, #f0faf7 40%, #ffffff 100%)',
          pt: { xs: 6, md: 8 },
          pb: { xs: 8, md: 10 },
          px: 2,
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 900,
              mb: 2,
              color: '#2d2d2d',
              fontSize: { xs: '2rem', sm: '2.8rem', md: '3.2rem' },
              lineHeight: 1.15,
            }}
          >
            Search properties
          </Typography>

          <Typography
            variant="h6"
            sx={{
              mb: 4,
              color: '#6b7280',
              fontWeight: 400,
              maxWidth: 480,
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.1rem' },
            }}
          >
            Buy, sell or rent — find your perfect property across the UK
          </Typography>

          {/* Search box */}
          <Paper
            elevation={0}
            sx={{
              p: 0.5,
              display: 'flex',
              gap: 1,
              maxWidth: 620,
              mx: 'auto',
              border: '2px solid #00856A',
              borderRadius: 2,
              backgroundColor: 'white',
            }}
          >
            <TextField
              fullWidth
              placeholder="e.g. 2 bed flat in Manchester under £1200"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#9ca3af' }} />
                  </InputAdornment>
                ),
                sx: {
                  fontSize: '1rem',
                  '& fieldset': { border: 'none' },
                },
              }}
            />
            <Button
              variant="contained"
              size="large"
              onClick={handleSearch}
              sx={{
                px: 4,
                minWidth: 120,
                fontSize: '1rem',
                backgroundColor: '#00856A',
                '&:hover': { backgroundColor: '#006B55' },
              }}
            >
              Search
            </Button>
          </Paper>

          {/* Example chips */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <AutoAwesomeIcon sx={{ fontSize: 16, color: '#00856A' }} />
            <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.82rem' }}>Try:</Typography>
            {[
              'Furnished flat in London under £1500',
              '3 bed house with garden',
              'Studio near station',
            ].map((example) => (
              <Chip
                key={example}
                label={example}
                size="small"
                onClick={() => {
                  setSearchQuery(example);
                  const params = new URLSearchParams();
                  params.set('q', example);
                  navigate(`/results?${params.toString()}`);
                }}
                sx={{
                  color: '#00856A',
                  borderColor: '#86efac',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  '&:hover': { borderColor: '#00856A', backgroundColor: 'rgba(0,133,106,0.06)' },
                }}
                variant="outlined"
              />
            ))}
          </Box>
        </Container>
      </Box>

      {/* Popular locations */}
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 6 } }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#2d2d2d' }}>
          Popular locations
        </Typography>
        <Grid container spacing={2}>
          {POPULAR_CITIES.map((city) => (
            <Grid item xs={6} sm={4} md={3} key={city.name}>
              <Paper
                elevation={0}
                onClick={() => navigate(`/results?q=${encodeURIComponent(city.name)}`)}
                sx={{
                  position: 'relative',
                  borderRadius: 2,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  height: 140,
                  backgroundImage: `url(${city.img})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '1px solid #e5e7eb',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.03)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.05) 60%)',
                  },
                }}
              >
                <Box sx={{ position: 'absolute', bottom: 12, left: 14, zIndex: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOnIcon sx={{ fontSize: 16, color: 'white' }} />
                  <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>
                    {city.name}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features */}
      <Box sx={{ backgroundColor: '#f9fafb', py: { xs: 5, md: 7 } }}>
        <Container maxWidth="lg">
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#2d2d2d', textAlign: 'center' }}>
            Why use PropertyUK?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 5, textAlign: 'center', maxWidth: 500, mx: 'auto' }}>
            Smarter tools to help you find, compare and choose the right property.
          </Typography>

          <Grid container spacing={3}>
            {[
              {
                icon: <AutoAwesomeIcon sx={{ fontSize: 28, color: '#00856A' }} />,
                title: 'AI Smart Search',
                desc: 'Type what you want in plain English. Our AI understands your needs and ranks results by relevance.',
                bg: '#e6f5f1',
              },
              {
                icon: <CompareArrowsIcon sx={{ fontSize: 28, color: '#00B894' }} />,
                title: 'Compare Properties',
                desc: 'Compare up to 4 properties side by side with every detail — price, amenities, transport links.',
                bg: '#e6f9f4',
              },
              {
                icon: <TuneIcon sx={{ fontSize: 28, color: '#3b82f6' }} />,
                title: 'Advanced Filters',
                desc: 'Filter by furnished, bills included, parking, garden, bedrooms, price range and more.',
                bg: '#eff6ff',
              },
              {
                icon: <SpeedIcon sx={{ fontSize: 28, color: '#f59e0b' }} />,
                title: 'AI Recommendations',
                desc: 'Tell us your preferences and get personalised property recommendations with match scores.',
                bg: '#fef3c7',
              },
            ].map((f, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    border: '1px solid #e5e7eb',
                    backgroundColor: 'white',
                    '&:hover': { borderColor: '#00856A' },
                    transition: 'border-color 0.2s',
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      backgroundColor: f.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    {f.icon}
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.75, color: '#2d2d2d' }}>
                    {f.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {f.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA */}
      <Box sx={{ py: { xs: 5, md: 7 }, textAlign: 'center' }}>
        <Container maxWidth="sm">
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5, color: '#2d2d2d' }}>
            Ready to find your next home?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Let our AI match you with the perfect property.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/results')}
              sx={{
                px: 4,
                py: 1.25,
                backgroundColor: '#00856A',
                '&:hover': { backgroundColor: '#006B55' },
              }}
            >
              Browse Properties
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/recommendations')}
              sx={{
                px: 4,
                py: 1.25,
                borderColor: '#00856A',
                color: '#00856A',
                '&:hover': { borderColor: '#006B55', backgroundColor: 'rgba(0,133,106,0.04)' },
              }}
            >
              Get AI Recommendations
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default Home;
