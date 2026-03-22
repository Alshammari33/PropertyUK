import {
  Box,
  Typography,
  LinearProgress,
  Chip,
  Paper,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface WhyThisProps {
  score: number;
  reasons: string[];
}

function getScoreColor(score: number): 'success' | 'warning' | 'error' {
  if (score >= 0.7) return 'success';
  if (score >= 0.4) return 'warning';
  return 'error';
}

function getScoreLabel(score: number): string {
  if (score >= 0.9) return 'Excellent Match';
  if (score >= 0.7) return 'Great Match';
  if (score >= 0.5) return 'Good Match';
  if (score >= 0.3) return 'Fair Match';
  return 'Low Match';
}

function WhyThis({ score, reasons }: WhyThisProps) {
  const scorePercent = Math.round(score * 100);
  const color = getScoreColor(score);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        backgroundColor: 'grey.50',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
        <StarIcon sx={{ color: `${color}.main`, mr: 1, fontSize: 20 }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 600, flexGrow: 1 }}>
          Match Score
        </Typography>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, color: `${color}.main` }}
        >
          {scorePercent}% - {getScoreLabel(score)}
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={scorePercent}
        color={color}
        sx={{
          height: 8,
          borderRadius: 4,
          mb: 2,
          backgroundColor: 'grey.200',
        }}
      />

      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          color: 'text.secondary',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          mb: 1,
          display: 'block',
        }}
      >
        Why this property?
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
        {reasons.map((reason, index) => (
          <Chip
            key={index}
            icon={<CheckCircleOutlineIcon />}
            label={reason}
            size="small"
            color={color}
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
        ))}
      </Box>
    </Paper>
  );
}

export default WhyThis;
