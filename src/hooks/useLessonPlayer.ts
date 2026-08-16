import { useState, useRef, useEffect, useMemo } from "react";
import { Animated, Easing } from "react-native";
import { useAuthStore } from "@/stores/authStore";
import {
  useLectureBySlug,
  useCurriculumLesson,
  useSubmitLessonProgress,
  useConsumeHeart, 
  useRefillHearts
} from "./useApiQueries";
import { playSuccess, playFail } from "@/utils/sounds";
import { calculateAccuracy, calculateLessonDuration } from "@/lib/lessonStats";
import type { LessonStep } from "@/data/types";

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
  type: "story" | "quiz" | "mini-game" | "challenge";
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

type CurriculumLesson = {
  id: string;
  stepId: string;
  type: "story" | "quiz" | "mini-game" | "challenge";
  title: string;
  notes: string;
  order: number;
  ageGroup: string;
  difficulty: number;
  questions: {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    difficulty: number;
    xpReward: number;
  }[];
};

function mapApiLessonToStep(lesson: ApiLesson): LessonStep {
  if (lesson.type === "quiz") {
    return {
      id: lesson.stepId,
      type: "quiz",
      question: lesson.question,
      options: lesson.options,
      answer: lesson.answer,
      explanation: lesson.explanation,
      icon: lesson.icon,
    };
  }
  return {
    id: lesson.stepId,
    type: "story",
    title: lesson.title,
    text: lesson.text,
    icon: lesson.icon,
    mascot: lesson.mascot,
    speech: lesson.speech,
  };
}

function mapCurriculumLessonToSteps(lesson: CurriculumLesson): LessonStep[] {
  const steps: LessonStep[] = [];
  if (lesson.notes) {
    steps.push({
      id: `${lesson.stepId}-notes`,
      type: "story",
      title: lesson.title,
      text: lesson.notes,
      icon: "📝",
      mascot: "🦸",
      speech: "Read this carefully before answering the questions!",
    });
  }
  for (const q of lesson.questions) {
    steps.push({
      id: q.id,
      type: "quiz",
      question: q.question,
      options: q.options,
      answer: q.correctIndex,
      explanation: q.explanation,
      icon: "❓",
    });
  }
  return steps;
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
  step: LessonStep | undefined;
  isLast: boolean;
  progress: number;
  elapsedTime: number;
  accuracy: number;
  shuffledOptions: string[];
  correctOptionIndex: number;
  quizAttempts: number;
  inRetryPhase: boolean;
  hearts: number;
  heartsDepleted: boolean;
}

export interface LessonPlayerActions {
  chooseOption: (index: number) => void;
  next: () => void;
  resetStepState: () => void;
  refillHearts: (method: "gems" | "ad" | "rewards") => void;
  dismissHeartsDepleted: () => void;
}

