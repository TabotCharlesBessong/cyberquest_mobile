import { useState, useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { useLectureBySlug, useSubmitLessonProgress } from './useApiQueries';
import type { LessonStep } from '@/data/types';

type ApiLecture = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  badge: string;
  badgeName: string;
  lessons: ApiLesson[];
};

type ApiLesson = {
  id: string;
  stepId: string;
  type: 'story' | 'quiz' | 'mini-game' | 'challenge';
  title: string;
  text: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  icon: string;
  mascot: string;
  speech: string;
  order: number;
};

function mapApiLessonToStep(lesson: ApiLesson): LessonStep {
  if (lesson.type === 'quiz') {
    return {
      id: lesson.stepId,
      type: 'quiz',
      question: lesson.question,
      options: lesson.options,
      answer: lesson.answer,
      explanation: lesson.explanation,
      icon: lesson.icon,
    };
  }
  return {
    id: lesson.stepId,
    type: 'story',
    title: lesson.title,
    text: lesson.text,
    icon: lesson.icon,
    mascot: lesson.mascot,
    speech: lesson.speech,
  };
}

export interface LessonPlayerState {
  lecture: ApiLecture | undefined;
  loading: boolean;
  error: string;
  stepIndex: number;
  selected: number | null;
  answered: boolean;
  correctCount: number;
  finished: boolean;
  celebrate: boolean;
  submitting: boolean;
  result: { xpEarned: number; newLevel: number } | null;
  steps: LessonStep[];
  total: number;
  step: LessonStep;
  isLast: boolean;
  progress: number;
}

export interface LessonPlayerActions {
  chooseOption: (index: number) => void;
  next: () => void;
  resetStepState: () => void;
}

export interface LessonPlayerReturn extends LessonPlayerState, LessonPlayerActions {
  enter: Animated.Value;
  shake: Animated.Value;
}

export function useLessonPlayer(lectureSlug: string | undefined): LessonPlayerReturn {
  const user = useAuthStore((s) => s.user);
  const lectureQuery = useLectureBySlug(lectureSlug ?? '', user?.ageGroup ?? 'A');
  const submitProgress = useSubmitLessonProgress();

  const [stepIndex, setStepIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ xpEarned: number; newLevel: number } | null>(null);

  const enter = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;

  const lecture = lectureQuery.data?.data.lecture as ApiLecture | undefined;
  const loading = lectureQuery.isLoading;
  const error = lectureQuery.error?.message || '';

  useEffect(() => {
    if (!lectureSlug) return;
    resetStepState();
  }, [lectureSlug]);

  useEffect(() => {
    if (finished) return;
    enter.setValue(0);
    Animated.timing(enter, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [stepIndex, enter, finished]);

  function resetStepState() {
    setStepIndex(0);
    setSelected(null);
    setAnswered(false);
    setCorrectCount(0);
    setFinished(false);
    setCelebrate(false);
    setResult(null);
  }

  function chooseOption(index: number) {
    if (answered) return;
    setSelected(index);
    setAnswered(true);
    const steps = lecture?.lessons.map(mapApiLessonToStep) ?? [];
    const step: LessonStep = steps[stepIndex];
    const correct = step.type === 'quiz' && index === step.answer;
    if (correct) setCorrectCount((c) => c + 1);
    if (!correct && step.type === 'quiz') {
      Animated.sequence([
        Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -1, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  }

  function next() {
    const steps = lecture?.lessons.map(mapApiLessonToStep) ?? [];
    const total = steps.length;
    if (stepIndex === total - 1) {
      finishLesson();
      return;
    }
    setStepIndex((i) => i + 1);
    setSelected(null);
    setAnswered(false);
  }

  async function finishLesson() {
    if (!lecture || !user) return;
    setSubmitting(true);
    try {
      const steps = lecture.lessons.map(mapApiLessonToStep);
      const total = steps.length;
      const quizTotal = steps.filter((s) => s.type === 'quiz').length;
      const score = quizTotal > 0 ? Math.round((correctCount / quizTotal) * 100) : 100;
      const currentLessonId = lecture.lessons[stepIndex]?.id ?? steps[stepIndex].id;
      const res = await submitProgress.mutateAsync({ 
        lessonId: currentLessonId, 
        score,
        correctCount,
        total: quizTotal,
      });
      const data = res.data as { xpEarned: number; newLevel: number };
      setResult({ xpEarned: data.xpEarned, newLevel: data.newLevel });
    } catch {
      setResult({ xpEarned: 0, newLevel: user.level });
    } finally {
      setSubmitting(false);
      setFinished(true);
      setCelebrate(true);
    }
  }

  const steps = lecture?.lessons.map(mapApiLessonToStep) ?? [];
  const total = steps.length;
  const step: LessonStep = steps[stepIndex];
  const isLast = stepIndex === total - 1;
  const progress = (stepIndex + (answered ? 1 : 0)) / total;

  return {
    lecture,
    loading,
    error,
    stepIndex,
    selected,
    answered,
    correctCount,
    finished,
    celebrate,
    submitting,
    result,
    steps,
    total,
    step,
    isLast,
    progress,
    enter,
    shake,
    chooseOption,
    next,
    resetStepState,
  };
}
