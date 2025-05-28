import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  Typography,
  CircularProgress,
  Paper,
  Divider,
  Snackbar,
  Alert,
  Container,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { StudentData } from '../types/types';

interface DashboardProps {
  students: StudentData[];
  loading: boolean;
  error: string | null;
}

// Function to get the last name from a full name
const getLastName = (fullName: string): string => {
  const nameParts = fullName.trim().split(' ');
  return nameParts.length > 1 ? nameParts[nameParts.length - 1] : fullName;
};

// Function to sort students by last name
const sortStudentsByLastName = (students: StudentData[]): StudentData[] => {
  return [...students].sort((a, b) => {
    const lastNameA = getLastName(a.name).toLowerCase();
    const lastNameB = getLastName(b.name).toLowerCase();
    return lastNameA.localeCompare(lastNameB);
  });
};

interface SubjectCardProps {
  title: string;
  progress: number;
  isCoaching?: boolean;
  details: string;
  studentId: string;
  platform: string;
  dailyXP?: string;
  dailyGoal?: string;
  goalColor?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ students, loading, error }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [timeframe, setTimeframe] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    console.log('Dashboard mounted/updated with students:', students);
    students.forEach(student => {
      console.log(`Student ${student.name} data:`, {
        id: student.id,
        currentData: student.current_data,
        membeanData: student.tabs_data?.Reports,
        subjects: student.subjects
      });
    });
  }, [students]);

  useLayoutEffect(() => {
    // Instantly jump to student card if returning from student page (no animation, no focus)
    const scrollToId = sessionStorage.getItem('scrollToStudentId');
    if (scrollToId) {
      const el = document.getElementById(`student-card-${scrollToId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
      sessionStorage.removeItem('scrollToStudentId');
    }
  }, [students]);

  // Sort students by last name
  const sortedStudents = sortStudentsByLastName(students);

  const handleTimeframeChange = (event: React.MouseEvent<HTMLElement>, newTimeframe: string) => {
    if (newTimeframe !== null) {
      setTimeframe(newTimeframe);
    }
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  if (loading) {
    console.log('Dashboard is in loading state');
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography variant="h5">Loading student data...</Typography>
      </Box>
    );
  }

  if (error) {
    console.error('Dashboard encountered an error:', error);
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography variant="h5" color="error">Error loading data: {error}</Typography>
      </Box>
    );
  }

  if (!students || students.length === 0) {
    console.warn('No students data available');
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography variant="h5">No student data available</Typography>
      </Box>
    );
  }

  const SubjectCard: React.FC<SubjectCardProps> = ({ title, progress, details, studentId, platform, dailyXP, dailyGoal, goalColor }) => {
    // Determine the appropriate color based on progress
    const getProgressColor = () => {
      if (platform === 'math-academy') {
        return progress >= 100 ? '#4CAF50' : '#f44336';  // green if >= 70XP (100%), red if < 70XP
      }
      return progress >= 80 ? '#4CAF50' : progress >= 60 ? '#FFA726' : '#f44336';
    };

    const progressColor = getProgressColor();

    return (
      <Card 
        sx={{ 
          p: 2.5,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: 220,
          minWidth: 220,
          maxWidth: 220,
          height: 300,
          minHeight: 300,
          maxHeight: 300,
          background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.08)`,
          borderRadius: 2,
          overflow: 'hidden',
          cursor: 'pointer',
          m: 1,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: `0 12px 40px rgba(0, 0, 0, 0.12), 0 0 0 2px ${progressColor}30`,
          },
        }}
        onClick={() => {
          sessionStorage.setItem('scrollToStudentId', studentId);
          navigate(`/student/${studentId}/${platform}`);
        }}
      >
        <Box sx={{ 
          position: 'relative', 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mb: 2,
          width: 100,
          height: 100,
          mx: 'auto',
        }}>
          <CircularProgress
            variant="determinate"
            value={100}
            size={100}
            thickness={5}
            sx={{ 
              color: (theme) => theme.palette.grey[200],
              position: 'absolute',
            }}
          />
          <CircularProgress
            variant="determinate"
            value={progress > 100 ? 100 : progress}
            size={100}
            thickness={5}
            sx={{
              position: 'absolute',
              color: progressColor,
              transition: 'all 0.5s ease-in-out',
              boxShadow: `0 0 10px ${progressColor}60`,
            }}
          />
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
            }}
          >
            <Typography 
              variant="h5" 
              component="div" 
              sx={{
                fontWeight: 'bold',
                color: progressColor,
              }}
            >
              {`${Math.round(progress)}%`}
            </Typography>
          </Box>
        </Box>

        <Typography 
          variant="h6" 
          sx={{ 
            mb: 1, 
            fontWeight: 'bold', 
            textAlign: 'center',
            color: theme.palette.text.primary
          }}
        >
          {title}
        </Typography>

        {platform === 'math-academy' && dailyXP && (
          <Typography
            variant="h4"
            sx={{
              color: progressColor,
              fontWeight: 'bold',
              mb: 1,
              textAlign: 'center',
            }}
          >
            {dailyXP}
          </Typography>
        )}

        {platform === 'membean' && dailyGoal && (
          <Typography
            variant="h4"
            sx={{
              color: goalColor || progressColor,
              fontWeight: 'bold',
              mb: 1,
              textAlign: 'center',
            }}
          >
            {dailyGoal}
          </Typography>
        )}

        {platform === 'rocket-math' && dailyGoal && (
          <Typography
            variant="h4"
            sx={{
              color: goalColor || progressColor,
              fontWeight: 'bold',
              mb: 1,
              textAlign: 'center',
            }}
          >
            {dailyGoal}
          </Typography>
        )}

        <Divider sx={{ width: '50%', my: 1, borderColor: `${progressColor}30` }} />

        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            textAlign: 'center', 
            whiteSpace: 'pre-line',
            px: 1,
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            width: '100%',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {details.split('\n').map((line, index) => {
            if (line.includes('Daily Goal:')) {
              return (
                <Typography 
                  key={index} 
                  variant="subtitle1" 
                  component="div" 
                  sx={{ 
                    color: 'text.primary',
                    fontWeight: 'medium',
                    my: 0.5,
                    borderLeft: `3px solid ${progressColor}`,
                    pl: 1,
                    borderRadius: '2px',
                  }}
                >
                  {line}
                </Typography>
              );
            }
            return <React.Fragment key={index}>{line}<br /></React.Fragment>;
          })}
        </Typography>
      </Card>
    );
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `linear-gradient(120deg, ${theme.palette.primary.light}15, ${theme.palette.secondary.light}15)`,
      pt: 3, 
      pb: 6
    }}>
      <Container maxWidth="xl">
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 2,
            background: `rgba(255, 255, 255, 0.9)`,
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: 2 
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold',
              color: theme.palette.primary.main,
              textShadow: '0 2px 4px rgba(0,0,0,0.05)',
            }}
          >
            ClearClass
          </Typography>
        </Paper>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {sortedStudents.map((student) => {
            console.log('Rendering student card:', {
              name: student.name,
              membeanData: {
                level: student.current_data?.level,
                minutesTrained: student.tabs_data?.Reports?.minutes_trained,
                accuracy: student.tabs_data?.Reports?.accuracy
              }
            });
            
            return (
              <Paper 
                key={student.id}
                id={`student-card-${student.id}`}
                elevation={0}
                sx={{ 
                  p: 4, 
                  borderRadius: 2,
                  background: `rgba(255, 255, 255, 0.8)`,
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  mb: 2,
                }}
              >
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                  <Typography 
                    variant="h5" 
                    component="h2" 
                    sx={{ 
                      fontWeight: 'bold',
                      position: 'relative',
                      display: 'inline-block',
                      '&:after': {
                        content: '""',
                        position: 'absolute',
                        width: '40%',
                        height: '4px',
                        background: theme.palette.primary.main,
                        bottom: '-8px',
                        left: 0,
                        borderRadius: '2px',
                      }
                    }}
                  >
                    {student.name}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'stretch', gap: 4 }}>
                  {/* Math Academy Card */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'stretch' }}>
                    {(() => {
                      const today = new Date();
                      const todayKey = today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                      const todayActivityEntry = Object.entries(student.mathAcademy?.dailyActivity || {}).find(([date]) => date.startsWith(todayKey));
                      const dailyXP = todayActivityEntry ? todayActivityEntry[1].dailyXP : '0/70 XP';
                      const [earned] = (dailyXP || '0/70 XP').split(/[ /]/);
                      const details = [
                        `Course: ${student.mathAcademy?.courseInfo?.name || 'Not enrolled'}`,
                        `Last Activity: ${student.mathAcademy?.lastActivity || 'Never'}`
                      ].join('\n');
                      return (
                        <SubjectCard
                          title="Math Academy"
                          progress={Math.min(Math.round((parseInt(earned) / 70) * 100), 100)}
                          details={details}
                          studentId={student.id}
                          platform="math-academy"
                          dailyXP={dailyXP}
                        />
                      );
                    })()}
                  </Box>

                  {/* Membean Card */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'stretch' }}>
                    {(() => {
                      const minutesTrained = student.tabs_data?.Reports?.minutes_trained || 0;
                      const goalMet = minutesTrained >= 15;
                      const goalColor = goalMet ? '#4CAF50' : '#f44336';
                      const details = [
                        `Level: ${student.current_data?.level || 'Not Started'}`,
                        `Accuracy: ${student.tabs_data?.Reports?.accuracy || '0%'}`,
                        `Last Trained: ${student.current_data?.last_trained || 'Never'}`
                      ].join('\n');
                      return (
                        <SubjectCard
                          title="Membean"
                          progress={Math.min(Math.round((minutesTrained / 15) * 100), 100)}
                          details={details}
                          studentId={student.id}
                          platform="membean"
                          dailyGoal={`${minutesTrained} minutes`}
                          goalColor={goalColor}
                        />
                      );
                    })()}
                  </Box>

                  {/* Fast Math Card */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'stretch' }}>
                    <SubjectCard
                      title="Fast Math"
                      progress={0}
                      details={"Coming soon!"}
                      studentId={student.id}
                      platform="fast-math"
                    />
                  </Box>

                  {/* AlphaRead Card */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'stretch' }}>
                    <SubjectCard
                      title="AlphaRead"
                      progress={0}
                      details={"Coming soon!"}
                      studentId={student.id}
                      platform="alpharead"
                    />
                  </Box>
                </Box>
              </Paper>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard; 