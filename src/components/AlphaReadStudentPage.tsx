import React from 'react';
import { Box, Typography, Paper, Divider, Card, CircularProgress } from '@mui/material';
import { Grid } from '@mui/material';
import { StudentData } from '../types/types';

interface AlphaReadStudentPageProps {
  student: StudentData;
}

const AlphaReadStudentPage: React.FC<AlphaReadStudentPageProps> = ({ student }) => {
  const alpha = student.alpharead;
  if (!alpha) {
    return (
      <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
        <Typography variant="h5">No AlphaRead data available for this student.</Typography>
      </Box>
    );
  }

  // Parse time_reading to minutes
  let minutes = 0;
  if (alpha.time_reading) {
    const hMatch = alpha.time_reading.match(/(\d+)h/);
    const mMatch = alpha.time_reading.match(/(\d+)m/);
    minutes = (hMatch ? parseInt(hMatch[1]) : 0) * 60 + (mMatch ? parseInt(mMatch[1]) : 0);
  }

  // Check if practiced today
  let practicedToday = false;
  let daysAgoText = '';
  let lastActiveDate = alpha.last_active || '';
  if (alpha.last_active) {
    const today = new Date();
    const todayStr = today.toLocaleString('en-US', { month: 'short', day: 'numeric' });
    practicedToday = alpha.last_active.toLowerCase().includes(todayStr.toLowerCase());
    // Try to parse the last_active date (e.g. 'Jun 3')
    const lastActive = new Date(`${alpha.last_active}, ${today.getFullYear()}`);
    // If parsing is valid, calculate days ago
    if (!isNaN(lastActive.getTime())) {
      // Zero out time for both dates
      lastActive.setHours(0,0,0,0);
      today.setHours(0,0,0,0);
      const diffMs = today.getTime() - lastActive.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 0) {
        daysAgoText = '(today)';
      } else if (diffDays === 1) {
        daysAgoText = '(1 day ago)';
      } else if (diffDays > 1) {
        daysAgoText = `(${diffDays} days ago)`;
      }
    }
  }

  // Calculate percent of days practiced this month (if possible)
  let percentPracticed = 0;
  if (alpha.last_active) {
    // For demo: if practicedToday, 100%, else 0%
    percentPracticed = practicedToday ? 100 : 0;
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Main Banner */}
      <Card
        sx={{
          mb: 4,
          background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
          color: 'white',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 4 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4, alignItems: 'center' }}>
            <Box>
              <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.7)', letterSpacing: 2 }}>
                LAST ACTIVE
              </Typography>
              <Typography variant="h1" sx={{ mb: 1, fontSize: { xs: '2.2rem', md: '3.5rem' } }}>
                {alpha.last_active || 'Never'} {daysAgoText}
              </Typography>
              <Typography variant="h4" sx={{ color: 'rgba(255,255,255,0.95)', mt: 2, fontWeight: 700 }}>
                {practicedToday ? 'Practiced Today' : 'Not Practiced Today'}
              </Typography>
            </Box>
            <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <CircularProgress
                  variant="determinate"
                  value={percentPracticed}
                  size={120}
                  thickness={6}
                  sx={{
                    color: 'white',
                    opacity: 0.7,
                    '& .MuiCircularProgress-circle': {
                      strokeLinecap: 'round',
                    },
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                    {percentPracticed}%
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Practiced Today
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Card>

      {/* Summary Stats */}
      <Card sx={{ mb: 4, p: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr 1fr' }, gap: 4 }}>
          <Box>
            <Typography variant="subtitle1" color="text.secondary" fontWeight={700} sx={{ fontSize: 18 }}>Reading Level</Typography>
            <Typography variant="h3">{alpha.reading_level ?? '-'}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" color="text.secondary" fontWeight={700} sx={{ fontSize: 18 }}>Avg Score</Typography>
            <Typography variant="h3">{alpha.average_score ?? '-'}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" color="text.secondary" fontWeight={700} sx={{ fontSize: 18 }}>Sessions</Typography>
            <Typography variant="h3">{alpha.total_sessions ?? '-'}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" color="text.secondary" fontWeight={700} sx={{ fontSize: 18 }}>Time Reading (min)</Typography>
            <Typography variant="h3">{minutes}</Typography>
          </Box>
        </Box>
      </Card>

      {/* Details Section */}
      <Card sx={{ mb: 4, p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, letterSpacing: 1 }}>Details</Typography>
        <Box>
          <Typography variant="body1" sx={{ mb: 2, fontSize: 18 }}>
            <strong>Last Active:</strong> {alpha.last_active || 'Never'} {daysAgoText}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, fontSize: 18 }}>
            <strong>Reading Level:</strong> {alpha.reading_level ?? '-'}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, fontSize: 18 }}>
            <strong>Avg Score:</strong> {alpha.average_score ?? '-'}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, fontSize: 18 }}>
            <strong>Sessions:</strong> {alpha.total_sessions ?? '-'}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, fontSize: 18 }}>
            <strong>Time Reading:</strong> {alpha.time_reading ?? '-'}
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};

export default AlphaReadStudentPage; 