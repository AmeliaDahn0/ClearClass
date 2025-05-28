import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import StudentDetails from './pages/StudentDetails';
import { ThemeProvider, createTheme } from '@mui/material';
import { StudentData } from './types/types';
import ScraperDataService from './services/ScraperDataService';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
    },
    secondary: {
      main: '#475569',
    },
    success: {
      main: '#22c55e',
    },
    error: {
      main: '#ef4444',
    },
    info: {
      main: '#3b82f6',
    },
    warning: {
      main: '#f59e0b',
    },
  },
});

const App: React.FC = () => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dataService = ScraperDataService.getInstance();

    // Subscribe to data updates
    const unsubscribe = dataService.subscribe((newData) => {
      setStudents(newData);
      setLoading(false);
    });

    // Subscribe to errors
    const unsubscribeErrors = dataService.subscribeToErrors((error) => {
      setError(error.message);
      setLoading(false);
    });

    // Start polling for data
    dataService.startPolling().catch((error) => {
      setError(error.message);
      setLoading(false);
    });

    // Cleanup
    return () => {
      unsubscribe();
      unsubscribeErrors();
      dataService.stopPolling();
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard students={students} loading={loading} error={error} />} />
          <Route path="/student/:studentId/:platform" element={<StudentDetails students={students} />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App; 