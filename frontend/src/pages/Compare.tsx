import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import RecommendIcon from '@mui/icons-material/ThumbUp';
import SearchIcon from '@mui/icons-material/Search';
import CompareTable from '../components/CompareTable';
import useCompareStore from '../store/compareStore';

function Compare() {
  const navigate = useNavigate();
  const { compareList, clearCompare } = useCompareStore();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Compare Properties
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {compareList.length === 0
              ? 'No properties selected for comparison'
              : `Comparing ${compareList.length} ${compareList.length === 1 ? 'property' : 'properties'} (max 4)`}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/results')}
          >
            Back to Search
          </Button>
          {compareList.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteSweepIcon />}
              onClick={clearCompare}
            >
              Clear All
            </Button>
          )}
        </Box>
      </Box>

      {compareList.length < 2 && compareList.length > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Add at least one more property to compare. You can add properties from
          the search results page.
        </Alert>
      )}

      {compareList.length >= 4 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          You have reached the maximum of 4 properties for comparison. Remove a
          property to add a different one.
        </Alert>
      )}

      {/* Compare Table */}
      <Box sx={{ mb: 4, overflowX: 'auto' }}>
        <CompareTable />
      </Box>

      {/* Navigation Options */}
      {compareList.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<SearchIcon />}
            onClick={() => navigate('/results')}
            sx={{ mr: 2 }}
          >
            Search Properties
          </Button>
        </Box>
      )}

      {compareList.length >= 1 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            mt: 2,
          }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<RecommendIcon />}
            onClick={() => navigate('/recommendations')}
          >
            Get AI Recommendations
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<SearchIcon />}
            onClick={() => navigate('/results')}
          >
            Find More Properties
          </Button>
        </Box>
      )}
    </Container>
  );
}

export default Compare;