export interface LessonPlayerReturn
  extends LessonPlayerState, LessonPlayerActions {
  enter: Animated.Value;
  shake: Animated.Value;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function useLessonPlayer(
  lectureSlug: string | undefined,
  lessonId?: string,
): LessonPlayerReturn {
  const user = useAuthStore((s) => s.user);
  const lectureQuery = useLectureBySlug(
    lectureSlug ?? "",
    user?.ageGroup ?? "A",
  );
  const lessonQuery = useCurriculumLesson(lessonId ?? "");
  const submitProgress = useSubmitLessonProgress();
  const consumeHeartMutation = useConsumeHeart();
  const refillHeartsMutation = useRefillHearts();

  const [stepIndex, setStepIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    xpEarned: number;
    newLevel: number;
  } | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [quizAttempts, setQuizAttempts] = useState(0);
  const [retryQueue, setRetryQueue] = useState<LessonStep[]>([]);
  const [retryIndex, setRetryIndex] = useState(0);
  const [inRetryPhase, setInRetryPhase] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);
  const [hearts, setHearts] = useState(user?.hearts ?? 5);
  const [heartsDepleted, setHeartsDepleted] = useState(false);

  const enter = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const startTimeRef = useRef<number | null>(null);

  const lecture = lectureQuery.data?.data.lecture as ApiLecture | undefined;
  const curriculumLesson = lessonQuery.data?.data.lesson as
    | CurriculumLesson
    | undefined;
  const loading = lectureQuery.isLoading || lessonQuery.isLoading;
  const error = lectureQuery.error?.message || lessonQuery.error?.message || "";

  const isCurriculumMode = !!lessonId && !!curriculumLesson;
  const baseSteps: LessonStep[] = useMemo(
    () =>
      isCurriculumMode
        ? mapCurriculumLessonToSteps(curriculumLesson)
        : (lecture?.lessons.map(mapApiLessonToStep) ?? []),
    [isCurriculumMode, curriculumLesson, lecture?.lessons]
  );
  const steps = useMemo(() => {
    if (inRetryPhase) {
      return [...baseSteps, ...retryQueue];
    }
    return baseSteps;
  }, [baseSteps, inRetryPhase, retryQueue]);
  const total = steps.length;
  const effectiveIndex = inRetryPhase
    ? baseSteps.length + retryIndex
    : stepIndex;
  const step: LessonStep | undefined = steps[effectiveIndex];
  const isLast = effectiveIndex === total - 1;
  const progress =
    total > 0 ? (effectiveIndex + (answered ? 1 : 0)) / total : 0;

  const { shuffledOptions, correctOptionIndex } = useMemo(() => {
    if (!step || step.type !== "quiz") {
      return { shuffledOptions: [], correctOptionIndex: 0 };
    }
    const quizStep = step as Extract<LessonStep, { type: "quiz" }>;
    const shuffled = shuffleArray(quizStep.options);
    const correctIdx = shuffled.indexOf(quizStep.options[quizStep.answer]);
    return { shuffledOptions: shuffled, correctOptionIndex: correctIdx };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step?.id, retryIndex]);

  useEffect(() => {
    if (!lectureSlug && !lessonId) return;
    resetStepState();
  }, [lectureSlug, lessonId]);

  useEffect(() => {
    if (finished) return;
    enter.setValue(0);
    Animated.timing(enter, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [effectiveIndex, enter, finished]);

  function resetStepState() {
    setStepIndex(0);
    setRetryIndex(0);
    setRetryQueue([]);
    setInRetryPhase(false);
    setSelected(null);
    setAnswered(false);
    setCorrectCount(0);
    setFinished(false);
    setCelebrate(false);
    setResult(null);
    setElapsedTime(0);
    setAccuracy(100);
    setQuizAttempts(0);
    setLastAnswerCorrect(false);
    setHeartsDepleted(false);
    setHearts(user?.hearts ?? 5);
    startTimeRef.current = Date.now();
  }

  function chooseOption(index: number) {
    if (answered) return;
    setSelected(index);
    setAnswered(true);
    setQuizAttempts((a) => a + 1);

    const currentStep = step;
    const correct =
      currentStep?.type === "quiz" && index === correctOptionIndex;
    setLastAnswerCorrect(correct);
    if (correct) {
      setCorrectCount((c) => c + 1);
      playSuccess();
    } else if (currentStep?.type === "quiz") {
      playFail();
      setRetryQueue((prev) => [...prev, currentStep]);
      consumeHeartMutation.mutate();
      setHearts((h) => {
        const next = Math.max(0, h - 1);
        if (next === 0) {
          setHeartsDepleted(true);
        }
        return next;
      });
      Animated.sequence([
        Animated.timing(shake, {
          toValue: 1,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: -1,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: 1,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: 0,
          duration: 60,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }

  function next() {
    if (inRetryPhase) {
      if (!lastAnswerCorrect) {
        return;
      }
      if (retryIndex >= retryQueue.length - 1) {
        finishLesson();
        return;
      }
      setRetryIndex((i) => i + 1);
      setSelected(null);
      setAnswered(false);
      setLastAnswerCorrect(false);
      return;
    }

    if (stepIndex >= baseSteps.length - 1) {
      if (retryQueue.length > 0) {
        setInRetryPhase(true);
        setRetryIndex(0);
        setSelected(null);
        setAnswered(false);
        return;
      }
      finishLesson();
      return;
    }

    setStepIndex((i) => i + 1);
    setSelected(null);
    setAnswered(false);
  }

  async function finishLesson() {
    if (!user) return;
    setSubmitting(true);
    try {
      const score =
        quizAttempts > 0
          ? Math.round((correctCount / quizAttempts) * 100)
          : 100;
      const acc = calculateAccuracy(correctCount, quizAttempts);
      const elapsed = startTimeRef.current
        ? calculateLessonDuration(startTimeRef.current)
        : 0;
      setElapsedTime(elapsed);
      setAccuracy(acc);
      const currentLessonId = isCurriculumMode
        ? (curriculumLesson?.id ?? lessonId)
        : (lecture?.lessons[stepIndex]?.id ?? steps[effectiveIndex]?.id);
      const res = await submitProgress.mutateAsync({
        lessonId: currentLessonId ?? "",
        score,
        correctCount,
        total: quizAttempts,
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

  function refillHearts(method: "gems" | "ad" | "rewards") {
    refillHeartsMutation.mutate(method, {
      onSuccess: (data) => {
        const result = data.data as { hearts: number };
        setHearts(result.hearts);
        setHeartsDepleted(false);
      },
    });
  }

  function dismissHeartsDepleted() {
    setHeartsDepleted(false);
  }

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
    step: step as LessonStep,
    isLast,
    progress,
    enter,
    shake,
    chooseOption,
    next,
    resetStepState,
    elapsedTime,
    accuracy,
    shuffledOptions,
    correctOptionIndex,
    quizAttempts,
    inRetryPhase,
    hearts,
    heartsDepleted,
    refillHearts,
    dismissHeartsDepleted,
  };
}
