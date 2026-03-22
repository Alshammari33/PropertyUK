import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Chip,
  Box,
  Tooltip,
  CardMedia,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { Property } from '../api/client';
import useCompareStore from '../store/compareStore';

function BooleanCell({ value }: { value: boolean }) {
  return value ? (
    <CheckCircleIcon sx={{ color: 'success.main', fontSize: 22 }} />
  ) : (
    <CancelIcon sx={{ color: 'text.disabled', fontSize: 22 }} />
  );
}

function CompareTable() {
  const { compareList, removeFromCompare } = useCompareStore();

  if (compareList.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No properties to compare
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add properties from the search results to compare them side by side.
        </Typography>
      </Box>
    );
  }

  const rows: {
    label: string;
    render: (p: Property) => React.ReactNode;
  }[] = [
    {
      label: 'Price',
      render: (p) => (
        <Typography variant="body1" fontWeight={700} color="primary.main">
          £{p.price.toLocaleString()}/mo
        </Typography>
      ),
    },
    { label: 'City', render: (p) => p.city },
    { label: 'Area', render: (p) => p.area },
    { label: 'Postcode', render: (p) => p.postcode },
    {
      label: 'Bedrooms',
      render: (p) => (
        <Chip label={p.bedrooms} size="small" color="primary" />
      ),
    },
    {
      label: 'Bathrooms',
      render: (p) => (
        <Chip label={p.bathrooms} size="small" variant="outlined" />
      ),
    },
    {
      label: 'Type',
      render: (p) => (
        <Chip label={p.property_type} size="small" variant="outlined" />
      ),
    },
    {
      label: 'Furnished',
      render: (p) => <BooleanCell value={p.furnished} />,
    },
    {
      label: 'Bills Included',
      render: (p) => <BooleanCell value={p.bills_included} />,
    },
    {
      label: 'Parking',
      render: (p) => <BooleanCell value={p.parking} />,
    },
    {
      label: 'Garden',
      render: (p) => <BooleanCell value={p.garden} />,
    },
    {
      label: 'Nearest Station',
      render: (p) => p.nearest_station || 'N/A',
    },
    {
      label: 'Station Distance',
      render: (p) =>
        p.station_distance_mins
          ? `${p.station_distance_mins} min`
          : 'N/A',
    },
  ];

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'primary.main' }}>
            <TableCell
              sx={{
                color: 'white',
                fontWeight: 700,
                minWidth: 140,
                position: 'sticky',
                left: 0,
                backgroundColor: 'primary.main',
                zIndex: 1,
              }}
            >
              Feature
            </TableCell>
            {compareList.map((property) => (
              <TableCell
                key={property.id}
                align="center"
                sx={{ color: 'white', minWidth: 200 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <CardMedia
                    component="img"
                    image={
                      property.image_url ||
                      'https://via.placeholder.com/120x80?text=No+Image'
                    }
                    alt={property.title}
                    sx={{
                      width: 120,
                      height: 80,
                      borderRadius: 1,
                      objectFit: 'cover',
                    }}
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.src =
                        'https://via.placeholder.com/120x80?text=No+Image';
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      maxWidth: 180,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {property.title}
                  </Typography>
                  <Tooltip title="Remove from compare">
                    <IconButton
                      size="small"
                      onClick={() => removeFromCompare(property.id)}
                      sx={{ color: 'rgba(255,255,255,0.8)' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, idx) => (
            <TableRow
              key={row.label}
              sx={{
                backgroundColor: idx % 2 === 0 ? 'grey.50' : 'white',
                '&:hover': { backgroundColor: 'action.hover' },
              }}
            >
              <TableCell
                sx={{
                  fontWeight: 600,
                  color: 'text.secondary',
                  position: 'sticky',
                  left: 0,
                  backgroundColor: idx % 2 === 0 ? 'grey.50' : 'white',
                  zIndex: 1,
                }}
              >
                {row.label}
              </TableCell>
              {compareList.map((property) => (
                <TableCell key={property.id} align="center">
                  {row.render(property)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default CompareTable;
