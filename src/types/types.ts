// Math Academy Types
interface MathAcademyStudentData {
  name: string;
  student_id: string;
  dashboard_info: {
    course_info: {
      name: string;
      percent_complete: string;
    };
    last_activity: string;
    today_progress: {
      points: string;
      progress_width: string;
    };
    weekly_xp: string;
    daily_goal?: {
      points: string;
      progress: string;
    };
  };
  detailed_info: {
    activity_stats: {
      daily_goal: string;
      daily_progress: string;
    };
    estimated_completion: string;
    weekly_activity: {
      total_xp: string;
      daily_activities: Array<{
        day: string;
        height: number;
        top_position: number;
        activity_value: number;
      }>;
    };
    tasks: Array<{
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
  };
}

// Membean Types
interface MembeanStudentData {
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
      new_words: number;
    };
  };
  weekly_data?: {
    goal_met: boolean;
    minutes_trained: number;
    accuracy: string;
    new_words: number;
    days_practiced: number;
  };
}

// Integrated Student Data
export interface Platform {
  name: string;
  level: number;
  newWords: number;
  totalWords: number;
  averageAccuracy: number;
  trainingMinutes: number;
  lastSession: string;
  sessionDuration: number;
}

export interface StudentSession {
  days: {
    completed: string[];
    started: string[];
  };
  total_completed: string;
  total_started: string;
}

export interface StudentData {
  id: string;
  name: string;
  email: string;
  level_number: string;
  current_level_progress: string;
  problems_answered_today: string;
  problems_answered_yesterday: string;
  sessions: StudentSession;
  grade: string;
  progress_bar: ('completed' | 'incomplete')[];
  timestamp: string;
  platforms: Platform[];
  current_data: {
    level: string;
    level_sort: number;
    words_seen: number;
    last_trained: string;
  };
  tabs_data: {
    Assessments: Record<string, any>;
    Writing: Record<string, any>;
    Overview: Record<string, any>;
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
  subjects: Record<string, {
    progress: number;
    isCoaching: boolean;
    sessionTime: string;
    details: string;
  }>;
  weekly_data?: {
    goal_met: boolean;
    minutes_trained: number;
    accuracy: string;
    new_words: number;
    days_practiced: number;
  };
  yesterday_data?: {
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
  mathAcademy?: {
    courseInfo: {
      name: string;
      percentComplete: string;
    };
    lastActivity: string;
    weeklyXP: string;
    expectedWeeklyXP: string;
    estimatedCompletion: string;
    studentUrl: string;
    dailyActivity?: {
      [date: string]: {
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
      };
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
  };
  membean?: {
    level: string;
    wordsSeen: number;
    lastTrained: string;
    goalProgress: string;
    accuracy: string;
    minutesTrained: number;
  };
  weekly_minutes?: Array<{ date: string | null; minutes: number | null }>;
}

// Scraper Data Service Types
export interface ScraperData {
  mathAcademy: MathAcademyStudentData[];
  membean: { [key: string]: MembeanStudentData };
}

export interface MembeanDisplayData {
  level_number: string;
  problems_answered_today: string;
  problems_answered_yesterday: string;
  current_level_progress: string;
  grade: string;
  sessions: {
    total_completed: string;
    total_started: string;
    days: {
      completed: string[];
      started: string[];
    };
  };
  words_seen: number;
  last_trained: string;
  dubious_minutes: number;
  skipped_words: number;
  new_words: number;
  assessment_score: string;
  goal_met: boolean;
  weekly_data?: {
    goal_met: boolean;
    minutes_trained: number;
    accuracy: string;
    new_words: number;
    days_practiced: number;
  };
  weekly_minutes?: Array<{ date: string | null; minutes: number | null }>;
  membeanUrl?: string;
}

export interface MembeanRawData {
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
} 