import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BedIcon from '@mui/icons-material/Bed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import TrainIcon from '@mui/icons-material/Train';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import YardIcon from '@mui/icons-material/Yard';
import WeekendIcon from '@mui/icons-material/Weekend';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { fetchPropertyById, Property } from '../api/client';
import useCompareStore from '../store/compareStore';

function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { addToCompare, removeFromCompare, isInCompare, compareList } =
    useCompareStore();

  useEffect(() => {
    const loadProperty = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPropertyById(Number(id));
        setProperty(data);
      } catch (err) {
        console.error('Error fetching property:', err);
        setError('Failed to load property details. The property may not exist.');
      } finally {
        setLoading(false);
      }
    };
    loadProperty();
  }, [id]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
        }}
      >
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (error || !property) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Property not found.'}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/results')}
        >
          Back to Results
        </Button>
      </Container>
    );
  }

  const inCompare = isInCompare(property.id);
  const compareFull = compareList.length >= 4;

  const handleCompareToggle = () => {
    if (inCompare) {
      removeFromCompare(property.id);
    } else {
      addToCompare(property);
    }
  };

  const amenities = [
    {
      label: 'Furnished',
      value: property.furnished,
      icon: <WeekendIcon />,
    },
    {
      label: 'Bills Included',
      value: property.bills_included,
      icon: <ReceiptLongIcon />,
    },
    {
      label: 'Parking',
      value: property.parking,
      icon: <LocalParkingIcon />,
    },
    {
      label: 'Garden',
      value: property.garden,
      icon: <YardIcon />,
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <MuiLink
          component="button"
          underline="hover"
          color="inherit"
          onClick={() => navigate('/')}
        >
          Home
        </MuiLink>
        <MuiLink
          component="button"
          underline="hover"
          color="inherit"
          onClick={() => navigate('/results')}
        >
          Properties
        </MuiLink>
        <Typography color="text.primary" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {property.title}
        </Typography>
      </Breadcrumbs>

      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      <Grid container spacing={4}>
        {/* Image */}
        <Grid item xs={12} md={7}>
          <Paper
            sx={{
              overflow: 'hidden',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box
              component="img"
              src={
                property.image_url ||
                'https://via.placeholder.com/800x500?text=No+Image'
              }
              alt={property.title}
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.src =
                  'https://via.placeholder.com/800x500?text=No+Image';
              }}
              sx={{
                width: '100%',
                height: { xs: 300, md: 450 },
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </Paper>
        </Grid>

        {/* Key Info */}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              height: '100%',
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {property.title}
            </Typography>

            <Box
              sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 0.5 }}
            >
              <LocationOnIcon color="action" fontSize="small" />
              <Typography variant="body1" color="text.secondary">
                {property.area}, {property.city}, {property.region}{' '}
                {property.postcode}
              </Typography>
            </Box>

            <Typography
              variant="h3"
              color="primary.main"
              sx={{ fontWeight: 800, mb: 0.5 }}
            >
              £{property.price.toLocaleString()}
              <Typography
                component="span"
                variant="h6"
                color="text.secondary"
                sx={{ ml: 1 }}
              >
                /month
              </Typography>
            </Typography>

            <Divider sx={{ my: 2 }} />

            {/* Quick stats */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <BedIcon color="primary" sx={{ fontSize: 32 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {property.bedrooms}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Bedrooms
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <BathtubIcon color="primary" sx={{ fontSize: 32 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {property.bathrooms}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Bathrooms
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <HomeWorkIcon color="primary" sx={{ fontSize: 32 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    {property.property_type}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Type
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Station info */}
            {property.nearest_station && (
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  mb: 2,
                  backgroundColor: 'primary.50',
                  border: '1px solid',
                  borderColor: 'primary.100',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <TrainIcon color="primary" />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {property.nearest_station}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {property.station_distance_mins} min walk
                  </Typography>
                </Box>
              </Paper>
            )}

            {/* Action buttons */}
            <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
              <Button
                variant={inCompare ? 'contained' : 'outlined'}
                color={inCompare ? 'error' : 'primary'}
                fullWidth
                disabled={compareFull && !inCompare}
                onClick={handleCompareToggle}
                startIcon={
                  inCompare ? (
                    <RemoveCircleOutlineIcon />
                  ) : (
                    <CompareArrowsIcon />
                  )
                }
              >
                {inCompare ? 'Remove from Compare' : 'Add to Compare'}
              </Button>
            </Box>

            {property.listing_url && (
              <Button
                variant="text"
                fullWidth
                sx={{ mt: 1 }}
                endIcon={<OpenInNewIcon />}
                href={property.listing_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Original Listing
              </Button>
            )}
          </Paper>
        </Grid>

        {/* Description */}
        <Grid item xs={12} md={7}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Description
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}
            >
              {property.description || 'No description available.'}
            </Typography>
          </Paper>
        </Grid>

        {/* Amenities */}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Amenities
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {amenities.map((amenity) => (
                <Box
                  key={amenity.label}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: amenity.value
                      ? 'success.50'
                      : 'grey.50',
                    border: '1px solid',
                    borderColor: amenity.value ? 'success.200' : 'grey.200',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ color: amenity.value ? 'success.main' : 'text.disabled' }}>
                      {amenity.icon}
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color: amenity.value
                          ? 'text.primary'
                          : 'text.disabled',
                      }}
                    >
                      {amenity.label}
                    </Typography>
                  </Box>
                  {amenity.value ? (
                    <Chip
                      icon={<CheckCircleIcon />}
                      label="Yes"
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  ) : (
                    <Chip
                      icon={<CancelIcon />}
                      label="No"
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default PropertyDetails;
