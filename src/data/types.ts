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
  missionBriefing?: string;
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

export type MatchingStep = {
  id: string;
  type: 'matching';
  question: string;
  pairs: { left: string; right: string }[];
  explanation: string;
  icon?: string;
};

export type MatchingPairResult = {
  correct: boolean;
  rightIndex: number;
};

export type SentenceBuilderStep = {
  id: string;
  type: 'sentence_builder';
  question: string;
  sentence: string;
  missingWords: string[];
  correctSentence: string;
  explanation: string;
  icon?: string;
};

export type InvestigationStep = {
  id: string;
  type: 'investigation';
  question: string;
  investigationSteps: string[];
  correctOrder: number[];
  explanation: string;
  icon?: string;
};

export type LessonStep = StoryStep | QuizStep | MatchingStep | SentenceBuilderStep | InvestigationStep;

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
