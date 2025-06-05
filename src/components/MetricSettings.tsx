import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Typography,
} from '@mui/material';

export interface MetricSettings {
  mathAcademy: {
    metric: 'xp' | 'assessments' | 'tasks';
    target: number;
  };
  membean: {
    metric: 'minutes' | 'words' | 'accuracy';
    target: number;
  };
  alpharead: {
    metric: 'avgScore' | 'sessions' | 'timeReading' | 'practicedToday';
    target: number | 'yes' | 'no';
  };
}

interface MetricSettingsProps {
  open: boolean;
  onClose: () => void;
  settings: MetricSettings;
  onSave: (settings: MetricSettings) => void;
}

const MetricSettings: React.FC<MetricSettingsProps> = ({ open, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = React.useState<MetricSettings>({
    ...settings,
    alpharead: settings.alpharead || { metric: 'avgScore', target: 80 }
  });

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Customize Metrics</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>Math Academy</Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Metric</InputLabel>
              <Select
                value={localSettings.mathAcademy.metric}
                label="Metric"
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  mathAcademy: {
                    ...localSettings.mathAcademy,
                    metric: e.target.value as 'xp' | 'assessments' | 'tasks'
                  }
                })}
              >
                <MenuItem value="xp">XP Points</MenuItem>
                <MenuItem value="assessments">Assessments</MenuItem>
                <MenuItem value="tasks">Tasks</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Target"
              type="number"
              value={localSettings.mathAcademy.target}
              onChange={(e) => setLocalSettings({
                ...localSettings,
                mathAcademy: {
                  ...localSettings.mathAcademy,
                  target: parseInt(e.target.value) || 0
                }
              })}
              fullWidth
            />
          </Box>

          <Typography variant="h6" gutterBottom>Membean</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Metric</InputLabel>
              <Select
                value={localSettings.membean.metric}
                label="Metric"
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  membean: {
                    ...localSettings.membean,
                    metric: e.target.value as 'minutes' | 'words' | 'accuracy'
                  }
                })}
              >
                <MenuItem value="minutes">Minutes</MenuItem>
                <MenuItem value="accuracy">Accuracy</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Target"
              type="number"
              value={localSettings.membean.target}
              onChange={(e) => setLocalSettings({
                ...localSettings,
                membean: {
                  ...localSettings.membean,
                  target: parseInt(e.target.value) || 0
                }
              })}
              fullWidth
            />
          </Box>

          <Typography variant="h6" gutterBottom>AlphaRead</Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Metric</InputLabel>
              <Select
                value={localSettings.alpharead.metric}
                label="Metric"
                onChange={(e) => {
                  const metric = e.target.value as 'avgScore' | 'sessions' | 'timeReading' | 'practicedToday';
                  setLocalSettings({
                    ...localSettings,
                    alpharead: {
                      ...localSettings.alpharead,
                      metric,
                      target: metric === 'practicedToday' ? 'yes' : 0
                    }
                  });
                }}
              >
                <MenuItem value="avgScore">Avg Score (%)</MenuItem>
                <MenuItem value="sessions">Sessions</MenuItem>
                <MenuItem value="timeReading">Time Reading (min)</MenuItem>
                <MenuItem value="practicedToday">Practiced Today</MenuItem>
              </Select>
            </FormControl>
            {localSettings.alpharead.metric === 'practicedToday' ? (
              <FormControl fullWidth>
                <InputLabel>Target</InputLabel>
                <Select
                  value={localSettings.alpharead.target}
                  label="Target"
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    alpharead: {
                      ...localSettings.alpharead,
                      target: e.target.value as 'yes' | 'no'
                    }
                  })}
                >
                  <MenuItem value="yes">Yes</MenuItem>
                  <MenuItem value="no">No</MenuItem>
                </Select>
              </FormControl>
            ) : (
              <TextField
                label="Target"
                type="number"
                value={localSettings.alpharead.target}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  alpharead: {
                    ...localSettings.alpharead,
                    target: parseInt(e.target.value) || 0
                  }
                })}
                fullWidth
              />
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default MetricSettings; 