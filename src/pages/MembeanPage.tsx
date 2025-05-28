import React from 'react';
import MembeanStudentPage from '../components/MembeanStudentPage';
import { MembeanRawData, MembeanDisplayData } from '../types/types';

interface MembeanPageProps {
  student: MembeanRawData;
  weeklyData?: MembeanRawData;
}

const MembeanPage: React.FC<MembeanPageProps> = ({ student, weeklyData }) => {
  // Transform the raw Membean data into the format expected by MembeanStudentPage
  const transformedStudent: MembeanDisplayData = {
    level_number: student.current_data.level,
    problems_answered_today: student.tabs_data.Reports.minutes_trained.toString(),
    problems_answered_yesterday: "0", // This data isn't available in Membean
    current_level_progress: student.tabs_data.Reports.goal_progress,
    grade: student.tabs_data.Reports.accuracy,
    sessions: {
      total_completed: student.tabs_data.Reports.fifteen_min_days.toString(),
      total_started: student.tabs_data.Reports.fifteen_min_days.toString(),
      days: {
        completed: [],
        started: []
      }
    },
    words_seen: student.current_data.words_seen,
    last_trained: student.current_data.last_trained,
    dubious_minutes: student.tabs_data.Reports.dubious_minutes,
    skipped_words: student.tabs_data.Reports.skipped_words,
    new_words: student.tabs_data.Reports.new_words,
    assessment_score: student.tabs_data.Reports.assessment_score,
    goal_met: student.tabs_data.Reports.goal_met,
    weekly_data: weeklyData ? {
      goal_met: weeklyData.tabs_data.Reports.goal_met,
      minutes_trained: weeklyData.tabs_data.Reports.minutes_trained,
      accuracy: weeklyData.tabs_data.Reports.accuracy,
      new_words: weeklyData.tabs_data.Reports.new_words,
      days_practiced: weeklyData.tabs_data.Reports.fifteen_min_days
    } : undefined
  };
  
  return <MembeanStudentPage student={transformedStudent} />;
};

export default MembeanPage; 