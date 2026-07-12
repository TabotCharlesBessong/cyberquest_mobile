import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Celebration } from "@/components/Celebration";
import { Mascot } from "@/components/Mascot";
import { getModule } from "@/data/modules";
import type { LessonStep } from "@/data/types";
import { auth } from "@/lib/storage";
import { Brand, Spacing } from "@/constants/theme";

export default function LessonScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const moduleId = Array.isArray(params.module)
    ? params.module[0]
    : params.module;

  const module = moduleId ? getModule(moduleId) : undefined;
  const [stepIndex, setStepIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const enter = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setStepIndex(0);
    setSelected(null);
    setAnswered(false);
    setCorrectCount(0);
    setFinished(false);
    setCelebrate(false);
  }, [moduleId]);

  useEffect(() => {
    enter.setValue(0);
    Animated.timing(enter, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [stepIndex, enter]);

  if (!module) {
    return (
      <View
        style={[
          styles.flex,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={{ color: "#7c869c" }}>Lesson not found.</Text>
        <Pressable onPress={() => router.back()}>
          <Text
            style={{ color: Brand.primary, fontWeight: "700", marginTop: 12 }}
          >
            Go back
          </Text>
        </Pressable>
      </View>
    );
  }

  const total = module.steps.length;
  const step: LessonStep = module.steps[stepIndex];
  const isLast = stepIndex === total - 1;

  function chooseOption(index: number) {
    if (answered) return;
    setSelected(index);
    setAnswered(true);
    const correct = step.type === "quiz" && index === step.answer;
    if (correct) setCorrectCount((c) => c + 1);
    if (!correct && step.type === "quiz") {
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
    if (isLast) {
      finishLesson();
      return;
    }
    setStepIndex((i) => i + 1);
    setSelected(null);
    setAnswered(false);
  }

  function finishLesson() {
    const user = auth.getCurrentUser();
    if (user) {
      auth.recordModuleComplete(
        user,
        module!.id,
        module!.badge,
        module!.badgeName,
        module!.steps.map((s) => s.id),
      );
    }
    setFinished(true);
    setCelebrate(true);
  }

  const progress = (stepIndex + (answered ? 1 : 0)) / total;
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

  return (
    <View style={[styles.flex, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
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
        <Text style={styles.stepCount}>
          {stepIndex + 1}/{total}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[
            styles.step,
            { opacity, transform: [{ translateY }, { translateX }] },
          ]}
        >
          {step.type === "story" ? (
            <StoryView step={step} />
          ) : (
            <QuizView
              step={step}
              selected={selected}
              answered={answered}
              onChoose={chooseOption}
            />
          )}
        </Animated.View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + Spacing.three },
        ]}
      >
        {answered ? (
          <Pressable style={styles.continueBtn} onPress={next}>
            <Text style={styles.continueText}>
              {isLast ? "Finish 🎉" : "Continue"}
            </Text>
          </Pressable>
        ) : step.type === "story" ? (
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
        emoji={module.badge}
        title={finished ? "World Complete!" : ""}
        subtitle={`You earned the ${module.badgeName} badge!`}
        badgeName={module.badgeName}
        onContinue={() => router.back()}
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
  onChoose,
}: {
  step: Extract<LessonStep, { type: "quiz" }>;
  selected: number | null;
  answered: boolean;
  onChoose: (i: number) => void;
}) {
  return (
    <View style={styles.quiz}>
      <Text style={styles.quizQuestion}>{step.question}</Text>
      <View style={styles.options}>
        {step.options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = i === step.answer;
          let state = "idle";
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
              <Text
                style={[
                  styles.optionText,
                  (state === "correct" || state === "wrong") &&
                    styles.optionTextLight,
                ]}
              >
                {opt}
              </Text>
              {answered && isCorrect ? (
                <Text style={styles.mark}>✓</Text>
              ) : null}
              {answered && isSelected && !isCorrect ? (
                <Text style={styles.mark}>✕</Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {answered ? (
        <View
          style={[
            styles.feedback,
            step.type === "quiz" && selected === step.answer
              ? styles.feedbackGood
              : styles.feedbackBad,
          ]}
        >
          <Text style={styles.feedbackText}>{step.explanation}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Brand.surface },
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
  scroll: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
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
  options: { gap: Spacing.two },
  option: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: Spacing.three,
    borderWidth: 2,
    borderColor: "#e2e8f4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionSelected: { borderColor: Brand.primary, backgroundColor: "#eef4ff" },
  optionCorrect: { backgroundColor: Brand.success, borderColor: Brand.success },
  optionWrong: { backgroundColor: Brand.danger, borderColor: Brand.danger },
  optionDim: { opacity: 0.5 },
  optionPressed: { transform: [{ scale: 0.98 }] },
  optionText: { fontSize: 17, fontWeight: "700", color: "#2b3552", flex: 1 },
  optionTextLight: { color: "#fff" },
  mark: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "900",
    marginLeft: Spacing.two,
  },
  feedback: {
    borderRadius: 16,
    padding: Spacing.three,
    marginTop: Spacing.two,
  },
  feedbackGood: { backgroundColor: "#e3f8ef" },
  feedbackBad: { backgroundColor: "#ffeaea" },
  feedbackText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2b3552",
    textAlign: "center",
  },
});
