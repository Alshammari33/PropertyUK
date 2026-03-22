import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Box,
  Tooltip,
  IconButton,
} from '@mui/material';
import BedIcon from '@mui/icons-material/Bed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrainIcon from '@mui/icons-material/Train';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { Property } from '../api/client';
import useCompareStore from '../store/compareStore';

interface PropertyCardProps {
  property: Property;
  relevance?: number;
}

function PropertyCard({ property, relevance }: PropertyCardProps) {
  const navigate = useNavigate();
  const { addToCompare, removeFromCompare, isInCompare, compareList } =
    useCompareStore();
  const inCompare = isInCompare(property.id);
  const compareFull = compareList.length >= 4;

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inCompare) {
      removeFromCompare(property.id);
    } else {
      addToCompare(property);
    }
  };

  return (
    <Card
      onClick={() => navigate(`/property/${property.id}`)}
      sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="180"
          image={property.image_url || 'https://via.placeholder.com/400x200?text=No+Image'}
          alt={property.title}
          sx={{ objectFit: 'cover' }}
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            e.currentTarget.src = 'https://via.placeholder.com/400x200?text=No+Image';
          }}
        />

        {/* Relevance badge */}
        {relevance !== undefined && (
          <Chip
            icon={<AutoAwesomeIcon sx={{ fontSize: '14px !important', color: 'white !important' }} />}
            label={`${Math.round(relevance * 100)}% match`}
            size="small"
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              backgroundColor: relevance >= 0.8 ? '#00B894' : relevance >= 0.5 ? '#f59e0b' : '#e74c3c',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.75rem',
            }}
          />
        )}

        {/* Compare button */}
        <Tooltip title={compareFull && !inCompare ? 'Compare full (max 4)' : inCompare ? 'Remove' : 'Compare'}>
          <IconButton
            onClick={handleCompareToggle}
            disabled={compareFull && !inCompare}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: inCompare ? '#00856A' : 'rgba(255,255,255,0.9)',
              color: inCompare ? 'white' : '#6b7280',
              width: 32,
              height: 32,
              '&:hover': { backgroundColor: inCompare ? '#006B55' : 'white' },
            }}
          >
            {inCompare ? <CheckCircleIcon sx={{ fontSize: 18 }} /> : <CompareArrowsIcon sx={{ fontSize: 18 }} />}
          </IconButton>
        </Tooltip>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2, pb: '12px !important' }}>
        {/* Price */}
        <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: '#00856A', mb: 0.25 }}>
          £{property.price.toLocaleString()}
          <Typography component="span" sx={{ fontWeight: 400, fontSize: '0.85rem', color: '#6b7280', ml: 0.5 }}>
            pcm
          </Typography>
        </Typography>

        {/* Title */}
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.95rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            mb: 0.5,
            color: '#2d2d2d',
          }}
        >
          {property.title}
        </Typography>

        {/* Location */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <LocationOnIcon sx={{ fontSize: 15, color: '#9ca3af', mr: 0.5 }} />
          <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.82rem' }}>
            {property.area}, {property.city}
          </Typography>
        </Box>

        {/* Bed/Bath/Type row */}
        <Box sx={{ display: 'flex', gap: 2, mb: 1.5, color: '#4b5563' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <BedIcon sx={{ fontSize: 16 }} />
            <Typography variant="body2" sx={{ fontSize: '0.82rem' }}>{property.bedrooms}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <BathtubIcon sx={{ fontSize: 16 }} />
            <Typography variant="body2" sx={{ fontSize: '0.82rem' }}>{property.bathrooms}</Typography>
          </Box>
          <Typography variant="body2" sx={{ fontSize: '0.82rem', color: '#6b7280' }}>
            {property.property_type}
          </Typography>
        </Box>

        {/* Station */}
        {property.nearest_station && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TrainIcon sx={{ fontSize: 14, color: '#9ca3af', mr: 0.5 }} />
            <Typography variant="caption" sx={{ color: '#9ca3af' }}>
              {property.nearest_station} ({property.station_distance_mins} min walk)
            </Typography>
          </Box>
        )}

        {/* Tags */}
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {property.furnished && (
            <Chip label="Furnished" size="small" sx={{ fontSize: '0.7rem', height: 22, backgroundColor: '#e6f5f1', color: '#00856A', fontWeight: 600 }} />
          )}
          {property.bills_included && (
            <Chip label="Bills inc." size="small" sx={{ fontSize: '0.7rem', height: 22, backgroundColor: '#e6f9f4', color: '#00B894', fontWeight: 600 }} />
          )}
          {property.parking && (
            <Chip label="Parking" size="small" sx={{ fontSize: '0.7rem', height: 22, backgroundColor: '#fef3c7', color: '#d97706', fontWeight: 600 }} />
          )}
          {property.garden && (
            <Chip label="Garden" size="small" sx={{ fontSize: '0.7rem', height: 22, backgroundColor: '#dcfce7', color: '#16a34a', fontWeight: 600 }} />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default PropertyCard;
