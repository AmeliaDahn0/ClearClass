import { StudentData } from '../types/types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const fetchStudents = async (): Promise<StudentData[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/students`);
    if (!response.ok) {
      throw new Error('Failed to fetch students');
    }
    const data = await response.json();
    return Object.entries(data.students).map(([id, studentData]: [string, any]) => ({
      id,
      name: studentData.name,
      email: '',
      level_number: '',
      current_level_progress: '',
      problems_answered_today: '',
      problems_answered_yesterday: '',
      sessions: {
        days: {
          completed: [],
          started: []
        },
        total_completed: '',
        total_started: ''
      },
      grade: '',
      progress_bar: [],
      timestamp: new Date().toISOString(),
      platforms: [],
      current_data: studentData.current_data,
      tabs_data: {
        Assessments: {},
        Writing: {},
        Overview: {},
        Reports: studentData.current_data
      },
      subjects: {}
    }));
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};

export const fetchStudent = async (studentId: string): Promise<StudentData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/students/${studentId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch student');
    }
    const studentData = await response.json();
    return {
      id: studentId,
      name: studentData.name,
      email: '',
      level_number: '',
      current_level_progress: '',
      problems_answered_today: '',
      problems_answered_yesterday: '',
      sessions: {
        days: {
          completed: [],
          started: []
        },
        total_completed: '',
        total_started: ''
      },
      grade: '',
      progress_bar: [],
      timestamp: new Date().toISOString(),
      platforms: [],
      current_data: studentData.current_data,
      tabs_data: {
        Assessments: {},
        Writing: {},
        Overview: {},
        Reports: studentData.current_data
      },
      subjects: {}
    };
  } catch (error) {
    console.error('Error fetching student:', error);
    throw error;
  }
}; 