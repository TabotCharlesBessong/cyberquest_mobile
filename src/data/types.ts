export type User = {
  id: string;
  name: string;
  age: number;
  avatar: string;
  password: string;
  onboarded: boolean;
  createdAt: string;
};

export type Progress = {
  xp: number;
  streak: number;
  lastActiveDate: string | null;
  completedModules: string[];
  completedLessons: string[];
  badges: string[];
};

export type StoryStep = {
  id: string;
  type: 'story';
  title: string;
  text: string;
  icon?: string;
  mascot?: string;
  speech?: string;
};

export type QuizStep = {
  id: string;
  type: 'quiz';
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  icon?: string;
};

export type LessonStep = StoryStep | QuizStep;

export type ModuleData = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  badge: string;
  badgeName: string;
  steps: LessonStep[];
};
