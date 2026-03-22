import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Button,
  Box,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Chip,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BedIcon from '@mui/icons-material/Bed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import TrainIcon from '@mui/icons-material/Train';
import TuneIcon from '@mui/icons-material/Tune';
import {
  fetchRecommendations,
  RecommendationRequest,
  RecommendationResult,
} from '../api/client';
import WhyThis from '../components/WhyThis';
import useCompareStore from '../store/compareStore';

const PROPERTY_TYPES = ['Flat', 'House', 'Studio', 'Room', 'Bungalow'];

function Recommendations() {
  const navigate = useNavigate();
  const { addToCompare, isInCompare, compareList } = useCompareStore();

  const [budgetMax, setBudgetMax] = useState<number>(2000);
  const [preferredAreas, setPreferredAreas] = useState<string>('');
  const [bedrooms, setBedrooms] = useState<number>(2);
  const [propertyType, setPropertyType] = useState<string>('Flat');

  const [nearStation, setNearStation] = useState(true);
  const [furnished, setFurnished] = useState(true);
  const [billsIncluded, setBillsIncluded] = useState(false);
  const [parking, setParking] = useState(false);
  const [garden, setGarden] = useState(false);

  const [results, setResults] = useState<RecommendationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setHasSearched(true);

    const areas = preferredAreas
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    const request: RecommendationRequest = {
      budget_max: budgetMax,
      preferred_areas: areas.length > 0 ? areas : ['Central'],
      bedrooms,
      property_type: propertyType,
      priorities: {
        near_station: nearStation,
        furnished,
        bills_included: billsIncluded,
        parking,
        garden,
      },
    };

    try {
      const data = await fetchRecommendations(request);
      setResults(data.results);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(
        'Failed to get recommendations. Please check if the backend is running and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        AI Property Recommendations
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Tell us your preferences and we will find properties that match your
        needs, ranked by how well they fit.
      </Typography>

      <Grid container spacing={4}>
        {/* Preferences Form */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              position: 'sticky',
              top: 80,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TuneIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Your Preferences
              </Typography>
            </Box>

            <Divider sx={{ mb: 2.5 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="Maximum Budget"
                type="number"
                fullWidth
                value={budgetMax}
                onChange={(e) => setBudgetMax(Number(e.target.value))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">£</InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">/mo</InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Preferred Areas"
                fullWidth
                value={preferredAreas}
                onChange={(e) => setPreferredAreas(e.target.value)}
                helperText="Comma-separated (e.g. Stratford, Canary Wharf)"
                placeholder="e.g. Stratford, Greenwich"
              />

              <FormControl fullWidth>
                <InputLabel>Bedrooms</InputLabel>
                <Select
                  value={bedrooms}
                  label="Bedrooms"
                  onChange={(e) => setBedrooms(Number(e.target.value))}
                >
                  {[0, 1, 2, 3, 4, 5].map((num) => (
                    <MenuItem key={num} value={num}>
                      {num === 0
                        ? 'Studio'
                        : `${num} bedroom${num > 1 ? 's' : ''}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Property Type</InputLabel>
                <Select
                  value={propertyType}
                  label="Property Type"
                  onChange={(e) => setPropertyType(e.target.value)}
                >
                  {PROPERTY_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Divider />

              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: 'text.secondary' }}
              >
                Priorities
              </Typography>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={nearStation}
                    onChange={(e) => setNearStation(e.target.checked)}
                    color="primary"
                  />
                }
                label="Near Station"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={furnished}
                    onChange={(e) => setFurnished(e.target.checked)}
                    color="primary"
                  />
                }
                label="Furnished"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={billsIncluded}
                    onChange={(e) => setBillsIncluded(e.target.checked)}
                    color="primary"
                  />
                }
                label="Bills Included"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={parking}
                    onChange={(e) => setParking(e.target.checked)}
                    color="primary"
                  />
                }
                label="Parking"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={garden}
                    onChange={(e) => setGarden(e.target.checked)}
                    color="primary"
                  />
                }
                label="Garden"
              />

              <Divider />

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleSubmit}
                disabled={loading}
                startIcon={
                  loading ? <CircularProgress size={20} /> : <SearchIcon />
                }
                sx={{
                  py: 1.5,
                  background:
                    'linear-gradient(135deg, #3949ab 0%, #1a237e 100%)',
                }}
              >
                {loading ? 'Finding Matches...' : 'Get Recommendations'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Results */}
        <Grid item xs={12} md={8}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {loading && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 300,
                gap: 2,
              }}
            >
              <CircularProgress size={48} />
              <Typography variant="body1" color="text.secondary">
                Analysing properties against your preferences...
              </Typography>
            </Box>
          )}

          {!loading && !hasSearched && (
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                px: 4,
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 3,
              }}
            >
              <TuneIcon
                sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Set your preferences
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fill in your budget, preferred areas, and priorities, then click
                "Get Recommendations" to see matched properties.
              </Typography>
            </Box>
          )}

          {!loading && hasSearched && results.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No matching properties found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your budget or preferences to see more results.
              </Typography>
            </Box>
          )}

          {!loading &&
            results.length > 0 &&
            results.map((result, index) => {
              const { property, score, reasons } = result;
              const inCompare = isInCompare(property.id);
              const compareFull = compareList.length >= 4;

              return (
                <Card
                  key={property.id}
                  sx={{
                    mb: 3,
                    border: index === 0 ? '2px solid' : '1px solid',
                    borderColor:
                      index === 0 ? 'primary.main' : 'divider',
                    position: 'relative',
                    overflow: 'visible',
                  }}
                >
                  {index === 0 && (
                    <Chip
                      label="Top Pick"
                      color="primary"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -12,
                        left: 16,
                        fontWeight: 700,
                        zIndex: 1,
                      }}
                    />
                  )}

                  <Grid container>
                    <Grid item xs={12} sm={4}>
                      <CardMedia
                        component="img"
                        image={
                          property.image_url ||
                          'https://via.placeholder.com/400x300?text=No+Image'
                        }
                        alt={property.title}
                        sx={{
                          height: '100%',
                          minHeight: 220,
                          objectFit: 'cover',
                        }}
                        onError={(
                          e: React.SyntheticEvent<HTMLImageElement>
                        ) => {
                          e.currentTarget.src =
                            'https://via.placeholder.com/400x300?text=No+Image';
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600, mb: 0.5 }}
                        >
                          {property.title}
                        </Typography>

                        <Typography
                          variant="h5"
                          color="primary.main"
                          sx={{ fontWeight: 700, mb: 1 }}
                        >
                          £{property.price.toLocaleString()}
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                            sx={{ ml: 0.5 }}
                          >
                            /month
                          </Typography>
                        </Typography>

                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 1,
                            gap: 0.5,
                          }}
                        >
                          <LocationOnIcon
                            fontSize="small"
                            color="action"
                          />
                          <Typography variant="body2" color="text.secondary">
                            {property.area}, {property.city}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: 'flex',
                            gap: 0.75,
                            mb: 1.5,
                            flexWrap: 'wrap',
                          }}
                        >
                          <Chip
                            icon={<BedIcon />}
                            label={`${property.bedrooms} bed`}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            icon={<BathtubIcon />}
                            label={`${property.bathrooms} bath`}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={property.property_type}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          {property.nearest_station && (
                            <Chip
                              icon={<TrainIcon />}
                              label={`${property.nearest_station} (${property.station_distance_mins}min)`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>

                        {/* Score + Reasons */}
                        <WhyThis score={score} reasons={reasons} />
                      </CardContent>

                      <CardActions sx={{ px: 3, pb: 2, gap: 1 }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() =>
                            navigate(`/property/${property.id}`)
                          }
                        >
                          View Details
                        </Button>
                        <Button
                          variant={inCompare ? 'contained' : 'outlined'}
                          color={inCompare ? 'error' : 'primary'}
                          size="small"
                          disabled={compareFull && !inCompare}
                          onClick={() => {
                            if (inCompare) {
                              useCompareStore
                                .getState()
                                .removeFromCompare(property.id);
                            } else {
                              addToCompare(property);
                            }
                          }}
                        >
                          {inCompare
                            ? 'Remove from Compare'
                            : 'Add to Compare'}
                        </Button>
                      </CardActions>
                    </Grid>
                  </Grid>
                </Card>
              );
            })}
        </Grid>
      </Grid>
    </Container>
  );
}

export default Recommendations;
