import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  useCurriculumSection,
  useCurriculumUnits,
  useMyProgress,
} from "@/hooks/useApiQueries";
import { useAuthStore } from "@/stores/authStore";
import { Brand, Spacing } from "@/constants/theme";
import {
  Pressable,
  ScrollView,
  Text,
  View,
  Animated,
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CIRCLE_SIZE = 129;
const HORIZONTAL_PADDING = Spacing.four * 2;
const CENTER_GAP = 16;

type Point = { x: number; y: number };

function snakeLayout(
  count: number,
  containerWidth: number,
  rowHeight: number
): Point[] {
  const usableWidth = containerWidth - HORIZONTAL_PADDING;
  const points: Point[] = [];
  let index = 0;

  while (index < count) {
    const row = Math.floor(index / 2);
    const y = row * rowHeight;

    if (index + 1 < count) {
      const isEvenRow = row % 2 === 0;
      const leftX = isEvenRow ? 0 : usableWidth - CIRCLE_SIZE;
      const rightX = isEvenRow ? usableWidth - CIRCLE_SIZE : 0;

      points.push({ x: leftX, y });
      points.push({ x: rightX, y });
      index += 2;
    } else {
      points.push({ x: usableWidth / 2 - CIRCLE_SIZE / 2, y });
      index += 1;
    }
  }

  return points;
}

export default function SectionDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const slug = typeof params.slug === "string" ? params.slug : undefined;
  const user = useAuthStore((s) => s.user);
  const sectionQuery = useCurriculumSection(slug ?? "", user?.ageGroup ?? "A");
  const progressQuery = useMyProgress();

  const section = sectionQuery.data?.data.section as
    | {
        id: string;
        slug: string;
        title: string;
        subtitle: string;
        icon: string;
        color: string;
        badge: string;
        badgeName: string;
        units: Array<{
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
        }>;
      }
    | undefined;

  const unitsQuery = useCurriculumUnits(section?.id ?? "");
  const units =
    (unitsQuery.data?.data as { units: unknown[] } | undefined)?.units ??
    section?.units ??
    [];

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

  const containerWidth = useMemo(
    () => SCREEN_WIDTH - HORIZONTAL_PADDING,
    []
  );

  const allUnitsCompleted = units.length > 0 && units.every((unit: any) => {
    const lessons = unit.lessons ?? [];
    return lessons.length > 0 && lessons.every((l: any) => lessonProgressMap[l.id]);
  });

  if (sectionQuery.isLoading) {
    return (
      <View
        style={[
          styles.flex,
          styles.center,
          { paddingTop: insets.top + Spacing.six },
        ]}
      >
        <Text style={styles.loadingText}>Loading section...</Text>
      </View>
    );
  }

  if (!section) {
    return (
      <View
        style={[
          styles.flex,
          styles.center,
          { paddingTop: insets.top + Spacing.six },
        ]}
      >
        <Text style={styles.errorText}>Section not found</Text>
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
      <View style={[styles.header, { backgroundColor: section.color }]}>
        <Text style={styles.headerIcon}>{section.icon}</Text>
        <Text style={styles.headerTitle}>{section.title}</Text>
        <Text style={styles.headerSub}>{section.subtitle}</Text>
      </View>

      {units.map((unit: any, unitIndex: number) => {
        const lessons = unit.lessons ?? [];
        const positions = snakeLayout(
          lessons.length,
          SCREEN_WIDTH,
          160
        );

        const maxRow = lessons.length > 0 ? Math.ceil(lessons.length / 2) : 0;
        const pathHeight = maxRow * 160;

        const prevUnitCompleted = unitIndex === 0 || units.slice(0, unitIndex).every((prevUnit: any) => {
          const prevLessons = prevUnit.lessons ?? [];
          return prevLessons.length > 0 && prevLessons.every((l: any) => lessonProgressMap[l.id]);
        });
        const isUnitLocked = unitIndex > 0 && !prevUnitCompleted;

        return (
          <View
            key={unit.id}
            style={[
              styles.unitCard,
              { backgroundColor: section.color + "14" },
              { borderLeftColor: section.color },
            ]}
          >
            <View style={styles.unitHeader}>
              <Text style={styles.unitIcon}>{unit.icon}</Text>
              <View style={styles.unitText}>
                <Text style={[styles.unitTitle, isUnitLocked && styles.unitTitleLocked]}>{unit.title}</Text>
                <Text style={styles.unitDesc}>{unit.description}</Text>
              </View>
              {isUnitLocked && (
                <Text style={styles.unitLockText}>🔒</Text>
              )}
            </View>

            <View style={[styles.snakeContainer, { height: pathHeight }]}>
              {lessons.map((lesson: any, lessonIndex: number) => {
                const pos = positions[lessonIndex];
                if (!pos) return null;

                const lessonColor =
                  LESSON_COLORS[lessonIndex % LESSON_COLORS.length];
                const lessonIcon =
                  LESSON_ICONS[lessonIndex % LESSON_ICONS.length];
                const isCompleted = lessonProgressMap[lesson.id];
                const isLastVisited = lastLessonId === lesson.id;

                const prevLessonCompleted = lessonIndex === 0 || lessons.slice(0, lessonIndex).every((prevLesson: any) => lessonProgressMap[prevLesson.id]);
                const isLessonLocked = isUnitLocked || !prevLessonCompleted;

                return (
                  <View
                    key={lesson.id}
                    style={[
                      styles.snakeItem,
                      {
                        left: pos.x + Spacing.four,
                        top: pos.y,
                      },
                    ]}
                  >
                    {lessonIndex > 0 && (
                      <ConnectorLine
                        from={positions[lessonIndex - 1]}
                        to={pos}
                        isFromCompleted={!!lessonProgressMap[lessons[lessonIndex - 1]?.id]}
                        isToCompleted={isCompleted}
                      />
                    )}

                    <Pressable
                      style={({ pressed }) => [
                        styles.lessonCircle,
                        {
                          backgroundColor: isLessonLocked ? "#cbd5e1" : lessonColor,
                          borderColor: isCompleted
                            ? Brand.success
                            : isLastVisited
                            ? Brand.warning
                            : "transparent",
                          borderWidth: isCompleted || isLastVisited ? 3 : 0,
                        },
                        pressed && !isLessonLocked && { transform: [{ scale: 0.95 }] },
                      ]}
                      onPress={() => {
                        if (isLessonLocked) return;
                        persistLastLesson(lesson.id);
                        router.push({
                          pathname: "/lesson",
                          params: {
                            lecture: section.slug,
                            lessonId: lesson.id,
                            unitId: unit.id,
                          },
                        });
                      }}
                    >
                      <Text style={[styles.lessonCircleIcon, isLessonLocked && styles.lessonCircleIconLocked]}>
                        {isLessonLocked ? "🔒" : lessonIcon}
                      </Text>
                      {isCompleted && (
                        <View style={styles.completedBadge}>
                          <Text style={styles.completedBadgeText}>✓</Text>
                        </View>
                      )}
                    </Pressable>

                    <Text
                      style={[styles.lessonCircleLabel, isLessonLocked && styles.lessonCircleLabelLocked]}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {lesson.title}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}

      {allUnitsCompleted && (
        <Pressable
          style={styles.nextSectionBtn}
          onPress={() => router.replace("/(tabs)")}
        >
          <Text style={styles.nextSectionBtnText}>All units complete! Choose your next section</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

function ConnectorLine({
  from,
  to,
  isFromCompleted,
  isToCompleted,
}: {
  from: Point;
  to: Point;
  isFromCompleted: boolean;
  isToCompleted: boolean;
}) {
  const isSolid = isFromCompleted && isToCompleted;
  const startX = from.x + CIRCLE_SIZE / 2;
  const startY = from.y + CIRCLE_SIZE;
  const endX = to.x + CIRCLE_SIZE / 2;
  const endY = to.y;

  const midY = (startY + endY) / 2;

  return (
    <View style={[styles.connectorLine, { left: 0, top: 0 }]}>
      <View
        style={[
          styles.lineVertical,
          {
            left: startX - 1,
            top: Math.min(startY, midY),
            height: Math.abs(midY - startY),
            borderLeftColor: isSolid ? Brand.success : "#cbd5e1",
          } as any,
        ]}
      />
      <View
        style={[
          styles.lineHorizontal,
          {
            top: midY - 1,
            left: Math.min(startX, endX),
            width: Math.abs(endX - startX),
            borderTopColor: isSolid ? Brand.success : "#cbd5e1",
          } as any,
        ]}
      />
      <View
        style={[
          styles.lineVertical,
          {
            left: endX - 1,
            top: Math.min(midY, endY),
            height: Math.abs(endY - midY),
            borderLeftColor: isSolid ? Brand.success : "#cbd5e1",
          } as any,
        ]}
      />
    </View>
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
    paddingHorizontal: 0,
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
  unitCard: {
    borderRadius: 0,
    paddingVertical: Spacing.four,
    paddingHorizontal: 0,
    marginBottom: Spacing.three,
    gap: Spacing.three,
    borderLeftWidth: 0,
    shadowColor: "transparent",
    shadowOpacity: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
    elevation: 0,
  },
  unitHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.two,
  },
  unitIcon: { fontSize: 32 },
  unitText: { flex: 1 },
  unitTitle: { fontSize: 17, fontWeight: "900", color: "#1c2742" },
  unitTitleLocked: { color: "#9aa3b5" },
  unitDesc: { fontSize: 13, fontWeight: "600", color: "#5b6478", marginTop: 2 },
  unitLockText: { fontSize: 20 },
  snakeContainer: {
    width: "100%",
    position: "relative",
    marginTop: Spacing.two,
    marginBottom: Spacing.four,
  },
  snakeItem: {
    position: "absolute",
    width: CIRCLE_SIZE,
    alignItems: "center",
    gap: Spacing.two,
  },
  connectorLine: {
    position: "absolute",
    width: SCREEN_WIDTH,
    height: 160,
    pointerEvents: "none",
  },
  lineVertical: {
    position: "absolute",
    width: 2,
    borderLeftWidth: 2,
    borderStyle: "solid",
  },
  lineHorizontal: {
    position: "absolute",
    height: 2,
    borderTopWidth: 2,
    borderStyle: "solid",
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
  lessonCircleLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1c2742",
    textAlign: "center",
    minHeight: 28,
    maxWidth: CIRCLE_SIZE * 1.8,
  },
  lessonCircleLabelLocked: { color: "#9aa3b5" },
  nextSectionBtn: {
    backgroundColor: Brand.primary,
    borderRadius: 16,
    paddingVertical: Spacing.four,
    alignItems: "center",
    marginTop: Spacing.four,
  },
  nextSectionBtnText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },
});