import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LabelList,
  Legend,
  ReferenceLine,
} from 'recharts';

interface WeeklyXPGraphProps {
  dailyActivity: Record<string, {
    date: string;
    dailyXP: string;
    tasks: Array<{
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
    }>;
  }>;
}

const WeeklyXPGraph: React.FC<WeeklyXPGraphProps> = ({ dailyActivity }) => {
  const theme = useTheme();
  
  // Process the data to get the last 7 days
  const processData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const data = [];

    // Create array for last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      const dateStr = date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });

      // Find matching activity data
      const activityEntry = Object.entries(dailyActivity).find(([key]) => 
        key.startsWith(dateStr)
      );

      // Extract XP value
      let xp = 0;
      if (activityEntry) {
        const xpStr = activityEntry[1].dailyXP;
        xp = parseInt(xpStr.split(' ')[0]) || 0;
      }

      // Determine if this is today
      const isToday = i === 0;

      data.push({
        day: dayName,
        xp: xp,
        isToday,
        fullDate: date.toLocaleDateString('en-US', { 
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        }),
        goalMet: xp >= 70
      });
    }

    return data;
  };

  const data = processData();
  
  // Find the highest value for setting a nice Y-axis
  const maxXP = Math.max(...data.map(day => day.xp));
  const yAxisMax = Math.max(Math.ceil(maxXP * 1.2), 70); // At least show the 70 XP daily goal

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: `1px solid ${theme.palette.primary.light}`,
            borderRadius: 1,
            p: 1.5,
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Typography variant="subtitle2" color="primary.dark" fontWeight="bold">
            {payload[0].payload.fullDate}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <span style={{ fontWeight: 'bold' }}>{payload[0].value}</span> XP earned
          </Typography>
          {payload[0].value < 70 && !payload[0].payload.isToday && (
            <Typography variant="caption" sx={{ color: theme.palette.error.main, display: 'block', mt: 0.5 }}>
              {70 - payload[0].value} XP below daily goal
            </Typography>
          )}
          {payload[0].value >= 70 && (
            <Typography variant="caption" sx={{ color: theme.palette.success.main, display: 'block', mt: 0.5 }}>
              Daily goal achieved!
            </Typography>
          )}
        </Box>
      );
    }
    return null;
  };

  // Custom Y-axis tick formatter to add XP suffix
  const formatYAxis = (value: number) => {
    return `${value} XP`;
  };

  return (
    <Box sx={{ width: '100%', height: 350, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Weekly XP Distribution
      </Typography>
      <ResponsiveContainer>
        <BarChart 
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
          barSize={45}
        >
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4361ee" stopOpacity={1} />
              <stop offset="100%" stopColor="#3f37c9" stopOpacity={0.9} />
            </linearGradient>
            <linearGradient id="todayGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4cc9f0" stopOpacity={1} />
              <stop offset="100%" stopColor="#4895ef" stopOpacity={0.9} />
            </linearGradient>
            <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#31c48d" stopOpacity={1} />
              <stop offset="100%" stopColor="#059669" stopOpacity={0.9} />
            </linearGradient>
            <filter id="shadow" height="130%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.2"/>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
          <XAxis 
            dataKey="day" 
            axisLine={{ stroke: theme.palette.divider }} 
            tickLine={false}
            tick={{ 
              fill: theme.palette.text.secondary, 
              fontSize: 12,
              dy: 10
            }}
            height={60}
          />
          <YAxis 
            domain={[0, yAxisMax]} 
            axisLine={false}
            tickLine={false}
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            tickFormatter={formatYAxis}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
          <ReferenceLine 
            y={70} 
            stroke="#e63946" 
            strokeDasharray="5 3" 
            strokeWidth={1.5}
            label={{ 
              value: 'Daily Goal (70 XP)', 
              position: 'right', 
              fill: '#e63946', 
              fontSize: 12 
            }}
          />
          <Bar 
            dataKey="xp" 
            radius={[6, 6, 0, 0]}
            filter="url(#shadow)"
            animationBegin={0}
            animationDuration={1500}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.goalMet ? 'url(#successGradient)' : entry.isToday ? 'url(#todayGradient)' : 'url(#barGradient)'}
              />
            ))}
            <LabelList 
              dataKey="xp" 
              position="top" 
              formatter={(value: number) => (value > 0 ? value : '')}
              style={{ 
                fill: theme.palette.text.primary, 
                fontSize: 12, 
                fontWeight: 'bold'
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default WeeklyXPGraph; 