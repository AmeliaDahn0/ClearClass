import React, { useEffect } from 'react';
import { Box, Typography, Paper, Divider, Card, CircularProgress } from '@mui/material';
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

  // Calculate progress percentage from minutes
  const minutesTrained = parseInt(student.problems_answered_today || '0');
  const dailyGoal = 15; // 15 minutes daily goal
  const progressPercentage = Math.min(Math.round((minutesTrained / dailyGoal) * 100), 100);

  // Calculate percent of daily goal (minutes)
  const percentOfGoal = dailyGoal > 0 ? Math.min((minutesTrained / dailyGoal) * 100, 100) : 0;

  // Format last active date
  const lastActive = student.sessions?.days?.completed?.length > 0 
    ? student.sessions.days.completed[student.sessions.days.completed.length - 1]
    : 'Never';

  if (improvedReadability) {
    return (
      <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
        {/* Main Banner */}
        <Card
          sx={{
            mb: 4,
            background: 'linear-gradient(135deg, #43a047 0%, #388e3c 100%)',
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
                  {student.last_trained || 'Never'}
                </Typography>
                <Typography variant="h4" sx={{ color: 'rgba(255,255,255,0.95)', mt: 2, fontWeight: 700 }}>
                  {progressPercentage}% Minutes Today ({minutesTrained} of {dailyGoal})
                </Typography>
                {student.goal_met && (
                  <Box sx={{ mt: 2, px: 3, py: 1, borderRadius: 2, bgcolor: '#fff', color: '#388e3c', fontWeight: 'bold', fontSize: 22, display: 'inline-block' }}>
                    Goal Met
                  </Box>
                )}
                {student.membeanUrl && (
                  <Typography variant="body1" sx={{ mt: 3, fontSize: { xs: 16, md: 18 } }}>
                    <a
                      href={student.membeanUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: 'white',
                        textDecoration: 'underline',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: 'inherit',
                      }}
                    >
                      View Membean Class Page
                    </a>
                  </Typography>
                )}
              </Box>
              <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <CircularProgress
                    variant="determinate"
                    value={percentOfGoal}
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
                      {Math.round(percentOfGoal)}%
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Daily Goal
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Card>

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
      <Card
        sx={{
          mb: 4,
          background: 'linear-gradient(135deg, #43a047 0%, #388e3c 100%)',
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
                {student.last_trained || 'Never'}
              </Typography>
              <Typography variant="h4" sx={{ color: 'rgba(255,255,255,0.95)', mt: 2, fontWeight: 700 }}>
                {progressPercentage}% Minutes Today ({minutesTrained} of {dailyGoal})
              </Typography>
              {student.goal_met && (
                <Box sx={{ mt: 2, px: 3, py: 1, borderRadius: 2, bgcolor: '#fff', color: '#388e3c', fontWeight: 'bold', fontSize: 22, display: 'inline-block' }}>
                  Goal Met
                </Box>
              )}
              {student.membeanUrl && (
                <Typography variant="body1" sx={{ mt: 3, fontSize: { xs: 16, md: 18 } }}>
                  <a
                    href={student.membeanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: 'white',
                      textDecoration: 'underline',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: 'inherit',
                    }}
                  >
                    View Membean Class Page
                  </a>
                </Typography>
              )}
            </Box>
            <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <CircularProgress
                  variant="determinate"
                  value={percentOfGoal}
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
                    {Math.round(percentOfGoal)}%
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Daily Goal
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Card>

      {/* Today's Progress */}
      <Card sx={{ mb: 4, p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 800, letterSpacing: 1 }}>Today's Progress</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 4 }}>
          <Box>
            <Typography variant="subtitle1" color="text.secondary" fontWeight={700} sx={{ fontSize: 18 }}>Minutes Today</Typography>
            <Typography variant="h3">{minutesTrained}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" color="text.secondary" fontWeight={700} sx={{ fontSize: 18 }}>Accuracy Today</Typography>
            <Typography variant="h3">{student.grade}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" color="text.secondary" fontWeight={700} sx={{ fontSize: 18 }}>Words Seen Today</Typography>
            <Typography variant="h3">{student.words_seen}</Typography>
          </Box>
        </Box>
      </Card>

      {/* Weekly Progress */}
      {student.weekly_data && (
        <Card sx={{ mb: 4, p: 3 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 800, letterSpacing: 1 }}>This Week's Progress</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr 1fr' }, gap: 4 }}>
            <Box>
              <Typography variant="subtitle1" color="text.secondary" fontWeight={700} sx={{ fontSize: 16 }}>Total Minutes This Week</Typography>
              <Typography variant="h4">{student.weekly_data.minutes_trained}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary" fontWeight={700} sx={{ fontSize: 16 }}>Days Practiced This Week</Typography>
              <Typography variant="h4">{student.weekly_data.days_practiced}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary" fontWeight={700} sx={{ fontSize: 16 }}>Weekly Accuracy</Typography>
              <Typography variant="h4">{student.weekly_data.accuracy}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary" fontWeight={700} sx={{ fontSize: 16 }}>New Words This Week</Typography>
              <Typography variant="h4">{student.weekly_data.new_words}</Typography>
            </Box>
          </Box>
        </Card>
      )}

      {/* Vocabulary */}
      <Card sx={{ mb: 4, p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, letterSpacing: 1 }}>Vocabulary</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 4 }}>
          <Box>
            <Typography variant="subtitle1" color="text.secondary" fontWeight={700} sx={{ fontSize: 16 }}>Words Seen (Total)</Typography>
            <Typography variant="h4">{student.words_seen}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" color="text.secondary" fontWeight={700} sx={{ fontSize: 16 }}>New Words (Total)</Typography>
            <Typography variant="h4">{student.new_words}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" color="text.secondary" fontWeight={700} sx={{ fontSize: 16 }}>Skipped Words (Total)</Typography>
            <Typography variant="h4">{student.skipped_words}</Typography>
          </Box>
        </Box>
      </Card>

      {/* Performance */}
      <Card sx={{ mb: 4, p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, letterSpacing: 1 }}>Performance</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 4 }}>
          <Box>
            <Typography variant="subtitle1" color="text.secondary" fontWeight={700} sx={{ fontSize: 16 }}>Dubious Minutes (Total)</Typography>
            <Typography variant="h4">{student.dubious_minutes}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" color="text.secondary" fontWeight={700} sx={{ fontSize: 16 }}>Assessment Score</Typography>
            <Typography variant="h4">{student.assessment_score || '-'}</Typography>
          </Box>
        </Box>
      </Card>

      {/* Weekly Summary and Graph, Session History (unchanged) */}
      {student.weekly_minutes && student.weekly_minutes.length > 0 && (
        <Card sx={{ p: 4, mb: 6, borderRadius: 3, background: 'white' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>Weekly Minutes Graph</Typography>
          <WeeklyMembeanGraph data={student.weekly_minutes} />
        </Card>
      )}
    </Box>
  );
};

export default MembeanStudentPage; 