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
  missionBriefing?: string;
};

type CurriculumLesson = {
  id: string;
  stepId: string;
  type: "story" | "quiz" | "mini-game" | "challenge";
  title: string;
  notes: string;
  missionBriefing?: string;
  order: number;
  ageGroup: string;
  difficulty: number;
    questions: {
    id: string;
    type: string;
    question: string;
    options?: string[];
    correctIndex?: number;
    pairs?: { left: string; right: string }[];
    sentence?: string;
    missingWords?: string[];
    correctSentence?: string;
    investigationSteps?: string[];
    correctOrder?: number[];
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

  if (lesson.missionBriefing) {
    steps.push({
      id: `${lesson.stepId}-mission`,
      type: "story",
      title: "🎯 Mission Briefing",
      text: lesson.missionBriefing,
      icon: "📋",
      mascot: "🦸",
      speech: "Here's your mission briefing! Listen carefully, hero.",
    });
  }

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
    if (q.type === "matching") {
      steps.push({
        id: q.id,
        type: "matching",
        question: q.question,
        pairs: q.pairs || [],
        explanation: q.explanation,
        icon: "🔗",
      });
    } else if (q.type === "sentence_builder") {
      steps.push({
        id: q.id,
        type: "sentence_builder",
        question: q.question,
        sentence: q.sentence ?? "",
        missingWords: q.missingWords ?? [],
        correctSentence: q.correctSentence || "",
        explanation: q.explanation,
        icon: "🧩",
      });
    } else if (q.type === "investigation") {
      steps.push({
        id: q.id,
        type: "investigation",
        question: q.question,
        investigationSteps: q.investigationSteps || [],
        correctOrder: q.correctOrder || [],
        explanation: q.explanation,
        icon: "🔍",
      });
    } else {
      steps.push({
        id: q.id,
        type: "quiz",
        question: q.question,
        options: q.options || [],
        answer: q.correctIndex ?? 0,
        explanation: q.explanation,
        icon: "❓",
      });
    }
  }
  return steps;
}

export interface LessonPlayerState {
  lecture: ApiLecture | undefined;
  loading: boolean;
  error: string;
  stepIndex: number;
  selected: number | null;
  selectedPairs: Record<number, number>;
  pairResults: Record<number, { correct: boolean; rightIndex: number }>;
  selectedSentenceWords: string[];
  remainingWords: string[];
  selectedOrder: number[];
  answered: boolean;
  correctCount: number;
  finished: boolean;
  celebrate: boolean;
  submitting: boolean;
  result: { xpEarned: number; newLevel: number; gemsEarned?: number } | null;
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
  heartConsumedThisQuestion: boolean;
  lastSelectedLeft: number | null;
  shuffledLeftItems: { left: string; originalIndex: number }[];
  shuffledRightItems: { right: string; originalIndex: number }[];
}

export interface LessonPlayerActions {
  chooseOption: (index: number) => void;
  selectPair: (leftIndex: number, rightIndex: number) => void;
  toggleSentenceWord: (word: string) => void;
  selectInvestigationStep: (stepIndex: number) => void;
  moveInvestigationStep: (stepIndex: number, direction: -1 | 1) => void;
  next: () => void;
  resetStepState: () => void;
  refillHearts: (method: "gems" | "ad") => void;
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

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function seededShuffle<T>(array: T[], seed: string): T[] {
  const rand = (() => {
    let s = hashString(seed);
    return () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  })();
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
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
  const [selectedPairs, setSelectedPairs] = useState<Record<number, number>>({});
  const [pairResults, setPairResults] = useState<Record<number, { correct: boolean; rightIndex: number }>>({});
  const [selectedSentenceWords, setSelectedSentenceWords] = useState<string[]>([]);
  const [remainingWords, setRemainingWords] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<number[]>([]);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    xpEarned: number;
    newLevel: number;
    gemsEarned?: number;
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
  const [heartConsumedThisQuestion, setHeartConsumedThisQuestion] = useState(false);
  const [lastSelectedLeft, setLastSelectedLeft] = useState<number | null>(null);

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

  const { shuffledLeftItems, shuffledRightItems } = useMemo(() => {
    if (!step || step.type !== "matching") {
      return { shuffledLeftItems: [], shuffledRightItems: [] };
    }
    const matchingStep = step as Extract<LessonStep, { type: "matching" }>;
    const pairs = matchingStep.pairs || [];
    const leftItems = pairs.map((p, i) => ({ left: p.left, originalIndex: i }));
    const rightItems = pairs.map((p, i) => ({ right: p.right, originalIndex: i }));
    const seed = step.id;
    const shuffledLeft = seededShuffle(leftItems, seed + "-left");
    const shuffledRight = seededShuffle(rightItems, seed + "-right");
    return { shuffledLeftItems: shuffledLeft, shuffledRightItems: shuffledRight };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step?.id]);

  useEffect(() => {
    if (!lectureSlug && !lessonId) return;
    resetStepState();
  }, [lectureSlug, lessonId]);

  useEffect(() => {
    if (!step) return;
    if (step.type === "sentence_builder") {
      const sbStep = step as Extract<LessonStep, { type: "sentence_builder" }>;
      setRemainingWords([...sbStep.missingWords]);
      setSelectedSentenceWords([]);
    }
  }, [step?.id]);

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
    setSelectedPairs({});
    setPairResults({});
    setSelectedSentenceWords([]);
    setRemainingWords([]);
    setSelectedOrder([]);
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
    setHeartConsumedThisQuestion(false);
    setLastSelectedLeft(null);
    startTimeRef.current = Date.now();
  }

