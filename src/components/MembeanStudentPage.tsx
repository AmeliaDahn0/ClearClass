import React, { useEffect } from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';
import { MembeanDisplayData } from '../types/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Grid from '@mui/material/Grid';

interface MembeanStudentPageProps {
  student: MembeanDisplayData;
  improvedReadability?: boolean;
}

const WeeklyMembeanGraph: React.FC<{ data: { date: string | null; minutes: number | null }[] }> = ({ data }) => (
  <Box sx={{ width: '100%', height: 260 }}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 16, right: 24, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 13 }} />
        <YAxis tick={{ fontSize: 13 }} allowDecimals={false} label={{ value: 'Minutes', angle: -90, position: 'insideLeft', fontSize: 14 }} />
        <Tooltip formatter={(value) => (value === null ? 'No Data' : value)} />
        <Bar dataKey="minutes" fill="#388e3c" radius={[6, 6, 0, 0]} isAnimationActive />
      </BarChart>
    </ResponsiveContainer>
  </Box>
);

const MembeanStudentPage: React.FC<MembeanStudentPageProps> = ({ student, improvedReadability }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  // Calculate progress percentage from minutes trained
  const minutesTrained = parseInt(student.problems_answered_today || '0');
  const dailyGoal = 15; // 15 minutes daily goal
  const progressPercentage = Math.min(Math.round((minutesTrained / dailyGoal) * 100), 100);

  // Format last active date
  const lastActive = student.sessions?.days?.completed?.length > 0 
    ? student.sessions.days.completed[student.sessions.days.completed.length - 1]
    : 'Never';

  if (improvedReadability) {
    return (
      <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
        {/* Main Banner */}
        <Paper 
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
            color: 'white',
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.9 }}>
            LAST ACTIVE
          </Typography>
          <Typography variant="h3" sx={{ mb: 2 }}>
            {student.last_trained || 'Never'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
            <Typography variant="h2" sx={{ lineHeight: 1 }}>
              {progressPercentage}%
            </Typography>
            <Typography variant="subtitle1" sx={{ mb: 1, opacity: 0.9 }}>
              Minutes Today ({minutesTrained} of {dailyGoal})
            </Typography>
            {student.goal_met && (
              <Box sx={{ ml: 2, px: 2, py: 0.5, borderRadius: 1, bgcolor: '#fff', color: '#388e3c', fontWeight: 'bold', fontSize: 18 }}>
                Goal Met
              </Box>
            )}
          </Box>
          {student.membeanUrl && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              <a
                href={student.membeanUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'white',
                  textDecoration: 'underline',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                View Membean Class Page
              </a>
            </Typography>
          )}
        </Paper>

        {/* Daily Progress Section */}
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>Today's Progress</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Box sx={{ flex: '1 1 200px', minWidth: 180 }}>
            <Paper elevation={0} sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>Minutes Today</Typography>
              <Typography variant="h4">{minutesTrained}</Typography>
            </Paper>
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: 180 }}>
            <Paper elevation={0} sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>Accuracy Today</Typography>
              <Typography variant="h4">{student.grade}</Typography>
            </Paper>
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: 180 }}>
            <Paper elevation={0} sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>Words Seen Today</Typography>
              <Typography variant="h4">{student.words_seen}</Typography>
            </Paper>
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />

        {/* Weekly Progress Section */}
        {student.weekly_data && (
          <>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>This Week's Progress</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <Box sx={{ flex: '1 1 150px', minWidth: 140 }}>
                <Paper elevation={0} sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>Total Minutes This Week</Typography>
                  <Typography variant="h4">{student.weekly_data.minutes_trained}</Typography>
                </Paper>
              </Box>
              <Box sx={{ flex: '1 1 150px', minWidth: 140 }}>
                <Paper elevation={0} sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>Days Practiced This Week</Typography>
                  <Typography variant="h4">{student.weekly_data.days_practiced}</Typography>
                </Paper>
              </Box>
              <Box sx={{ flex: '1 1 150px', minWidth: 140 }}>
                <Paper elevation={0} sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>Weekly Accuracy</Typography>
                  <Typography variant="h4">{student.weekly_data.accuracy}</Typography>
                </Paper>
              </Box>
              <Box sx={{ flex: '1 1 150px', minWidth: 140 }}>
                <Paper elevation={0} sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>New Words This Week</Typography>
                  <Typography variant="h4">{student.weekly_data.new_words}</Typography>
                </Paper>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
          </>
        )}

        {/* Group 2: Vocabulary */}
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Vocabulary</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Box sx={{ flex: '1 1 200px', minWidth: 180 }}>
            <Paper elevation={0} sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>Words Seen (Total)</Typography>
              <Typography variant="h4">{student.words_seen}</Typography>
            </Paper>
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: 180 }}>
            <Paper elevation={0} sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>New Words (Total)</Typography>
              <Typography variant="h4">{student.new_words}</Typography>
            </Paper>
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: 180 }}>
            <Paper elevation={0} sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>Skipped Words (Total)</Typography>
              <Typography variant="h4">{student.skipped_words}</Typography>
            </Paper>
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />

        {/* Group 3: Performance */}
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Performance</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Box sx={{ flex: '1 1 200px', minWidth: 180 }}>
            <Paper elevation={0} sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>Dubious Minutes (Total)</Typography>
              <Typography variant="h4">{student.dubious_minutes}</Typography>
            </Paper>
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: 180 }}>
            <Paper elevation={0} sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>Assessment Score</Typography>
              <Typography variant="h4">{student.assessment_score || '-'}</Typography>
            </Paper>
          </Box>
        </Box>

        {/* Weekly Summary and Graph, Session History (unchanged) */}
        {student.weekly_minutes && student.weekly_minutes.length > 0 && (
          <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2, background: 'white' }}>
            <Typography variant="h5" gutterBottom>Weekly Minutes Graph</Typography>
            <WeeklyMembeanGraph data={student.weekly_minutes} />
          </Paper>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Main Banner */}
      <Paper 
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 2,
          background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
          color: 'white',
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.9 }}>
          LAST ACTIVE
        </Typography>
        <Typography variant="h3" sx={{ mb: 2 }}>
          {student.last_trained || 'Never'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
          <Typography variant="h2" sx={{ lineHeight: 1 }}>
            {progressPercentage}%
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 1, opacity: 0.9 }}>
            Minutes Today ({minutesTrained} of {dailyGoal})
          </Typography>
          {student.goal_met && (
            <Box sx={{ ml: 2, px: 2, py: 0.5, borderRadius: 1, bgcolor: '#fff', color: '#388e3c', fontWeight: 'bold', fontSize: 18 }}>
              Goal Met
            </Box>
          )}
        </Box>
        {student.membeanUrl && (
          <Typography variant="body2" sx={{ mt: 2 }}>
            <a
              href={student.membeanUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'white',
                textDecoration: 'underline',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              View Membean Class Page
            </a>
          </Typography>
        )}
      </Paper>

      {/* Daily Progress Section */}
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>Today's Progress</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Box sx={{ flex: '1 1 200px', minWidth: 180 }}>
          <Paper elevation={0} sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>Minutes Today</Typography>
            <Typography variant="h4">{minutesTrained}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: 180 }}>
          <Paper elevation={0} sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>Accuracy Today</Typography>
            <Typography variant="h4">{student.grade}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: 180 }}>
          <Paper elevation={0} sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>Words Seen Today</Typography>
            <Typography variant="h4">{student.words_seen}</Typography>
          </Paper>
        </Box>
      </Box>
      <Divider sx={{ my: 2 }} />

      {/* Weekly Progress Section */}
      {student.weekly_data && (
        <>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>This Week's Progress</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Box sx={{ flex: '1 1 150px', minWidth: 140 }}>
              <Paper elevation={0} sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>Total Minutes This Week</Typography>
                <Typography variant="h4">{student.weekly_data.minutes_trained}</Typography>
              </Paper>
            </Box>
            <Box sx={{ flex: '1 1 150px', minWidth: 140 }}>
              <Paper elevation={0} sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>Days Practiced This Week</Typography>
                <Typography variant="h4">{student.weekly_data.days_practiced}</Typography>
              </Paper>
            </Box>
            <Box sx={{ flex: '1 1 150px', minWidth: 140 }}>
              <Paper elevation={0} sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>Weekly Accuracy</Typography>
                <Typography variant="h4">{student.weekly_data.accuracy}</Typography>
              </Paper>
            </Box>
            <Box sx={{ flex: '1 1 150px', minWidth: 140 }}>
              <Paper elevation={0} sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>New Words This Week</Typography>
                <Typography variant="h4">{student.weekly_data.new_words}</Typography>
              </Paper>
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />
        </>
      )}

      {/* Group 2: Vocabulary */}
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Vocabulary</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Box sx={{ flex: '1 1 200px', minWidth: 180 }}>
          <Paper elevation={0} sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>Words Seen (Total)</Typography>
            <Typography variant="h4">{student.words_seen}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: 180 }}>
          <Paper elevation={0} sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>New Words (Total)</Typography>
            <Typography variant="h4">{student.new_words}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: 180 }}>
          <Paper elevation={0} sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>Skipped Words (Total)</Typography>
            <Typography variant="h4">{student.skipped_words}</Typography>
          </Paper>
        </Box>
      </Box>
      <Divider sx={{ my: 2 }} />

      {/* Group 3: Performance */}
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Performance</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Box sx={{ flex: '1 1 200px', minWidth: 180 }}>
          <Paper elevation={0} sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>Dubious Minutes (Total)</Typography>
            <Typography variant="h4">{student.dubious_minutes}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: 180 }}>
          <Paper elevation={0} sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>Assessment Score</Typography>
            <Typography variant="h4">{student.assessment_score || '-'}</Typography>
          </Paper>
        </Box>
      </Box>

      {/* Weekly Summary and Graph, Session History (unchanged) */}
      {student.weekly_minutes && student.weekly_minutes.length > 0 && (
        <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2, background: 'white' }}>
          <Typography variant="h5" gutterBottom>Weekly Minutes Graph</Typography>
          <WeeklyMembeanGraph data={student.weekly_minutes} />
        </Paper>
      )}
    </Box>
  );
};

export default MembeanStudentPage; 