import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState } from "react";

import { Celebration } from "@/components/Celebration";
import { Mascot } from "@/components/Mascot";
import { HeartRefillModal } from "@/components/HeartRefillModal";
import { Brand, Primary, Spacing, Surface } from "@/constants/theme";
import type { LessonStep } from "@/data/types";
import { useLessonPlayer } from "@/hooks/useLessonPlayer";
import { useSafeBack } from "@/lib/navigation";
import { loadSounds, playCelebration } from "@/utils/sounds";
import { Animated, Pressable, ScrollView, Text, View , StyleSheet} from "react-native";

export default function LessonScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const lectureSlug =
    typeof params.lecture === "string" ? params.lecture : undefined;
  const lessonId =
    typeof params.lessonId === "string" ? params.lessonId : undefined;
  const safeBack = useSafeBack("/(tabs)");

  const {
    lecture,
    loading,
    error,
    stepIndex,
    selected,
    selectedPairs,
    selectedSentence,
    selectedOrder,
    answered,
    finished,
    celebrate,
    submitting,
    result,
    total,
    step,
    isLast,
    progress,
    enter,
    shake,
    chooseOption,
    selectPair,
    toggleSentenceWord,
    selectInvestigationStep,
    next,
    resetStepState,
    shuffledOptions,
    correctOptionIndex,
    inRetryPhase,
    elapsedTime,
    accuracy,
    hearts,
    heartsDepleted,
    refillHearts,
    dismissHeartsDepleted,
  } = useLessonPlayer(lectureSlug, lessonId);

  const [liveSeconds, setLiveSeconds] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (finished) return;
    const id = setInterval(() => {
      setLiveSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [finished]);

  async function speakText(text: string) {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      const Speech = (await import("expo-speech")).default;
      Speech.speak(text, {
        language: "en",
        pitch: 1.0,
        rate: 0.9,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch {
      setIsSpeaking(false);
    }
  }

  function stopSpeaking() {
    import("expo-speech").then(({ default: Speech }) => Speech.stop?.());
    setIsSpeaking(false);
  }

  const translateX = shake.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-10, 0, 10],
  });
  const opacity = enter.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const translateY = enter.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 0],
  });

  useEffect(() => {
    loadSounds();
  }, []);

  useEffect(() => {
    if (celebrate) {
      playCelebration();
    }
  }, [celebrate]);

  if (loading) {
    return (
      <View style={[styles.flex, styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.loadingText}>Loading lesson...</Text>
      </View>
    );
  }

  if (error || !lecture) {
    return (
      <View
        style={[
          styles.flex,
          {
            justifyContent: "center",
            alignItems: "center",
            paddingTop: insets.top,
          },
        ]}
      >
        <Text style={{ color: "#7c869c" }}>{error || "Lesson not found."}</Text>
        <Pressable
          style={[
            styles.flex,
            {
              justifyContent: "center",
              alignItems: "center",
              paddingTop: insets.top,
            },
          ]}
        >
          <Text style={{ color: "#7c869c" }}>
            {error || "Lesson not found."}
          </Text>
          <Pressable onPress={safeBack}>
            <Text
              style={{ color: Brand.primary, fontWeight: "700", marginTop: 12 }}
            >
              Go back
            </Text>
          </Pressable>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.flex, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable onPress={safeBack} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              { width: `${Math.min(100, progress * 100)}%` },
            ]}
          />
        </View>
        <View style={styles.heartsRow}>
          <Text style={styles.heartsText}>❤️ {hearts}</Text>
        </View>
        <View style={styles.stepCountWrap}>
          {inRetryPhase && <Text style={styles.retryLabel}>Retry</Text>}
          <Text style={styles.stepCount}>
            {stepIndex + 1}/{total}
          </Text>
        </View>
        <Text style={styles.timerText}>
          {Math.floor(liveSeconds / 60)}:{(liveSeconds % 60).toString().padStart(2, "0")}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {total === 0 || !step ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              This lesson has no content yet.
            </Text>
          </View>
        ) : (
          <Animated.View
            style={[
              styles.step,
              { opacity, transform: [{ translateY }, { translateX }] },
            ]}
          >
            {step.type === "story" ? (
              <StoryView step={step} />
            ) : step.type === "matching" ? (
              <MatchingView
                step={step}
                selectedPairs={selectedPairs}
                onSelectPair={selectPair}
                answered={answered}
              />
            ) : step.type === "sentence_builder" ? (
              <SentenceBuilderView
                step={step}
                selectedSentence={selectedSentence}
                onToggleWord={toggleSentenceWord}
                answered={answered}
              />
            ) : step.type === "investigation" ? (
              <InvestigationView
                step={step}
                selectedOrder={selectedOrder}
                onSelectStep={selectInvestigationStep}
                answered={answered}
              />
            ) : (
              <QuizView
                step={step}
                selected={selected}
                answered={answered}
                correctOptionIndex={correctOptionIndex}
                shuffledOptions={shuffledOptions}
                onChoose={chooseOption}
              />
            )}
          </Animated.View>
        )}
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + Spacing.three },
        ]}
      >
        {total === 0 || !step ? (
          <Text style={styles.hintText}>
            No content available for this lesson.
          </Text>
        ) : submitting ? (
          <Text style={styles.hintText}>Saving progress...</Text>
        ) : answered ? (
          <Pressable style={styles.continueBtn} onPress={next}>
            <Text style={styles.continueText}>
              {isLast ? "Finish 🎉" : "Continue"}
            </Text>
          </Pressable>
        ) : step.type === "story" || step.type === "matching" || step.type === "sentence_builder" || step.type === "investigation" ? (
          <Pressable style={styles.continueBtn} onPress={next}>
            <Text style={styles.continueText}>Continue</Text>
          </Pressable>
        ) : (
          <Text style={styles.hintText}>
            Tap the answer you think is right!
          </Text>
        )}
      </View>

      <Celebration
        visible={celebrate}
        emoji={lecture?.badge ?? "⭐"}
        title={finished ? "Lesson Complete!" : ""}
        subtitle={`You earned ${lecture?.badgeName ?? "XP"}!`}
        xp={result?.xpEarned ?? 30}
        badgeName={lecture?.badgeName ?? "Star"}
        elapsedTime={elapsedTime}
        accuracy={accuracy}
        onContinue={() => {
          resetStepState();
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace("/(tabs)");
          }
        }}
      />

      <HeartRefillModal
        visible={heartsDepleted}
        hearts={hearts}
        onRefill={refillHearts}
        onDismiss={dismissHeartsDepleted}
      />
    </View>
  );
}

