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
  displayPercentOverride?: number;
}

// Add metric label mapping for AlphaRead
const ALPHAREAD_METRIC_LABELS: Record<string, string> = {
  avgScore: 'Avg Score',
  sessions: 'Sessions',
  timeReading: 'Time Reading',
  practicedToday: 'Practiced Today',
};

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
    },
    alpharead: {
      metric: 'avgScore',
      target: 80
    }
  });
  const [lastScrape, setLastScrape] = useState<string | null>(null);

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

  useEffect(() => {
    // Fetch the last scrape timestamp from the Membean data file
    fetch('/data/membean_data_latest.json')
      .then(res => res.json())
      .then(data => {
        if (data.timestamp) {
          const date = new Date(data.timestamp);
          setLastScrape(date.toLocaleString(undefined, {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
          }));
        }
      })
      .catch(() => setLastScrape(null));
  }, []);

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
        case 'xp': {
          const target = metricSettings.mathAcademy.target;
          const dailyXP = todayActivity?.dailyXP || `0/${target} XP`;
          // Robustly extract earned and target
          const match = dailyXP.match(/(\d+)\s*\/\s*(\d+)/);
          const earned = match ? parseInt(match[1], 10) : 0;
          const parsedTarget = match ? parseInt(match[2], 10) : 0;
          if (parsedTarget === 0) return earned === 0 ? 100 : 0;
          if (isNaN(earned) || isNaN(parsedTarget)) return 0;
          // Return the uncapped percentage for display
          return (earned / parsedTarget) * 100;
        }
        case 'assessments': {
          const assessments = todayActivity?.tasks?.filter((task: Task) => task.type === 'Assessment') || [];
          if (metricSettings.mathAcademy.target === 0 && assessments.length === 0) return 100;
          // Return the uncapped percentage for display
          return (assessments.length / metricSettings.mathAcademy.target) * 100;
        }
        case 'tasks': {
          const tasks = todayActivity?.tasks || [];
          if (metricSettings.mathAcademy.target === 0 && tasks.length === 0) return 100;
          // Return the uncapped percentage for display
          return (tasks.length / metricSettings.mathAcademy.target) * 100;
        }
        default:
          return 0;
      }
    } else if (platform === 'membean') {
      switch (metricSettings.membean.metric) {
        case 'minutes':
          const minutesTrained = student.tabs_data?.Reports?.minutes_trained || 0;
          return (minutesTrained / metricSettings.membean.target) * 100;
        case 'words':
          const wordsSeen = student.current_data?.words_seen || 0;
          return (wordsSeen / metricSettings.membean.target) * 100;
        case 'accuracy':
          const accuracy = parseInt(student.tabs_data?.Reports?.accuracy || '0');
          return (accuracy / metricSettings.membean.target) * 100;
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
        case 'xp': {
          const target = metricSettings.mathAcademy.target;
          const dailyXP = todayActivity?.dailyXP || `0/${target} XP`;
          const [earned] = dailyXP.split(/[ /]/);
          return `${earned}/${target} XP`;
        }
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
        case 'accuracy':
          let accuracy = student.tabs_data?.Reports?.accuracy || '0%';
          accuracy = typeof accuracy === 'string' ? accuracy.replace('%', '') : accuracy;
          return `${accuracy}/${metricSettings.membean.target}%`;
        default:
          return '0/0';
      }
    } else if (platform === 'alpharead') {
      const alpha = student.alpharead;
      const metric = metricSettings.alpharead.metric;
      const target = metricSettings.alpharead.target;
      if (!alpha) return 'No data';
      switch (metric) {
        case 'avgScore':
          return `${alpha.average_score ?? 0}/${target} ${ALPHAREAD_METRIC_LABELS[metric]}`;
        case 'sessions':
          return `${alpha.total_sessions ?? 0}/${target} ${ALPHAREAD_METRIC_LABELS[metric]}`;
        case 'timeReading': {
          // Convert time_reading (e.g. '8h 38m') to minutes
          let minutes = 0;
          if (alpha.time_reading) {
            const hMatch = alpha.time_reading.match(/(\d+)h/);
            const mMatch = alpha.time_reading.match(/(\d+)m/);
            minutes = (hMatch ? parseInt(hMatch[1]) : 0) * 60 + (mMatch ? parseInt(mMatch[1]) : 0);
          }
          return `${minutes}/${target} min ${ALPHAREAD_METRIC_LABELS[metric]}`;
        }
        case 'practicedToday':
          return `Practiced Today: ${target === 'yes' ? 'Yes' : 'No'}`;
        default:
          return '';
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

  const SubjectCard: React.FC<SubjectCardProps> = ({ title, progress, details, studentId, platform, dailyXP, dailyGoal, goalColor, displayPercentOverride }) => {
    // Ensure progress is a number
    const progressNum = typeof progress === 'string' ? parseFloat(progress) : progress;
    const isMathAcademy = platform === 'math-academy';
    const isMembean = platform === 'membean';
    // Use the override for the displayed percent if provided (uncapped for color logic)
    const uncappedPercent = typeof displayPercentOverride === 'number' && !isNaN(displayPercentOverride)
      ? displayPercentOverride
      : progressNum;
    const displayPercent = `${Math.round(uncappedPercent)}%`;
    // Cap the progress bar at 100 for display only
    const progressBarValue = isNaN(progressNum) ? 0 : Math.min(progressNum, 100);
    // Color logic: green if progress is 100 or more for Math Academy and Membean (using uncapped percent)
    const progressColor = (isMathAcademy || isMembean)
      ? uncappedPercent >= 100 ? '#4CAF50' : '#f44336'
      : (progressNum >= 80 ? '#4CAF50' : progressNum >= 60 ? '#FFA726' : '#f44336');

    return (
      <Card 
        sx={{ 
          p: 2.5,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: 320,
          minWidth: 320,
          maxWidth: 320,
          height: 340,
          minHeight: 340,
          maxHeight: 340,
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
            value={progressBarValue}
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
                textAlign: 'center',
                fontSize: '1.1rem',
                lineHeight: 1.2
              }}
            >
              {platform === 'alpharead' && dailyGoal && (typeof dailyGoal === 'string') ? dailyGoal : displayPercent}
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
          {isMathAcademy ? (dailyXP || '') : (dailyXP || dailyGoal)}
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
      {/* Last Scrape Timestamp */}
      {lastScrape && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Last updated: {lastScrape}
          </Typography>
        </Box>
      )}
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
                        progress={Math.min(calculateProgress(student, 'math-academy'), 100)}
                        displayPercentOverride={calculateProgress(student, 'math-academy')}
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
                      `Minutes Trained: ${student.tabs_data?.Reports?.minutes_trained ?? 0}`,
                      `Last Trained: ${student.current_data?.last_trained || 'Never'}`
                    ].join('\n');
                    return (
                      <SubjectCard
                        title="Membean"
                        progress={Math.min(calculateProgress(student, 'membean'), 100)}
                        displayPercentOverride={calculateProgress(student, 'membean')}
                        details={details}
                        studentId={student.id}
                        platform="membean"
                        dailyGoal={getDisplayValue(student, 'membean')}
                      />
                    );
                  })()}
                </Box>

                {/* AlphaRead Card */}
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'stretch' }}>
                  {(() => {
                    const alpha = student.alpharead;
                    let progress = 0;
                    let details = "No AlphaRead data";
                    let goalColor = '#f44336'; // red by default
                    let customLabel = undefined;
                    let customProgressColor = undefined;
                    // Get AlphaRead metric settings
                    const alphaMetric = metricSettings.alpharead?.metric;
                    const alphaTarget = metricSettings.alpharead?.target;
                    // Check if practiced today (for label)
                    let practicedToday = false;
                    if (alpha && alpha.last_active) {
                      const today = new Date();
                      const todayStr = today.toLocaleString('en-US', { month: 'short', day: 'numeric' });
                      practicedToday = alpha.last_active.toLowerCase().includes(todayStr.toLowerCase());
                    }
                    if (alpha) {
                      details = [
                        `Level: ${alpha.reading_level}`,
                        `Avg Score: ${alpha.average_score}`,
                        `Sessions: ${alpha.total_sessions}`,
                        `Last Active: ${alpha.last_active}`,
                        `Time Reading: ${alpha.time_reading}`,
                      ].join('\n');
                    }
                    // Always show the practice status as the label
                    customLabel = practicedToday ? 'Practiced Today: Yes' : 'Practiced Today: No';

                    // Color logic: green if student met the selected metric, red if not
                    let metricMet = false;
                    if (alpha) {
                      switch (alphaMetric) {
                        case 'avgScore':
                          metricMet = (parseFloat(alpha.average_score) || 0) >= (typeof alphaTarget === 'number' ? alphaTarget : 0);
                          break;
                        case 'sessions':
                          metricMet = (parseInt(alpha.total_sessions) || 0) >= (typeof alphaTarget === 'number' ? alphaTarget : 0);
                          break;
                        case 'timeReading': {
                          let minutes = 0;
                          if (alpha.time_reading) {
                            const hMatch = alpha.time_reading.match(/(\d+)h/);
                            const mMatch = alpha.time_reading.match(/(\d+)m/);
                            minutes = (hMatch ? parseInt(hMatch[1]) : 0) * 60 + (mMatch ? parseInt(mMatch[1]) : 0);
                          }
                          metricMet = minutes >= (typeof alphaTarget === 'number' ? alphaTarget : 0);
                          break;
                        }
                        case 'practicedToday':
                          metricMet = (alphaTarget === 'yes' && practicedToday) || (alphaTarget === 'no' && !practicedToday);
                          break;
                        default:
                          metricMet = false;
                      }
                    }
                    progress = metricMet ? 100 : 0;
                    goalColor = metricMet ? '#4CAF50' : '#f44336';
                    customProgressColor = goalColor;

                    return (
                      <SubjectCard
                        title="AlphaRead"
                        progress={progress}
                        details={details}
                        studentId={student.id}
                        platform="alpharead"
                        goalColor={customProgressColor || goalColor}
                        dailyGoal={customLabel}
                      />
                    );
                  })()}
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