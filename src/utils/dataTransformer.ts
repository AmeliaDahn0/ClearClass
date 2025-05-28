import { StudentData } from '../types/types';

interface MathAcademyStudent {
  name: string;
  student_id: string;
  student_url: string;
  dashboard_info: {
    course_info: {
      name: string;
      percent_complete: string;
    };
    last_activity: string;
    today_progress: {
      points: string;
    };
    weekly_xp: string;
  };
  detailed_info: {
    estimated_completion?: string | null;
    course_info: Record<string, any>;
    activity_stats: Record<string, any>;
    recent_activities: any[];
    mastery_progress: any[];
    weekly_activity?: {
      total_xp?: string;
      daily_activities?: Array<{
        day: string;
        height: number;
        top_position: number;
        activity_value: number;
      }>;
    };
    tasks?: Array<{
      id: string;
      type: string;
      name: string | null;
      completion: string;
      points: {
        scored: number | null;
        possible: number | null;
        raw_text: string | null;
      };
      progress: string;
    }>;
    daily_activity?: Record<string, any>;
  };
}

interface MembeanData {
  timestamp: string;
  url?: string;
  students: {
    [key: string]: {
      name: string;
      current_data: {
        level: string;
        level_sort: number;
        words_seen: number;
        last_trained: string;
      };
      tabs_data: {
        Reports: {
          goal_met: boolean;
          goal_progress: string;
          fifteen_min_days: number;
          minutes_trained: number;
          accuracy: string;
          dubious_minutes: number;
          skipped_words: number;
          new_words: number;
          assessment_score: string;
        };
      };
      weekly_data?: {
        goal_met: boolean;
        minutes_trained: number;
        accuracy: string;
        new_words: number;
        days_practiced: number;
      };
    };
  };
}

interface Task {
  id: string;
  type: string;
  name: string | null;
  completion: string;
  points: {
    scored: number | null;
    possible: number | null;
    raw_text: string | null;
  };
  progress: string;
}

const normalizeStudentName = (name: string): string => {
  // Convert "LastName, FirstName" to "FirstName LastName"
  if (name.includes(',')) {
    const [lastName, firstName] = name.split(',').map(part => part.trim());
    return `${firstName} ${lastName}`;
  }
  return name.trim();
};

const findMatchingStudent = (name: string, students: any[]): any | undefined => {
  const normalizedName = normalizeStudentName(name).toLowerCase();
  return students.find(student => {
    const studentName = student.name ? 
      normalizeStudentName(student.name).toLowerCase() :
      normalizeStudentName(student.email.split('@')[0].replace('.', ' ')).toLowerCase();
    return studentName === normalizedName;
  });
};

const generateStudentId = (name: string): string => {
  return name.toLowerCase().replace(/\s+/g, '-');
};

// Helper function to adapt Math Academy data to expected format
const adaptMathAcademyData = (data: any): MathAcademyStudent => {
  return {
    name: data.name,
    student_id: data.student_id,
    student_url: data.student_url || '',
    dashboard_info: {
      course_info: {
        name: data.dashboard_info?.course_info?.name || '',
        percent_complete: data.dashboard_info?.course_info?.percent_complete || '0%'
      },
      last_activity: data.dashboard_info?.last_activity || '',
      today_progress: {
        points: data.dashboard_info?.today_progress?.points || '0/0'
      },
      weekly_xp: data.dashboard_info?.weekly_xp || '0'
    },
    detailed_info: {
      estimated_completion: data.detailed_info?.estimated_completion || null,
      course_info: {},
      activity_stats: {},
      recent_activities: [],
      mastery_progress: [],
      weekly_activity: data.detailed_info?.weekly_activity,
      tasks: data.detailed_info?.tasks || [],
      daily_activity: data.detailed_info?.daily_activity || {}
    }
  };
};