function StoryView({ step }: { step: Extract<LessonStep, { type: "story" }> }) {
  return (
    <View style={styles.story}>
      <View style={styles.storyIcon}>
        <Text style={styles.storyIconEmoji}>{step.icon ?? "🌟"}</Text>
      </View>
      <Text style={styles.storyTitle}>{step.title}</Text>
      <Text style={styles.storyText}>{step.text}</Text>

      <View style={styles.speech}>
        <Mascot emoji={step.mascot ?? "🦸"} size={56} bounce={false} />
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>{step.speech}</Text>
        </View>
      </View>
    </View>
  );
}

function QuizView({
  step,
  selected,
  answered,
  correctOptionIndex,
  shuffledOptions,
  onChoose,
}: {
  step: Extract<LessonStep, { type: "quiz" }>;
  selected: number | null;
  answered: boolean;
  correctOptionIndex: number;
  shuffledOptions: string[];
  onChoose: (i: number) => void;
}) {
  const letters = ["A", "B", "C", "D", "E", "F"];

  return (
    <View style={styles.quiz}>
      <Text style={styles.quizQuestion}>{step.question}</Text>
      <View style={styles.options}>
        {shuffledOptions.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = i === correctOptionIndex;
          let state: "idle" | "selected" | "correct" | "wrong" | "dim" = "idle";
          if (answered) {
            if (isCorrect) state = "correct";
            else if (isSelected) state = "wrong";
            else state = "dim";
          } else if (isSelected) state = "selected";

          return (
            <Pressable
              key={i}
              onPress={() => onChoose(i)}
              disabled={answered}
              style={({ pressed }) => [
                styles.option,
                state === "selected" && styles.optionSelected,
                state === "correct" && styles.optionCorrect,
                state === "wrong" && styles.optionWrong,
                state === "dim" && styles.optionDim,
                pressed && !answered && styles.optionPressed,
              ]}
            >
              <View style={styles.optionLeft}>
                <View
                  style={[
                    styles.letterCircle,
                    state === "correct" && styles.letterCircleCorrect,
                    state === "wrong" && styles.letterCircleWrong,
                    state === "selected" && styles.letterCircleSelected,
                    state === "dim" && styles.letterCircleDim,
                  ]}
                >
                  <Text
                    style={[
                      styles.letterText,
                      (state === "correct" || state === "wrong") &&
                        styles.letterTextLight,
                      state === "dim" && styles.letterTextDim,
                    ]}
                  >
                    {letters[i]}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.optionText,
                    (state === "correct" || state === "wrong") &&
                      styles.optionTextLight,
                    state === "dim" && styles.optionTextDim,
                    state === "correct" && styles.optionTextCorrect,
                  ]}
                >
                  {opt}
                </Text>
              </View>
              <View style={styles.optionRight}>
                {answered && isCorrect ? (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>Selected</Text>
                  </View>
                ) : null}
                {answered && isCorrect ? (
                  <View style={styles.checkCircle}>
                    <Text style={styles.checkText}>✓</Text>
                  </View>
                ) : null}
                {answered && isSelected && !isCorrect ? (
                  <View style={styles.closeCircle}>
                    <Text style={styles.closeCircleText}>✕</Text>
                  </View>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      {answered && (
        <View
          style={[
            styles.feedback,
            selected === correctOptionIndex
              ? styles.feedbackGood
              : styles.feedbackBad,
          ]}
        >
          <Text style={styles.feedbackText}>{step.explanation}</Text>
        </View>
      )}
    </View>
  );
}

function MatchingView({
  step,
  selectedPairs,
  onSelectPair,
  answered,
}: {
  step: Extract<LessonStep, { type: "matching" }>;
  selectedPairs: Record<number, number>;
  onSelectPair: (left: number, right: number) => void;
  answered: boolean;
}) {
  const leftItems = step.pairs?.map((p) => p.left) ?? [];
  const rightItems = step.pairs?.map((p) => p.right) ?? [];

  return (
    <View style={styles.matchingContainer}>
      <Text style={styles.matchingQuestion}>{step.question}</Text>
      <View style={styles.matchingGrid}>
        <View style={styles.matchingColumn}>
          {leftItems.map((item, i) => (
            <Pressable
              key={i}
              onPress={() => !answered && onSelectPair(i, -1)}
              style={[
                styles.matchChip,
                selectedPairs[i] !== undefined && styles.matchChipSelected,
              ]}
            >
              <Text style={styles.matchChipText}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.matchingColumn}>
          {rightItems.map((item, j) => (
            <Pressable
              key={j}
              onPress={() => {
                const selectedLeft = Object.keys(selectedPairs).find(
                  (k) => selectedPairs[Number(k)] === j
                );
                if (selectedLeft !== undefined) {
                  onSelectPair(Number(selectedLeft), -1);
                }
              }}
              style={[
                styles.matchChip,
                Object.values(selectedPairs).includes(j) &&
                  styles.matchChipMatched,
              ]}
            >
              <Text style={styles.matchChipText}>{item}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

function SentenceBuilderView({
  step,
  selectedSentence,
  onToggleWord,
  answered,
}: {
  step: Extract<LessonStep, { type: "sentence_builder" }>;
  selectedSentence: string[];
  onToggleWord: (word: string) => void;
  answered: boolean;
}) {
  return (
    <View style={styles.sentenceContainer}>
      <Text style={styles.sentenceQuestion}>{step.question}</Text>
      <View style={styles.sentenceBuildArea}>
        {selectedSentence.length === 0 ? (
          <Text style={styles.sentencePlaceholder}>Tap words below to build your sentence...</Text>
        ) : (
          selectedSentence.map((word, i) => (
            <Pressable
              key={i}
              onPress={() => onToggleWord(word)}
              style={styles.sentenceWord}
            >
              <Text style={styles.sentenceWordText}>{word}</Text>
            </Pressable>
          ))
        )}
      </View>
      <View style={styles.sentenceOptions}>
        {step.sentenceParts
          .filter((w) => !selectedSentence.includes(w))
          .map((word, i) => (
            <Pressable
              key={i}
              onPress={() => onToggleWord(word)}
              style={styles.sentenceOption}
            >
              <Text style={styles.sentenceOptionText}>{word}</Text>
            </Pressable>
          ))}
      </View>
    </View>
  );
}

function InvestigationView({
  step,
  selectedOrder,
  onSelectStep,
  answered,
}: {
  step: Extract<LessonStep, { type: "investigation" }>;
  selectedOrder: number[];
  onSelectStep: (index: number) => void;
  answered: boolean;
}) {
  return (
    <View style={styles.investigationContainer}>
      <Text style={styles.investigationQuestion}>{step.question}</Text>
      <Text style={styles.investigationHint}>Tap the steps in the correct order</Text>
      <View style={styles.investigationList}>
        {step.investigationSteps?.map((item, i) => {
          const order = selectedOrder.indexOf(i);
          const isSelected = order >= 0;
          return (
            <Pressable
              key={i}
              onPress={() => onSelectStep(i)}
              style={[
                styles.investigationItem,
                isSelected && styles.investigationItemSelected,
              ]}
            >
              <View style={styles.investigationOrder}>
                <Text style={styles.investigationOrderText}>
                  {isSelected ? order + 1 : "•"}
                </Text>
              </View>
              <Text style={styles.investigationText}>{item}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Brand.surface },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { fontSize: 16, fontWeight: "700", color: "#7c869c" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  closeText: { fontSize: 18, color: "#7c869c", fontWeight: "900" },
  progressTrack: {
    flex: 1,
    height: 12,
    backgroundColor: "#e3e9f6",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Brand.primary,
    borderRadius: 999,
  },
  stepCount: {
    fontSize: 14,
    fontWeight: "800",
    color: "#7c869c",
    minWidth: 36,
    textAlign: "right",
  },
  stepCountWrap: {
    alignItems: "center",
    gap: 2,
    minWidth: 36,
  },
  heartsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  heartsText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#7c869c",
  },
  retryLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: Brand.warning,
    letterSpacing: 0.5,
  },
  timerText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#7c869c",
    minWidth: 40,
    textAlign: "right",
    fontVariant: ["tabular-nums"],
  },
  scroll: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.six,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#7c869c",
    textAlign: "center",
  },
  step: { flex: 1 },
  footer: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eaeef7",
  },
  continueBtn: {
    backgroundColor: Brand.success,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#1f9e6e",
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 0,
    borderBottomWidth: 4,
    borderBottomColor: "#1f9e6e",
  },
  continueText: { color: "#fff", fontSize: 18, fontWeight: "900" },
  hintText: {
    textAlign: "center",
    color: "#9aa3b5",
    fontWeight: "700",
    fontSize: 14,
  },
  story: { alignItems: "center", gap: Spacing.three, marginTop: Spacing.three },
  storyIcon: {
    width: 110,
    height: 110,
    borderRadius: 32,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Brand.shadow,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  storyIconEmoji: { fontSize: 60 },
  storyTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#1c2742",
    textAlign: "center",
  },
  storyText: {
    fontSize: 17,
    color: "#3a4560",
    textAlign: "center",
    lineHeight: 25,
  },
  speech: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  bubble: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: Spacing.three,
    borderWidth: 2,
    borderColor: "#e6ecf8",
  },
  bubbleText: {
    fontSize: 15,
    color: "#2b3552",
    fontWeight: "600",
    lineHeight: 22,
  },
  quiz: { gap: Spacing.four, marginTop: Spacing.three },
  quizQuestion: {
    fontSize: 22,
    fontWeight: "900",
    color: "#1c2742",
    textAlign: "center",
  },
  options: { gap: Spacing.three },
  option: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: Spacing.four,
    borderWidth: 2,
    borderColor: "#e2e8f4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
    shadowColor: Brand.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 2,
  },
  optionSelected: { borderColor: Primary.primary, backgroundColor: "#eef4ff" },
  optionCorrect: {
    backgroundColor: Brand.success,
    borderColor: Brand.success,
    shadowColor: Brand.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    transform: [{ scale: 1.02 }],
  },
  optionWrong: { backgroundColor: Brand.danger, borderColor: Brand.danger },
  optionDim: { opacity: 0.5 },
  optionPressed: { transform: [{ scale: 0.98 }] },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    flex: 1,
  },
  optionRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  letterCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#e2e8f4",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  letterCircleSelected: {
    borderColor: Primary.primary,
    backgroundColor: Primary.primary,
  },
  letterCircleCorrect: {
    borderColor: "#fff",
    backgroundColor: "#fff",
  },
  letterCircleWrong: {
    borderColor: "#fff",
    backgroundColor: "#fff",
  },
  letterCircleDim: {
    borderColor: "#e2e8f4",
    backgroundColor: "#f8f9ff",
  },
  letterText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1c2742",
  },
  letterTextLight: {
    color: Brand.success,
  },
  letterTextDim: {
    color: "#9aa3b5",
  },
  optionText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2b3552",
    flex: 1,
  },
  optionTextLight: {
    color: "#fff",
  },
  optionTextDim: {
    color: "#9aa3b5",
  },
  optionTextCorrect: {
    color: "#fff",
    fontWeight: "800",
  },
  checkCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  checkText: {
    fontSize: 22,
    color: Brand.success,
    fontWeight: "900",
  },
  closeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  closeCircleText: {
    fontSize: 22,
    color: Brand.danger,
    fontWeight: "900",
  },
  selectedBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  selectedBadgeText: {
    fontFamily: "Inter_900Black",
    fontSize: 10,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 0.1,
  },
  feedback: {
    borderRadius: 16,
    padding: Spacing.three,
    marginTop: Spacing.two,
  },
  feedbackGood: {
    backgroundColor: "#e3f8ef",
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.2)",
  },
  feedbackBad: {
    backgroundColor: "#ffeaea",
    borderWidth: 1,
    borderColor: "rgba(186,26,26,0.2)",
  },
  feedbackText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2b3552",
    textAlign: "center",
  },
  matchingContainer: { gap: Spacing.four, marginTop: Spacing.three },
  matchingQuestion: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1c2742",
    textAlign: "center",
  },
  matchingGrid: {
    flexDirection: "row",
    gap: Spacing.four,
  },
  matchingColumn: {
    flex: 1,
    gap: Spacing.two,
  },
  matchChip: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: Spacing.three,
    borderWidth: 2,
    borderColor: "#e2e8f4",
    alignItems: "center",
  },
  matchChipSelected: {
    borderColor: Primary.primary,
    backgroundColor: "#eef4ff",
  },
  matchChipMatched: {
    borderColor: Brand.success,
    backgroundColor: "#e3f8ef",
  },
  matchChipText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1c2742",
    textAlign: "center",
  },
  sentenceContainer: { gap: Spacing.four, marginTop: Spacing.three },
  sentenceQuestion: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1c2742",
    textAlign: "center",
  },
  sentenceBuildArea: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
    minHeight: 60,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: Spacing.three,
    borderWidth: 2,
    borderColor: "#e2e8f4",
  },
  sentencePlaceholder: {
    color: "#9aa3b5",
    fontSize: 14,
    fontWeight: "600",
  },
  sentenceWord: {
    backgroundColor: Primary.primaryContainer,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  sentenceWordText: {
    color: Primary.primary,
    fontWeight: "800",
    fontSize: 15,
  },
  sentenceOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  sentenceOption: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: "#e2e8f4",
  },
  sentenceOptionText: {
    color: "#1c2742",
    fontWeight: "700",
    fontSize: 14,
  },
  investigationContainer: { gap: Spacing.four, marginTop: Spacing.three },
  investigationQuestion: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1c2742",
    textAlign: "center",
  },
  investigationHint: {
    fontSize: 14,
    fontWeight: "700",
    color: "#7c869c",
    textAlign: "center",
  },
  investigationList: { gap: Spacing.two },
  investigationItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: Spacing.three,
    borderWidth: 2,
    borderColor: "#e2e8f4",
  },
  investigationItemSelected: {
    borderColor: Primary.primary,
    backgroundColor: "#eef4ff",
  },
  investigationOrder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Surface.surfaceContainerHigh,
    alignItems: "center",
    justifyContent: "center",
  },
  investigationOrderText: {
    fontWeight: "900",
    fontSize: 14,
    color: Primary.primary,
  },
  investigationText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#1c2742",
  },
});
