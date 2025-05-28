import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import MembeanPage from './MembeanPage';
import { MembeanRawData } from '../types/types';

interface StudentDetailsProps {
  students: { [key: string]: MembeanRawData };
}

const MathAcademyPage = ({ student }: { student: MembeanRawData }) => {
  return <Typography>Math Academy page coming soon</Typography>;
};

const StudentDetails: React.FC<StudentDetailsProps> = ({ students }) => {
  const { studentId, platform } = useParams<{ studentId: string; platform: string }>();
  const navigate = useNavigate();
  
  // Find student by ID
  const student = students[studentId || ''];

  console.log('Looking for student with ID:', studentId);
  console.log('Found student data:', student);

  if (!student) {
    return (
      <Box sx={{ p: 3 }}>
        <Button onClick={() => navigate('/')} sx={{ mb: 2 }}>
          ← Back to Dashboard
        </Button>
        <Typography variant="h5">Student not found</Typography>
      </Box>
    );
  }

  const renderPlatformPage = () => {
    switch (platform) {
      case 'membean':
        return <MembeanPage student={student} />;
      case 'math-academy':
        return <MathAcademyPage student={student} />;
      default:
        return <Typography>Platform not found</Typography>;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button onClick={() => navigate('/')} sx={{ mr: 2 }}>
          ← Back
        </Button>
        <Typography variant="h4">
          {student.name.split(', ').reverse().join(' ')}
        </Typography>
      </Box>

      {renderPlatformPage()}
    </Box>
  );
};

export default StudentDetails; 