  function chooseOption(index: number) {
    if (answered) return;
    setSelected(index);
    setAnswered(true);
    setQuizAttempts((a) => a + 1);

    const currentStep = step;
    let correct = false;

    if (!currentStep) {
      correct = false;
    } else if (currentStep.type === "quiz") {
      correct = index === correctOptionIndex;
    } else if (currentStep.type === "matching") {
      const matchingStep = currentStep as Extract<LessonStep, { type: "matching" }>;
      const totalPairs = matchingStep.pairs?.length || 0;
      const matchedCorrectly = Object.entries(pairResults).filter(
        ([leftIdx, result]) => result.correct
      ).length;
      const allMatched = Object.keys(pairResults).length === totalPairs;
      correct = matchedCorrectly === totalPairs && allMatched;
    } else if (currentStep.type === "sentence_builder") {
      const sentenceStep = currentStep as Extract<LessonStep, { type: "sentence_builder" }>;
      let wordIdx = 0;
      const filled = sentenceStep.sentence.replace(/__+/g, () => {
        const word = selectedSentenceWords[wordIdx++];
        return word ?? "___";
      });
      correct = filled.trim() === sentenceStep.correctSentence;
    } else if (currentStep.type === "investigation") {
      const invStep = currentStep as Extract<LessonStep, { type: "investigation" }>;
      correct = selectedOrder.length === (invStep.investigationSteps?.length || 0) &&
        JSON.stringify(selectedOrder) === JSON.stringify(invStep.correctOrder);
    }

    setLastAnswerCorrect(correct);
    if (correct) {
      setCorrectCount((c) => c + 1);
      playSuccess();
    } else {
      playFail();
      if (!inRetryPhase && currentStep) {
        setRetryQueue((prev) => [...prev, currentStep]);
      }
      if (!heartConsumedThisQuestion) {
        consumeHeartMutation.mutate();
        setHearts((h) => {
          const next = Math.max(0, h - 1);
          if (next === 0) {
            setHeartsDepleted(true);
          }
          return next;
        });
        setHeartConsumedThisQuestion(true);
      }
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
        setSelected(null);
        setAnswered(false);
        setLastAnswerCorrect(false);
        setHeartConsumedThisQuestion(false);
        setLastSelectedLeft(null);
        setPairResults({});
        setSelectedSentenceWords([]);
        setRemainingWords([]);
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
      setHeartConsumedThisQuestion(false);
      setLastSelectedLeft(null);
      setPairResults({});
      setSelectedSentenceWords([]);
      setRemainingWords([]);
      return;
    }

    if (stepIndex >= baseSteps.length - 1) {
      if (retryQueue.length > 0) {
        setInRetryPhase(true);
        setRetryIndex(0);
        setSelected(null);
        setAnswered(false);
        setHeartConsumedThisQuestion(false);
        setLastSelectedLeft(null);
        setPairResults({});
        setSelectedSentenceWords([]);
        setRemainingWords([]);
        return;
      }
      finishLesson();
      return;
    }

    setStepIndex((i) => i + 1);
    setSelected(null);
    setAnswered(false);
    setHeartConsumedThisQuestion(false);
    setLastSelectedLeft(null);
    setPairResults({});
    setSelectedSentenceWords([]);
    setRemainingWords([]);
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
      const data = res.data as {
        xpEarned: number;
        newLevel: number;
        gemsEarned?: number;
      };
      setResult({
        xpEarned: data.xpEarned,
        newLevel: data.newLevel,
        gemsEarned: data.gemsEarned ?? 0,
      });
    } catch {
      setResult({ xpEarned: 0, newLevel: user.level, gemsEarned: 0 });
    } finally {
      setSubmitting(false);
      setFinished(true);
      setCelebrate(true);
    }
  }

  function refillHearts(method: "gems" | "ad") {
    refillHeartsMutation.mutate(method as "gems" | "ad", {
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

  function selectPair(leftDisplayIndex: number, rightDisplayIndex: number) {
    if (answered) return;

    const currentStep = step;
    if (!currentStep || currentStep.type !== "matching") return;
    const matchingStep = currentStep as Extract<LessonStep, { type: "matching" }>;
    const pairs = matchingStep.pairs || [];
    if (pairs.length === 0) return;

    if (rightDisplayIndex === -1) {
      setLastSelectedLeft((prev) =>
        prev === leftDisplayIndex ? null : leftDisplayIndex
      );
      setSelectedPairs((prev) => {
        const next = { ...prev };
        if (next[leftDisplayIndex] === -1) {
          delete next[leftDisplayIndex];
        } else {
          next[leftDisplayIndex] = -1;
        }
        return next;
      });
      return;
    }

    const leftItem = shuffledLeftItems[leftDisplayIndex];
    const rightItem = shuffledRightItems[rightDisplayIndex];
    if (!leftItem || !rightItem) return;

    const isCorrect = leftItem.originalIndex === rightItem.originalIndex;

    setPairResults((prev) => ({
      ...prev,
      [leftDisplayIndex]: { correct: isCorrect, rightIndex: rightDisplayIndex },
    }));
    setSelectedPairs((prev) => ({
      ...prev,
      [leftDisplayIndex]: rightDisplayIndex,
    }));
    setLastSelectedLeft(null);

    if (isCorrect) {
      playSuccess();
    } else {
      playFail();
      if (!heartConsumedThisQuestion) {
        consumeHeartMutation.mutate();
        setHearts((h) => {
          const next = Math.max(0, h - 1);
          if (next === 0) setHeartsDepleted(true);
          return next;
        });
        setHeartConsumedThisQuestion(true);
      }
      Animated.sequence([
        Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -1, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }

    if (Object.keys({ ...selectedPairs, [leftDisplayIndex]: rightDisplayIndex }).length === pairs.length) {
      setTimeout(() => {
        setAnswered(true);
        setQuizAttempts((a) => a + 1);
      }, 300);
    }
  }

  function toggleSentenceWord(word: string) {
    if (answered) return;
    setSelectedSentenceWords((prev) => {
      const existingIdx = prev.indexOf(word);
      if (existingIdx !== -1) {
        const next = [...prev];
        next[existingIdx] = undefined as any;
        return next;
      }
      const next = [...prev];
      const emptyIdx = next.findIndex((w) => !w);
      if (emptyIdx !== -1) {
        next[emptyIdx] = word;
      }
      return next;
    });
    setRemainingWords((prev) => {
      const idx = prev.indexOf(word);
      if (idx === -1) return [...prev, word];
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
  }

  function selectInvestigationStep(stepIndex: number) {
    if (answered) return;
    setSelectedOrder((prev) => {
      if (prev.includes(stepIndex)) {
        return prev.filter((i) => i !== stepIndex);
      }
      return [...prev, stepIndex];
    });
  }

  function moveInvestigationStep(stepIndex: number, direction: -1 | 1) {
    if (answered) return;
    setSelectedOrder((prev) => {
      const currentIndex = prev.indexOf(stepIndex);
      if (currentIndex === -1) return prev;
      const newIndex = currentIndex + direction;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      const next = [...prev];
      [next[currentIndex], next[newIndex]] = [next[newIndex], next[currentIndex]];
      return next;
    });
  }

  return {
    lecture,
    loading,
    error,
    stepIndex,
    selected,
    selectedPairs,
    pairResults,
    selectedSentenceWords,
    remainingWords,
    selectedOrder,
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
    selectPair,
    toggleSentenceWord,
    selectInvestigationStep,
    moveInvestigationStep,
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
    heartConsumedThisQuestion,
    lastSelectedLeft,
    shuffledLeftItems,
    shuffledRightItems,
    refillHearts,
    dismissHeartsDepleted,
  };
}
