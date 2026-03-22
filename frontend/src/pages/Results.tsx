import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Button,
  Badge,
  Alert,
  CircularProgress,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
  Chip,
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PropertyCard from '../components/PropertyCard';
import FilterPanel from '../components/FilterPanel';
import {
  fetchProperties, smartSearch,
  Property, PropertyFilters, ParsedFilter,
} from '../api/client';
import useCompareStore from '../store/compareStore';

const PAGE_SIZE = 24;

function Results() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [properties, setProperties] = useState<Property[]>([]);
  const [relevanceMap, setRelevanceMap] = useState<Record<number, number>>({});
  const [parsedFilters, setParsedFilters] = useState<ParsedFilter | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [isSmartSearch, setIsSmartSearch] = useState(false);

  const compareList = useCompareStore((state) => state.compareList);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const sort = searchParams.get('sort') || 'price_asc';
  const q = searchParams.get('q') || '';

  // Check if we have manual filter params (city, area, etc.) beyond just q
  const hasManualFilters = ['city', 'area', 'min_price', 'max_price', 'bedrooms',
    'property_type', 'furnished', 'bills_included', 'parking'].some(
    (k) => searchParams.has(k)
  );

  const getFiltersFromParams = useCallback((): PropertyFilters => {
    const filters: PropertyFilters = {};
    const qParam = searchParams.get('q');
    const cityParam = searchParams.get('city');
    const areaParam = searchParams.get('area');
    const minPriceParam = searchParams.get('min_price');
    const maxPriceParam = searchParams.get('max_price');
    const bedroomsParam = searchParams.get('bedrooms');
    const propertyTypeParam = searchParams.get('property_type');
    const furnishedParam = searchParams.get('furnished');
    const billsParam = searchParams.get('bills_included');
    const parkingParam = searchParams.get('parking');

    if (qParam) filters.q = qParam;
    if (cityParam) filters.city = cityParam;
    if (areaParam) filters.area = areaParam;
    if (minPriceParam) filters.min_price = Number(minPriceParam);
    if (maxPriceParam) filters.max_price = Number(maxPriceParam);
    if (bedroomsParam) filters.bedrooms = Number(bedroomsParam);
    if (propertyTypeParam) filters.property_type = propertyTypeParam;
    if (furnishedParam === 'true') filters.furnished = true;
    if (billsParam === 'true') filters.bills_included = true;
    if (parkingParam === 'true') filters.parking = true;

    return filters;
  }, [searchParams]);

  const loadProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pageParam = parseInt(searchParams.get('page') || '1', 10);
      const skip = (pageParam - 1) * PAGE_SIZE;
      const qParam = searchParams.get('q') || '';

      // Use AI smart search when user typed a natural language query
      // and hasn't manually set structured filter params
      if (qParam && !hasManualFilters) {
        const data = await smartSearch(qParam, skip, PAGE_SIZE);
        setProperties(data.items.map((i) => i.property));
        const rMap: Record<number, number> = {};
        data.items.forEach((i) => { rMap[i.property.id] = i.relevance; });
        setRelevanceMap(rMap);
        setParsedFilters(data.parsed);
        setTotal(data.total);
        setIsSmartSearch(true);
      } else {
        // Fallback to standard filter search
        const filters = getFiltersFromParams();
        const sortParam = searchParams.get('sort') || 'price_asc';
        const data = await fetchProperties({
          ...filters,
          sort: sortParam,
          skip,
          limit: PAGE_SIZE,
        });
        setProperties(data.items);
        setRelevanceMap({});
        setParsedFilters(null);
        setTotal(data.total);
        setIsSmartSearch(false);
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError(
        'Failed to load properties. Please check if the backend is running and try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [getFiltersFromParams, searchParams, hasManualFilters]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  const handleFilterApply = (filters: PropertyFilters) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (filters.city) params.set('city', filters.city);
    if (filters.area) params.set('area', filters.area);
    if (filters.min_price !== undefined)
      params.set('min_price', String(filters.min_price));
    if (filters.max_price !== undefined)
      params.set('max_price', String(filters.max_price));
    if (filters.bedrooms !== undefined)
      params.set('bedrooms', String(filters.bedrooms));
    if (filters.property_type)
      params.set('property_type', filters.property_type);
    if (filters.furnished) params.set('furnished', 'true');
    if (filters.bills_included) params.set('bills_included', 'true');
    if (filters.parking) params.set('parking', 'true');
    params.set('sort', sort);
    params.set('page', '1');
    setSearchParams(params);
    setMobileFilterOpen(false);
  };

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', newSort);
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentFilters = getFiltersFromParams();
  const activeFilterCount = Object.values(currentFilters).filter(
    (v) => v !== undefined && v !== '' && v !== null
  ).length;

  const filterPanel = (
    <FilterPanel filters={currentFilters} onApply={handleFilterApply} />
  );

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
            Properties
            {q && (
              <Typography
                component="span"
                variant="h5"
                color="text.secondary"
                sx={{ ml: 1 }}
              >
                for "{q}"
              </Typography>
            )}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            <Typography variant="body2" component="span" color="text.secondary">
              {loading ? 'Loading...' : `${total} properties found`}
            </Typography>
            {isSmartSearch && !loading && (
              <Chip
                icon={<AutoAwesomeIcon />}
                label="AI-ranked by relevance"
                size="small"
                color="primary"
                variant="outlined"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {isMobile && (
            <Button
              variant="outlined"
              startIcon={
                <Badge badgeContent={activeFilterCount} color="primary">
                  <FilterListIcon />
                </Badge>
              }
              onClick={() => setMobileFilterOpen(true)}
            >
              Filters
            </Button>
          )}

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sort}
              label="Sort By"
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <MenuItem value="price_asc">Price: Low to High</MenuItem>
              <MenuItem value="price_desc">Price: High to Low</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<CompareArrowsIcon />}
            disabled={compareList.length < 2}
            onClick={() => navigate('/compare')}
          >
            <Badge badgeContent={compareList.length} color="error">
              Compare
            </Badge>
          </Button>
        </Box>
      </Box>

      {/* Active filters chips */}
      {activeFilterCount > 0 && (
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          {currentFilters.city && (
            <Chip label={`City: ${currentFilters.city}`} size="small" onDelete={() => {
              const params = new URLSearchParams(searchParams);
              params.delete('city');
              setSearchParams(params);
            }} />
          )}
          {currentFilters.area && (
            <Chip label={`Area: ${currentFilters.area}`} size="small" onDelete={() => {
              const params = new URLSearchParams(searchParams);
              params.delete('area');
              setSearchParams(params);
            }} />
          )}
          {currentFilters.min_price !== undefined && (
            <Chip label={`Min: £${currentFilters.min_price}`} size="small" onDelete={() => {
              const params = new URLSearchParams(searchParams);
              params.delete('min_price');
              setSearchParams(params);
            }} />
          )}
          {currentFilters.max_price !== undefined && (
            <Chip label={`Max: £${currentFilters.max_price}`} size="small" onDelete={() => {
              const params = new URLSearchParams(searchParams);
              params.delete('max_price');
              setSearchParams(params);
            }} />
          )}
          {currentFilters.bedrooms !== undefined && (
            <Chip label={`${currentFilters.bedrooms} bed`} size="small" onDelete={() => {
              const params = new URLSearchParams(searchParams);
              params.delete('bedrooms');
              setSearchParams(params);
            }} />
          )}
          {currentFilters.property_type && (
            <Chip label={currentFilters.property_type} size="small" onDelete={() => {
              const params = new URLSearchParams(searchParams);
              params.delete('property_type');
              setSearchParams(params);
            }} />
          )}
        </Box>
      )}

      {/* AI-parsed filter chips */}
      {isSmartSearch && parsedFilters && parsedFilters.extracted_terms.length > 0 && (
        <Box
          sx={{
            mb: 2,
            borderRadius: 2,
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexWrap: 'wrap',
            backgroundColor: 'info.lighter',
            border: '1px solid',
            borderColor: 'info.light',
          }}
        >
          <AutoAwesomeIcon sx={{ color: 'info.main', fontSize: 20 }} />
          <Typography variant="body2" component="span" sx={{ fontWeight: 600, color: 'info.dark' }}>
            AI understood:
          </Typography>
          {parsedFilters.extracted_terms.map((term) => (
            <Chip key={term} label={term} size="small" color="primary" variant="outlined" />
          ))}
        </Box>
      )}

      <Grid container spacing={3}>
        {/* Desktop Filter Sidebar */}
        {!isMobile && (
          <Grid item md={3}>
            <Box sx={{ position: 'sticky', top: 80 }}>{filterPanel}</Box>
          </Grid>
        )}

        {/* Results Grid */}
        <Grid item xs={12} md={isMobile ? 12 : 9}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {loading ? (
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
          ) : properties.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No properties found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your filters or search terms.
              </Typography>
            </Box>
          ) : (
            <>
              <Grid container spacing={3}>
                {properties.map((property) => (
                  <Grid item xs={12} sm={6} lg={4} key={property.id}>
                    <PropertyCard
                      property={property}
                      relevance={relevanceMap[property.id]}
                    />
                  </Grid>
                ))}
              </Grid>

              {totalPages > 1 && (
                <Box
                  sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}
                >
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          )}
        </Grid>
      </Grid>

      {/* Mobile Filter Drawer */}
      <Drawer
        anchor="left"
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
      >
        <Box sx={{ width: 300, p: 2 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Filters
            </Typography>
            <IconButton onClick={() => setMobileFilterOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          {filterPanel}
        </Box>
      </Drawer>
    </Container>
  );
}

export default Results;
