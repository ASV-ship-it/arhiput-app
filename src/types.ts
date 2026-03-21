export type Area = 'work' | 'money' | 'family' | 'spirit' | 'health';

export interface User {
  id: string;
  name: string;
  birthDate: string;
  profession: string;
  familyStatus: string;
  hasChildren: boolean;
  interests: string[];
  currentProjects: string[];
  yearlyGoals: Partial<Record<Area, string>>;
  useArchetypeTheme?: boolean;
  isDemo?: boolean;
  externalChatHistory?: string;
}

export interface ArchetypeProfile {
  userId: string;
  year: number;
  personalYearNumber: number;
  personalYearArchetypeName: string;
  personalYearDescription: string;
  themesByArea: Record<Area, string>;
}

export interface YearTheme {
  id: string;
  userId: string;
  year: number;
  title: string;
  description: string;
  areaThemes: Record<Area, string>;
}

export interface QuarterObjective {
  id: string;
  userId: string;
  year: number;
  quarter: 1 | 2 | 3 | 4;
  title: string;
  description: string;
  relatedArea: Area;
  parentYearThemeId: string;
}

export interface MonthGoal {
  id: string;
  userId: string;
  year: number;
  month: number; // 1-12
  title: string;
  description: string;
  relatedArea: Area;
  parentQuarterObjectiveId: string;
  parentYearThemeId: string;
}

export interface WeekFocus {
  id: string;
  userId: string;
  year: number;
  month: number; // 1-12
  weekNumber: number; // 1-53
  title: string;
  description: string;
  relatedArea: Area;
  parentMonthGoalId: string;
  parentQuarterObjectiveId: string;
  parentYearThemeId: string;
}

export type TaskStatus = 'planned' | 'in_progress' | 'done' | 'canceled';

export interface DailyStep {
  id: string;
  userId: string;
  date: string; // ISO string
  title: string;
  description: string;
  relatedArea: Area;
  status: TaskStatus;
  parentWeekFocusId: string;
  parentMonthGoalId: string;
  parentQuarterObjectiveId: string;
  parentYearThemeId: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
