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
  IconButton,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import SettingsIcon from '@mui/icons-material/Settings';
import { StudentData } from '../types/types';
import MetricSettings, { MetricSettings as MetricSettingsType } from './MetricSettings';

interface DashboardProps {
  students: StudentData[];
  loading: boolean;
  error: string | null;
}

interface Task {
  id: string;
  type: string;
  name: string | null;
  completionTime: string;
  points: {
    earned: number;
    possible: number;
    rawText: string;
  };
  progress: string;
}

interface DailyActivity {
  date: string;
  dailyXP: string;
  tasks: Task[];
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [metricSettings, setMetricSettings] = useState<MetricSettingsType>({
    mathAcademy: {
      metric: 'xp',
      target: 70
    },
    membean: {
      metric: 'minutes',
      target: 15
    }
  });

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

  const handleSettingsSave = (newSettings: MetricSettingsType) => {
    setMetricSettings(newSettings);
    // Save to localStorage for persistence
    localStorage.setItem('metricSettings', JSON.stringify(newSettings));
  };

  useEffect(() => {
    // Load settings from localStorage on mount
    const savedSettings = localStorage.getItem('metricSettings');
    if (savedSettings) {
      setMetricSettings(JSON.parse(savedSettings));
    }
  }, []);

  const calculateProgress = (student: StudentData, platform: string) => {
    if (platform === 'math-academy') {
      const today = new Date();
      const todayKey = today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const todayActivityEntry = Object.entries(student.mathAcademy?.dailyActivity || {}).find(([date]) => date.startsWith(todayKey));
      const todayActivity = todayActivityEntry ? todayActivityEntry[1] as DailyActivity : null;
      
      switch (metricSettings.mathAcademy.metric) {
        case 'xp':
          const dailyXP = todayActivity?.dailyXP || '0/70 XP';
          const [earned] = (dailyXP || '0/70 XP').split(/[ /]/);
          return Math.min(Math.round((parseInt(earned) / metricSettings.mathAcademy.target) * 100), 100);
        case 'assessments':
          const assessments = todayActivity?.tasks?.filter((task: Task) => task.type === 'Assessment') || [];
          return Math.min(Math.round((assessments.length / metricSettings.mathAcademy.target) * 100), 100);
        case 'tasks':
          const tasks = todayActivity?.tasks || [];
          return Math.min(Math.round((tasks.length / metricSettings.mathAcademy.target) * 100), 100);
        default:
          return 0;
      }
    } else if (platform === 'membean') {
      switch (metricSettings.membean.metric) {
        case 'minutes':
          const minutesTrained = student.tabs_data?.Reports?.minutes_trained || 0;
          return Math.min(Math.round((minutesTrained / metricSettings.membean.target) * 100), 100);
        case 'words':
          const wordsSeen = student.current_data?.words_seen || 0;
          return Math.min(Math.round((wordsSeen / metricSettings.membean.target) * 100), 100);
        case 'accuracy':
          const accuracy = parseInt(student.tabs_data?.Reports?.accuracy || '0');
          return Math.min(Math.round((accuracy / metricSettings.membean.target) * 100), 100);
        default:
          return 0;
      }
    }
    return 0;
  };

  const getDisplayValue = (student: StudentData, platform: string) => {
    if (platform === 'math-academy') {
      const today = new Date();
      const todayKey = today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const todayActivityEntry = Object.entries(student.mathAcademy?.dailyActivity || {}).find(([date]) => date.startsWith(todayKey));
      const todayActivity = todayActivityEntry ? todayActivityEntry[1] as DailyActivity : null;
      
      switch (metricSettings.mathAcademy.metric) {
        case 'xp':
          const dailyXP = todayActivity?.dailyXP || '0/70 XP';
          const [earned] = (dailyXP || '0/70 XP').split(/[ /]/);
          return `${earned}/${metricSettings.mathAcademy.target} XP`;
        case 'assessments':
          const assessments = todayActivity?.tasks?.filter((task: Task) => task.type === 'Assessment') || [];
          return `${assessments.length}/${metricSettings.mathAcademy.target} Assessments`;
        case 'tasks':
          const tasks = todayActivity?.tasks || [];
          return `${tasks.length}/${metricSettings.membean.target} Tasks`;
        default:
          return '0/0';
      }
    } else if (platform === 'membean') {
      switch (metricSettings.membean.metric) {
        case 'minutes':
          const minutesTrained = student.tabs_data?.Reports?.minutes_trained || 0;
          return `${minutesTrained}/${metricSettings.membean.target} minutes`;
        case 'words':
          const wordsSeen = student.current_data?.words_seen || 0;
          return `${wordsSeen}/${metricSettings.membean.target} words`;
        case 'accuracy':
          const accuracy = student.tabs_data?.Reports?.accuracy || '0%';
          return `${accuracy}/${metricSettings.membean.target}%`;
        default:
          return '0/0';
      }
    }
    return '0/0';
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
        const target = metricSettings.mathAcademy.target;
        return progress >= 100 ? '#4CAF50' : '#f44336';
      }
      return progress >= 80 ? '#4CAF50' : progress >= 60 ? '#FFA726' : '#f44336';
    };

    const progressColor = getProgressColor();

    const getDisplayValue = () => {
      if (platform === 'math-academy') {
        switch (metricSettings.mathAcademy.metric) {
          case 'xp':
            return dailyXP;
          case 'assessments':
            return `${progress}%`;
          case 'tasks':
            return `${progress}%`;
          default:
            return dailyXP;
        }
      } else if (platform === 'membean') {
        switch (metricSettings.membean.metric) {
          case 'minutes':
            return dailyGoal;
          case 'words':
            return `${progress}%`;
          case 'accuracy':
            return `${progress}%`;
          default:
            return dailyGoal;
        }
      }
      return dailyXP || dailyGoal;
    };

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

        <Typography
          variant="h4"
          sx={{
            color: progressColor,
            fontWeight: 'bold',
            mb: 1,
            textAlign: 'center',
          }}
        >
          {getDisplayValue()}
        </Typography>

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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ClearClass
        </Typography>
        <IconButton onClick={() => setSettingsOpen(true)} color="primary">
          <SettingsIcon />
        </IconButton>
      </Box>

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
                    const details = [
                      `Course: ${student.mathAcademy?.courseInfo?.name || 'Not enrolled'}`,
                      `Last Activity: ${student.mathAcademy?.lastActivity || 'Never'}`
                    ].join('\n');
                    return (
                      <SubjectCard
                        title="Math Academy"
                        progress={calculateProgress(student, 'math-academy')}
                        details={details}
                        studentId={student.id}
                        platform="math-academy"
                        dailyXP={getDisplayValue(student, 'math-academy')}
                      />
                    );
                  })()}
                </Box>

                {/* Membean Card */}
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'stretch' }}>
                  {(() => {
                    const details = [
                      `Level: ${student.current_data?.level || 'Not Started'}`,
                      `Accuracy: ${student.tabs_data?.Reports?.accuracy || '0%'}`,
                      `Last Trained: ${student.current_data?.last_trained || 'Never'}`
                    ].join('\n');
                    const progress = calculateProgress(student, 'membean');
                    const goalColor = progress >= 100 ? '#4CAF50' : '#f44336';
                    return (
                      <SubjectCard
                        title="Membean"
                        progress={progress}
                        details={details}
                        studentId={student.id}
                        platform="membean"
                        dailyGoal={getDisplayValue(student, 'membean')}
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

      <MetricSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={metricSettings}
        onSave={handleSettingsSave}
      />
    </Container>
  );
};

export default Dashboard; 