// Add this helper function before transformData
const getDaysSinceLastLogin = (lastLoginStr: string): number => {
  if (lastLoginStr === 'Never' || lastLoginStr === '-') return -1;
  const lastLogin = new Date(lastLoginStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastLogin.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export const transformData = (
  mathAcademyData: any[],
  membeanDailyData: MembeanData,
  membeanWeeklyData: MembeanData,
  membeanDailyDataArray: MembeanData[]
): StudentData[] => {
  // Create a map to store all unique students, using lowercase normalized name as key
  const studentsMap = new Map<string, StudentData>();

  // Helper function to choose the best name format
  const chooseBestName = (existingName: string, newName: string): string => {
    // Prefer names that start with a capital letter
    if (newName[0] >= 'A' && newName[0] <= 'Z') {
      return newName;
    }
    return existingName;
  };

  // Process Math Academy students with adapted data
  (mathAcademyData || []).forEach(mathStudent => {
    const adaptedStudent = adaptMathAcademyData(mathStudent);
    const normalizedName = normalizeStudentName(adaptedStudent.name);
    const mapKey = normalizedName.toLowerCase();
    
    if (!studentsMap.has(mapKey)) {
      studentsMap.set(mapKey, {
        id: generateStudentId(normalizedName),
        name: normalizedName,
        email: '',
        level_number: '',
        current_level_progress: '',
        problems_answered_today: '',
        problems_answered_yesterday: '',
        sessions: {
          days: { completed: [], started: [] },
          total_completed: '',
          total_started: ''
        },
        grade: '',
        progress_bar: [],
        timestamp: '',
        platforms: [],
        current_data: {
          level: '',
          level_sort: 0,
          words_seen: 0,
          last_trained: ''
        },
        tabs_data: {
          Assessments: {},
          Writing: {},
          Overview: {},
          Reports: {
            goal_met: false,
            goal_progress: '0',
            fifteen_min_days: 0,
            minutes_trained: 0,
            accuracy: '0%',
            dubious_minutes: 0,
            skipped_words: 0,
            new_words: 0,
            assessment_score: '0'
          }
        },
        subjects: {}
      });
    } else {
      // Update name if the new one is better formatted
      const existingStudent = studentsMap.get(mapKey)!;
      existingStudent.name = chooseBestName(existingStudent.name, normalizedName);
    }

    const student = studentsMap.get(mapKey)!;
    
    // Calculate progress percentage from points (e.g. "80/70 XP")
    const pointsMatch = adaptedStudent.dashboard_info.today_progress?.points?.match(/(\d+)\/(\d+)/);
    const currentPoints = pointsMatch ? parseInt(pointsMatch[1]) : 0;
    const goalPoints = pointsMatch ? parseInt(pointsMatch[2]) : 1; // Avoid division by zero
    const progressPercentage = Math.round((currentPoints / goalPoints) * 100);

    student.subjects['Math Academy'] = {
      progress: progressPercentage,
      isCoaching: false,
      sessionTime: '2h',
      details: `${adaptedStudent.dashboard_info.course_info.name}\nDaily Goal: ${adaptedStudent.dashboard_info.today_progress?.points || '0/0 XP'}\nLast activity: ${adaptedStudent.dashboard_info.last_activity}\nWeekly XP: ${adaptedStudent.dashboard_info.weekly_xp}`
    };

    // Calculate expected XP based on weekdays passed (70 XP per weekday)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const weekdaysPassed = Math.min(dayOfWeek === 0 ? 0 : dayOfWeek, 5); // Cap at 5 weekdays, handle Sunday

    // Add Math Academy specific data
    student.mathAcademy = {
      courseInfo: {
        name: adaptedStudent.dashboard_info.course_info.name,
        percentComplete: adaptedStudent.dashboard_info.course_info.percent_complete
      },
      lastActivity: adaptedStudent.dashboard_info.last_activity,
      weeklyXP: adaptedStudent.dashboard_info.weekly_xp,
      expectedWeeklyXP: `${weekdaysPassed * 70} XP`,
      estimatedCompletion: adaptedStudent.detailed_info.estimated_completion || 'Not available',
      tasks: adaptedStudent.detailed_info.tasks || [],
      studentUrl: adaptedStudent.student_url || '',
      dailyActivity: adaptedStudent.detailed_info.daily_activity ? 
        Object.entries(adaptedStudent.detailed_info.daily_activity).reduce((acc, [date, data]) => {
          acc[date] = {
            date: data.date,
            dailyXP: data.daily_xp,
            tasks: data.tasks.map((task: Task) => ({
              id: task.id,
              type: task.type,
              name: task.name,
              completionTime: task.completion,
              points: {
                earned: task.points.scored || 0,
                possible: task.points.possible || 0,
                rawText: task.points.raw_text || ''
              },
              progress: task.progress
            }))
          };
          return acc;
        }, {} as Record<string, any>)
      : {}
    };
  });

  // Process Membean students
  if (membeanDailyData && membeanDailyData.students) {
    console.log('Processing Membean daily data:', membeanDailyData);
    Object.entries(membeanDailyData.students).forEach(([studentId, membeanStudent]) => {
      if (!membeanStudent || !membeanStudent.name) {
        console.warn('Skipping invalid Membean student:', membeanStudent);
        return;
      }

      const normalizedName = normalizeStudentName(membeanStudent.name);
      const mapKey = normalizedName.toLowerCase();

      console.log('Processing Membean student:', {
        id: studentId,
        name: normalizedName,
        rawName: membeanStudent.name,
        currentData: membeanStudent.current_data,
        reportsData: membeanStudent.tabs_data?.Reports
      });

      // Create or update student data
      const studentData = studentsMap.get(mapKey) || {
        id: studentId,
        name: normalizedName,
        email: '',
        level_number: '',
        current_level_progress: '',
        problems_answered_today: '',
        problems_answered_yesterday: '',
        sessions: {
          days: { completed: [], started: [] },
          total_completed: '',
          total_started: ''
        },
        grade: '',
        progress_bar: [],
        timestamp: '',
        platforms: [],
        current_data: {
          level: '',
          level_sort: 0,
          words_seen: 0,
          last_trained: ''
        },
        tabs_data: {
          Assessments: {},
          Writing: {},
          Overview: {},
          Reports: {
            goal_met: false,
            goal_progress: '0',
            fifteen_min_days: 0,
            minutes_trained: 0,
            accuracy: '0%',
            dubious_minutes: 0,
            skipped_words: 0,
            new_words: 0,
            assessment_score: '0'
          }
        },
        subjects: {}
      };

      // Update student data with Membean daily data
      if (membeanStudent.current_data) {
        console.log('Updating current data for student:', normalizedName, membeanStudent.current_data);
        studentData.current_data = membeanStudent.current_data;
      }
      if (membeanStudent.tabs_data?.Reports) {
        console.log('Updating reports data for student:', normalizedName, membeanStudent.tabs_data.Reports);
        studentData.tabs_data.Reports = membeanStudent.tabs_data.Reports;
      }

      // Get weekly data for this student if available
      const weeklyData = membeanWeeklyData?.students?.[studentId];
      if (weeklyData) {
        studentData.weekly_data = {
          goal_met: weeklyData.tabs_data.Reports.goal_met,
          minutes_trained: weeklyData.tabs_data.Reports.minutes_trained,
          accuracy: weeklyData.tabs_data.Reports.accuracy,
          new_words: weeklyData.tabs_data.Reports.new_words,
          days_practiced: weeklyData.tabs_data.Reports.fifteen_min_days
        };
      }

      // Calculate progress
      const minutesTrained = membeanStudent.tabs_data?.Reports?.minutes_trained || 0;
      const DAILY_MINUTES_GOAL = 15;
      const progressPercentage = Math.min(Math.round((minutesTrained / DAILY_MINUTES_GOAL) * 100), 100);
      
      studentData.subjects['Membean'] = {
        progress: progressPercentage,
        isCoaching: true,
        sessionTime: '2h',
        details: `Level: ${membeanStudent.current_data?.level || 'Not Started'}\nWords Seen: ${membeanStudent.current_data?.words_seen || 0}\nMinutes Today: ${minutesTrained}/${DAILY_MINUTES_GOAL}\nLast trained: ${membeanStudent.current_data?.last_trained || 'Never'}`
      };

      // Store or update the student in the map
      studentsMap.set(mapKey, studentData);
      
      console.log('Final processed Membean student data:', studentData);
    });
  } else {
    console.warn('No Membean daily data available or invalid format:', membeanDailyData);
  }

  // Process Membean students for daily data array
  membeanDailyDataArray.forEach((dailyData, index) => {
    if (dailyData && dailyData.students) {
      console.log(`Processing Membean daily data for day ${index + 1}:`, dailyData);
      Object.entries(dailyData.students).forEach(([studentId, membeanStudent]) => {
        if (!membeanStudent || !membeanStudent.name) {
          console.warn(`Skipping invalid Membean student for day ${index + 1}:`, membeanStudent);
          return;
        }

        const normalizedName = normalizeStudentName(membeanStudent.name);
        const mapKey = normalizedName.toLowerCase();

        console.log(`Processing Membean student for day ${index + 1}:`, {
          id: studentId,
          name: normalizedName,
          rawName: membeanStudent.name,
          currentData: membeanStudent.current_data,
          reportsData: membeanStudent.tabs_data?.Reports
        });

        // Create or update student data
        const studentData = studentsMap.get(mapKey) || {
          id: studentId,
          name: normalizedName,
          email: '',
          level_number: '',
          current_level_progress: '',
          problems_answered_today: '',
          problems_answered_yesterday: '',
          sessions: {
            days: { completed: [], started: [] },
            total_completed: '',
            total_started: ''
          },
          grade: '',
          progress_bar: [],
          timestamp: '',
          platforms: [],
          current_data: {
            level: '',
            level_sort: 0,
            words_seen: 0,
            last_trained: ''
          },
          tabs_data: {
            Assessments: {},
            Writing: {},
            Overview: {},
            Reports: {
              goal_met: false,
              goal_progress: '0',
              fifteen_min_days: 0,
              minutes_trained: 0,
              accuracy: '0%',
              dubious_minutes: 0,
              skipped_words: 0,
              new_words: 0,
              assessment_score: '0'
            }
          },
          subjects: {}
        };

        // Update student data with Membean daily data
        if (membeanStudent.current_data) {
          console.log(`Updating current data for student for day ${index + 1}:`, normalizedName, membeanStudent.current_data);
          studentData.current_data = membeanStudent.current_data;
        }
        if (membeanStudent.tabs_data?.Reports) {
          console.log(`Updating reports data for student for day ${index + 1}:`, normalizedName, membeanStudent.tabs_data.Reports);
          studentData.tabs_data.Reports = membeanStudent.tabs_data.Reports;
        }

        // Get weekly data for this student if available
        const weeklyData = membeanWeeklyData?.students?.[studentId];
        if (weeklyData) {
          studentData.weekly_data = {
            goal_met: weeklyData.tabs_data.Reports.goal_met,
            minutes_trained: weeklyData.tabs_data.Reports.minutes_trained,
            accuracy: weeklyData.tabs_data.Reports.accuracy,
            new_words: weeklyData.tabs_data.Reports.new_words,
            days_practiced: weeklyData.tabs_data.Reports.fifteen_min_days
          };
        }

        // Calculate progress
        const minutesTrained = membeanStudent.tabs_data?.Reports?.minutes_trained || 0;
        const DAILY_MINUTES_GOAL = 15;
        const progressPercentage = Math.min(Math.round((minutesTrained / DAILY_MINUTES_GOAL) * 100), 100);
        
        studentData.subjects['Membean'] = {
          progress: progressPercentage,
          isCoaching: true,
          sessionTime: '2h',
          details: `Level: ${membeanStudent.current_data?.level || 'Not Started'}\nWords Seen: ${membeanStudent.current_data?.words_seen || 0}\nMinutes Today: ${minutesTrained}/${DAILY_MINUTES_GOAL}\nLast trained: ${membeanStudent.current_data?.last_trained || 'Never'}`
        };

        // Store or update the student in the map
        studentsMap.set(mapKey, studentData);
        
        console.log(`Final processed Membean student data for day ${index + 1}:`, studentData);
      });
    } else {
      console.warn(`No Membean daily data available or invalid format for day ${index + 1}:`, dailyData);
    }
  });

  // After processing all daily data, build weekly_minutes for each student
  const dailyDates = membeanDailyDataArray.map(d => d && d.timestamp ? d.timestamp.split('T')[0] : null);
  studentsMap.forEach((studentData, mapKey) => {
    const weekly_minutes = dailyDates.map((date, idx) => {
      const dailyData = membeanDailyDataArray[idx];
      let minutes = null;
      if (dailyData && dailyData.students) {
        // Try to find the student by name (normalize)
        const entry = Object.values(dailyData.students).find(s => normalizeStudentName(s.name).toLowerCase() === mapKey);
        if (entry && entry.tabs_data && entry.tabs_data.Reports) {
          minutes = entry.tabs_data.Reports.minutes_trained;
        }
      }
      return { date, minutes };
    });
    studentData.weekly_minutes = weekly_minutes;
  });

  // Convert map to array and sort by name
  const allStudents = Array.from(studentsMap.values())
    .filter(student => {
      // Include any student who has at least one subject (i.e., is present in any data source)
      return student.subjects && Object.keys(student.subjects).length > 0;
    })
    .sort((a, b) => 
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );

  console.log('Transformed all students:', allStudents);
  return allStudents;
}; 