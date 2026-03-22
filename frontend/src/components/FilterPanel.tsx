import { useState } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Button,
  Typography,
  Paper,
  Divider,
  InputAdornment,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SearchIcon from '@mui/icons-material/Search';
import { PropertyFilters } from '../api/client';

interface FilterPanelProps {
  filters: PropertyFilters;
  onApply: (filters: PropertyFilters) => void;
}

const PROPERTY_TYPES = ['', 'Flat', 'House', 'Studio', 'Room', 'Bungalow'];
const BEDROOM_OPTIONS = [0, 1, 2, 3, 4, 5];

function FilterPanel({ filters, onApply }: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<PropertyFilters>({
    city: filters.city || '',
    area: filters.area || '',
    min_price: filters.min_price,
    max_price: filters.max_price,
    bedrooms: filters.bedrooms,
    property_type: filters.property_type || '',
    furnished: filters.furnished,
    bills_included: filters.bills_included,
    parking: filters.parking,
  });

  const handleChange = (field: keyof PropertyFilters, value: unknown) => {
    setLocalFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleApply = () => {
    const cleanFilters: PropertyFilters = {};
    if (localFilters.city) cleanFilters.city = localFilters.city;
    if (localFilters.area) cleanFilters.area = localFilters.area;
    if (localFilters.min_price !== undefined && localFilters.min_price !== null)
      cleanFilters.min_price = localFilters.min_price;
    if (localFilters.max_price !== undefined && localFilters.max_price !== null)
      cleanFilters.max_price = localFilters.max_price;
    if (localFilters.bedrooms !== undefined)
      cleanFilters.bedrooms = localFilters.bedrooms;
    if (localFilters.property_type)
      cleanFilters.property_type = localFilters.property_type;
    if (localFilters.furnished) cleanFilters.furnished = true;
    if (localFilters.bills_included) cleanFilters.bills_included = true;
    if (localFilters.parking) cleanFilters.parking = true;
    onApply(cleanFilters);
  };

  const handleReset = () => {
    const resetFilters: PropertyFilters = {
      city: '',
      area: '',
      min_price: undefined,
      max_price: undefined,
      bedrooms: undefined,
      property_type: '',
      furnished: undefined,
      bills_included: undefined,
      parking: undefined,
    };
    setLocalFilters(resetFilters);
    onApply({});
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FilterListIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Filters
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="City"
          size="small"
          fullWidth
          value={localFilters.city || ''}
          onChange={(e) => handleChange('city', e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Area"
          size="small"
          fullWidth
          value={localFilters.area || ''}
          onChange={(e) => handleChange('area', e.target.value)}
        />

        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            label="Min Price"
            size="small"
            type="number"
            fullWidth
            value={localFilters.min_price ?? ''}
            onChange={(e) =>
              handleChange(
                'min_price',
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">£</InputAdornment>
              ),
            }}
          />
          <TextField
            label="Max Price"
            size="small"
            type="number"
            fullWidth
            value={localFilters.max_price ?? ''}
            onChange={(e) =>
              handleChange(
                'max_price',
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">£</InputAdornment>
              ),
            }}
          />
        </Box>

        <FormControl size="small" fullWidth>
          <InputLabel>Bedrooms</InputLabel>
          <Select
            value={localFilters.bedrooms ?? ''}
            label="Bedrooms"
            onChange={(e) =>
              handleChange(
                'bedrooms',
                e.target.value === '' ? undefined : Number(e.target.value)
              )
            }
          >
            <MenuItem value="">Any</MenuItem>
            {BEDROOM_OPTIONS.map((num) => (
              <MenuItem key={num} value={num}>
                {num === 0 ? 'Studio' : `${num} bedroom${num > 1 ? 's' : ''}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" fullWidth>
          <InputLabel>Property Type</InputLabel>
          <Select
            value={localFilters.property_type || ''}
            label="Property Type"
            onChange={(e) => handleChange('property_type', e.target.value)}
          >
            <MenuItem value="">Any</MenuItem>
            {PROPERTY_TYPES.filter(Boolean).map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Divider />

        <FormControlLabel
          control={
            <Checkbox
              checked={localFilters.furnished || false}
              onChange={(e) => handleChange('furnished', e.target.checked)}
              color="primary"
            />
          }
          label="Furnished"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={localFilters.bills_included || false}
              onChange={(e) => handleChange('bills_included', e.target.checked)}
              color="primary"
            />
          }
          label="Bills Included"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={localFilters.parking || false}
              onChange={(e) => handleChange('parking', e.target.checked)}
              color="primary"
            />
          }
          label="Parking"
        />

        <Divider />

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleApply}
            startIcon={<FilterListIcon />}
          >
            Apply
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleReset}
            startIcon={<RestartAltIcon />}
          >
            Reset
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default FilterPanel;
