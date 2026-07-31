import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  useCurriculumUnit,
  useMyProgress,
} from "@/hooks/useApiQueries";
import { useAuthStore } from "@/stores/authStore";
import { Brand, Spacing } from "@/constants/theme";
import {
  Pressable,
  ScrollView,
  Text,
  View,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LESSON_COLORS = [
  "#4D96FF",
  "#FF7A59",
  "#2BC48A",
  "#F59E0B",
  "#9B5DE5",
  "#00C9A7",
  "#FF6B6B",
  "#845EF7",
  "#20C997",
  "#FD7E14",
];

const LESSON_ICONS = [
  "🌟",
  "🔒",
  "🛡️",
  "🎯",
  "🚀",
  "💡",
  "🔍",
  "🎨",
  "🧩",
  "⚡",
];

const STORAGE_KEYS = {
  lastLesson: "@cyberquest:lastLesson",
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CIRCLE_SIZE = 129;

export default function UnitDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const unitId = typeof params.id === "string" ? params.id : undefined;
  const unitTitle = typeof params.title === "string" ? params.title : "";
  const unitIndex = typeof params.index === "string" ? parseInt(params.index, 10) : 0;

  const user = useAuthStore((s) => s.user);
  const unitQuery = useCurriculumUnit(unitId ?? "");
  const progressQuery = useMyProgress();

  const unit = unitQuery.data?.data.unit as
    | {
        id: string;
        slug: string;
        title: string;
        description: string;
        icon: string;
        order: number;
        lessons: Array<{
          id: string;
          stepId: string;
          type: string;
          title: string;
          notes: string;
          order: number;
          ageGroup: string;
          difficulty: number;
          questions: Array<{
            id: string;
            question: string;
            options: string[];
            correctIndex: number;
            explanation: string;
            difficulty: number;
            xpReward: number;
          }>;
        }>;
      }
    | undefined;

  const lessonProgressMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    const progressLessons = (progressQuery.data?.data as { lessons: Array<{ lessonId: string; completed: boolean }> } | undefined)?.lessons ?? [];
    for (const lp of progressLessons) {
      map[lp.lessonId] = lp.completed;
    }
    return map;
  }, [progressQuery.data]);

  const [lastLessonId, setLastLessonId] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.lastLesson)
      .then((raw) => {
        if (raw) setLastLessonId(raw);
      })
      .catch(() => {
        setLastLessonId(null);
      });
  }, []);

  const persistLastLesson = async (lessonId: string) => {
    await AsyncStorage.setItem(STORAGE_KEYS.lastLesson, lessonId);
  };

  const lessons = unit?.lessons ?? [];

  const allLessonsCompleted = lessons.length > 0 && lessons.every((l) => lessonProgressMap[l.id]);

  const sectionSlug = typeof params.sectionSlug === "string" ? params.sectionSlug : "";

  const handleLessonPress = (lessonId: string, lessonTitle: string) => {
    persistLastLesson(lessonId);
    router.push({
      pathname: "/lesson",
      params: {
        lecture: sectionSlug,
        lessonId: lessonId,
        unitId: unitId ?? "",
      },
    });
  };

  if (unitQuery.isLoading) {
    return (
      <View
        style={[
          styles.flex,
          styles.center,
          { paddingTop: insets.top + Spacing.six },
        ]}
      >
        <Text style={styles.loadingText}>Loading unit...</Text>
      </View>
    );
  }

  if (!unit) {
    return (
      <View
        style={[
          styles.flex,
          styles.center,
          { paddingTop: insets.top + Spacing.six },
        ]}
      >
        <Text style={styles.errorText}>Unit not found</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + Spacing.three },
      ]}
    >
      <View style={[styles.header, { backgroundColor: Brand.primary }]}>
        <Text style={styles.headerIcon}>{unit.icon}</Text>
        <Text style={styles.headerTitle}>{unit.title}</Text>
        <Text style={styles.headerSub}>{unit.description}</Text>
      </View>

      {lessons.map((lesson, lessonIndex) => {
        const isCompleted = lessonProgressMap[lesson.id];
        const isLastVisited = lastLessonId === lesson.id;
        const isLocked = lessonIndex > 0 && !lessons.slice(0, lessonIndex).every((prevLesson) => lessonProgressMap[prevLesson.id]);

        return (
          <Pressable
            key={lesson.id}
            onPress={() => {
              if (isLocked) return;
              handleLessonPress(lesson.id, lesson.title);
            }}
            disabled={isLocked}
            style={({ pressed }) => [
              styles.lessonCard,
              isLocked && styles.lessonCardLocked,
              pressed && !isLocked && { opacity: 0.9 },
            ]}
          >
            <View style={styles.lessonRow}>
              <View style={[
                styles.lessonCircle,
                {
                  backgroundColor: isLocked ? "#cbd5e1" : LESSON_COLORS[lessonIndex % LESSON_COLORS.length],
                  borderColor: isCompleted
                    ? Brand.success
                    : isLastVisited
                    ? Brand.warning
                    : "transparent",
                  borderWidth: isCompleted || isLastVisited ? 3 : 0,
                },
              ]}>
                <Text style={[styles.lessonCircleIcon, isLocked && styles.lessonCircleIconLocked]}>
                  {isLocked ? "🔒" : LESSON_ICONS[lessonIndex % LESSON_ICONS.length]}
                </Text>
                {isCompleted && (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedBadgeText}>✓</Text>
                  </View>
                )}
              </View>
              <View style={styles.lessonInfo}>
                <Text style={[styles.lessonTitle, isLocked && styles.lessonTitleLocked]}>{lesson.title}</Text>
                <Text style={styles.lessonMeta}>
                  {isCompleted ? "Completed" : isLocked ? "Locked" : "Tap to start"}
                </Text>
              </View>
            </View>
          </Pressable>
        );
      })}

      {allLessonsCompleted && (
        <Pressable
          style={styles.nextBtn}
          onPress={() => router.replace("/(tabs)")}
        >
          <Text style={styles.nextBtnText}>All lessons complete! Choose your next section</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { fontSize: 16, fontWeight: "700", color: "#7c869c" },
  errorText: {
    fontSize: 16,
    fontWeight: "700",
    color: Brand.danger,
    marginBottom: Spacing.three,
  },
  backBtn: {
    backgroundColor: Brand.primary,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  scroll: { flex: 1, backgroundColor: Brand.surface },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  header: {
    borderRadius: 0,
    padding: Spacing.five,
    alignItems: "center",
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  headerIcon: { fontSize: 48 },
  headerTitle: { fontSize: 24, fontWeight: "900", color: "#fff" },
  headerSub: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
  },
  lessonCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: Spacing.four,
    marginBottom: Spacing.three,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  lessonCardLocked: {
    opacity: 0.5,
  },
  lessonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  lessonCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 4,
  },
  lessonCircleIcon: { fontSize: 48, color: "#fff" },
  lessonCircleIconLocked: { fontSize: 32 },
  completedBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: Brand.success,
    borderRadius: CIRCLE_SIZE / 4,
    width: CIRCLE_SIZE / 3,
    height: CIRCLE_SIZE / 3,
    alignItems: "center",
    justifyContent: "center",
  },
  completedBadgeText: { color: "#fff", fontSize: CIRCLE_SIZE / 5, fontWeight: "900" },
  lessonInfo: { flex: 1, gap: 4 },
  lessonTitle: { fontSize: 17, fontWeight: "900", color: "#1c2742" },
  lessonTitleLocked: { color: "#9aa3b5" },
  lessonMeta: { fontSize: 13, fontWeight: "600", color: "#5b6478" },
  nextBtn: {
    backgroundColor: Brand.primary,
    borderRadius: 16,
    paddingVertical: Spacing.four,
    alignItems: "center",
    marginTop: Spacing.four,
  },
  nextBtnText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },
});