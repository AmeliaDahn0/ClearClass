import { Box, Typography, Card, Grid, CircularProgress, Accordion, AccordionSummary, AccordionDetails, Stack, Icon } from '@mui/material';
import { StudentData } from '../types/types';
import WeeklyXPGraph from '../components/MathAcademy/WeeklyXPGraph';

const MathAcademyPage = ({ student }: { student: StudentData }) => (
  <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
    {/* Main Stats Card */}
    <Card 
      sx={{ 
        mb: 4,
        background: 'linear-gradient(135deg, #1a365d 0%, #2563eb 100%)',
        color: 'white',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ p: 4 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4, alignItems: 'center' }}>
          <Box>
            <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.7)', letterSpacing: 2 }}>
              Current Course
            </Typography>
            <Typography variant="h1" sx={{ mb: 1, fontSize: { xs: '3rem', md: '4rem' } }}>
              {student.mathAcademy?.courseInfo?.name || 'Not Enrolled'}
            </Typography>
            <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.9)', mt: 2 }}>
              {student.mathAcademy?.lastActivity || 'Never'}
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}>
              Est. completion: {student.mathAcademy?.estimatedCompletion || 'Not available'}
            </Typography>
            {student.mathAcademy?.studentUrl && (
              <Typography variant="body2" sx={{ mt: 2 }}>
                <a 
                  href={student.mathAcademy.studentUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: 'rgba(255,255,255,0.9)', 
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  View on Math Academy
                  <Icon sx={{ fontSize: 16 }}>open_in_new</Icon>
                </a>
              </Typography>
            )}
          </Box>
          <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <CircularProgress
                variant="determinate"
                value={parseInt(student.mathAcademy?.courseInfo?.percentComplete || '0')}
                size={160}
                thickness={6}
                sx={{
                  color: 'white',
                  opacity: 0.7,
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                  }
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}
              >
                <Typography variant="h2">
                  {student.mathAcademy?.courseInfo?.percentComplete || '0%'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Course Progress
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Card>

    {/* Weekly XP Card */}
    <Card sx={{ mb: 4, p: 3 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Weekly XP
          </Typography>
          <Typography variant="h2" color="primary.main" sx={{ mb: 1 }}>
            {student.mathAcademy?.weeklyXP || '0'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <span>earned this week</span>
            <span style={{ margin: '0 4px' }}>•</span>
            <span style={{ 
              color: (parseInt(student.mathAcademy?.weeklyXP?.split(' ')[0] || '0') >= 
                      parseInt(student.mathAcademy?.expectedWeeklyXP?.split(' ')[0] || '0')) 
                ? '#15803d' // success.dark
                : '#dc2626' // error.main
            }}>
              {student.mathAcademy?.expectedWeeklyXP || '0 XP'} expected
            </span>
          </Typography>
        </Box>
        <Box>
          <Typography variant="h6" gutterBottom>
            Daily XP
          </Typography>
          <Typography variant="h2" color="primary.main" sx={{ mb: 1 }}>
            {(() => {
              // Format today's date to match the format in the data
              const today = new Date();
              const todayKey = today.toLocaleDateString('en-US', { 
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              });
              
              // Find today's activity data
              const todayActivity = Object.entries(student.mathAcademy?.dailyActivity || {})
                .find(([date]) => date.startsWith(todayKey));
              
              return todayActivity ? todayActivity[1].dailyXP : '0 XP';
            })()}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <span>earned today</span>
            {new Date().getDay() !== 0 && new Date().getDay() !== 6 && (
              <>
                <span style={{ margin: '0 4px' }}>•</span>
                <span style={{ 
                  color: (parseInt((student.mathAcademy?.dailyActivity && 
                    Object.values(student.mathAcademy.dailyActivity)[0]?.dailyXP || '0 XP').split(' ')[0] || '0') >= 70)
                    ? '#15803d' // success.dark
                    : '#dc2626' // error.main
                }}>
                  70 XP expected
                </span>
              </>
            )}
          </Typography>
        </Box>
      </Box>
      {student.mathAcademy?.dailyActivity && (
        <WeeklyXPGraph dailyActivity={student.mathAcademy.dailyActivity} />
      )}
    </Card>

    {/* Daily Activity */}
    <Card sx={{ mb: 4 }}>
      <Box sx={{ p: 3, pb: 1 }}>
        <Typography variant="h6" gutterBottom>
          Daily Activity
        </Typography>
      </Box>
      {student.mathAcademy?.dailyActivity ? (
        Object.entries(student.mathAcademy.dailyActivity).map(([date, dayData]) => (
          <Accordion key={date} defaultExpanded={date.includes('today') || date.includes(new Date().toLocaleDateString())}>
            <AccordionSummary
              expandIcon={<Icon>expand_more</Icon>}
              sx={{
                borderTop: 1,
                borderColor: 'divider',
                '&.Mui-expanded': {
                  minHeight: 'auto',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'medium' }}>
                  {date.split('\n')[0]}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {dayData.dailyXP} earned
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0, pb: 2 }}>
              <Stack spacing={2}>
                {dayData.tasks.map((task) => (
                  <Card key={task.id} variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                          {task.name || task.type}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Completed at {task.completionTime}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: { sm: 'right' } }}>
                        <Typography 
                          variant="subtitle1" 
                          color={task.points?.earned >= task.points?.possible ? 'success.main' : 'warning.main'}
                        >
                          {task.points?.rawText || `${task.points?.earned}/${task.points?.possible} XP`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {task.type}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No activity recorded yet
          </Typography>
        </Box>
      )}
    </Card>
  </Box>
); 