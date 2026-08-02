import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

import {
  useCurriculumSection,
  useCurriculumUnits,
  useMyProgress,
} from "@/hooks/useApiQueries";
import { useAuthStore } from "@/stores/authStore";
import { Brand, Spacing, Layout, Rounded, Typography, Surface, Primary, Secondary, Tertiary } from "@/constants/theme";
import {
  Pressable,
  ScrollView,
  Text,
  View,
  type ColorValue,
} from "react-native";

const CIRCLE_SIZE = 129;
const STORAGE_KEYS = {
  lastLesson: "@cyberquest:lastLesson",
};

const UNIT_GRADIENTS: readonly ColorValue[][] = [
  [Primary.primary as any, Primary.primaryContainer as any],
  [Secondary.secondary as any, Secondary.secondaryContainer as any],
  [Tertiary.tertiary as any, Tertiary.tertiaryContainer as any],
  [Brand.success as any, "#2BC48A" as any],
  [Brand.warning as any, "#FFC93C" as any],
  [Brand.danger as any, "#FF6B6B" as any],
  [Brand.accent as any, Secondary.secondaryContainer as any],
  [Tertiary.tertiaryContainer as any, Tertiary.tertiaryFixed as any],
];

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

  const allUnitsCompleted = units.length > 0 && units.every((unit: any) => {
    const lessons = unit.lessons ?? [];
    return lessons.length > 0 && lessons.every((l: any) => lessonProgressMap[l.id]);
  });

  if (sectionQuery.isLoading) {
    return (
      <View style={[styles.flex, styles.center, { paddingTop: insets.top + Spacing.six }]}>
        <Text style={[Typography.bodyMd, { color: Surface.onSurfaceVariant }]}>Loading section...</Text>
      </View>
    );
  }

  if (!section) {
    return (
      <View style={[styles.flex, styles.center, { paddingTop: insets.top + Spacing.six }]}>
        <Text style={[Typography.headlineMd, { color: Brand.danger, marginBottom: Spacing.three }]}>Section not found</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[Typography.headlineMd, { color: Surface.surfaceContainerLowest }]}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* ── TOP NAV ─────────────────────────────────────── */}
      <View style={[styles.topNav, { paddingTop: insets.top }]}>
        <View style={styles.navLeft}>
          <View style={styles.avatarRing}>
            <Text style={{ fontSize: 18 }}>🧒</Text>
          </View>
          <Text style={[Typography.headlineLg, { color: Primary.primary, fontSize: 20 }]}>CyberQuest</Text>
        </View>
        <View style={styles.xpChip}>
          <Text style={[Typography.labelCaps, { color: Surface.onSurface }]}>⚡ 450 XP</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: Surface.surface }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.three }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── STREAK + MASCOT ──────────────────────────────────── */}
        <View style={styles.statsRow}>
          <View style={{ flex: 1, gap: Spacing.two }}>
            <View style={styles.streakBadge}>
              <Text style={[Typography.labelCaps, { color: Secondary.onSecondaryContainer, fontSize: 13 }]}>
                🔥 5 DAY STREAK
              </Text>
            </View>
            <View style={styles.xpBarTrack}>
              <LinearGradient
                colors={[Primary.primary, Secondary.secondary]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[styles.xpBarFill, { width: "65%" }]}
              />
            </View>
            <Text style={[Typography.labelCaps, { color: Surface.onSurfaceVariant }]}>
              LVL 12 • 150XP TO NEXT LEVEL
            </Text>
          </View>

          <View style={styles.mascotWrap}>
            <View style={styles.mascotCircle}>
              <Text style={{ fontSize: 40 }}>🛡️</Text>
              <View style={styles.mascotBadge}>
                <Text style={[Typography.labelCaps, { color: Tertiary.onTertiaryContainer, fontSize: 10 }]}>12</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── MISSION MAP ──────────────────────────────────────── */}
        <View style={styles.mapSection}>
          {units.map((unit: any, unitIndex: number) => {
            const lessons = unit.lessons ?? [];

            const prevUnitCompleted = unitIndex === 0 || units.slice(0, unitIndex).every((prevUnit: any) => {
              const prevLessons = prevUnit.lessons ?? [];
              return prevLessons.length > 0 && prevLessons.every((l: any) => lessonProgressMap[l.id]);
            });
            const isUnitLocked = unitIndex > 0 && !prevUnitCompleted;

            const gradientColors = UNIT_GRADIENTS[unitIndex % UNIT_GRADIENTS.length];

            return (
              <View key={unit.id} style={styles.unitBlock}>
                {/* Unit card with gradient background */}
                <LinearGradient
                  colors={gradientColors as any}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={[
                    styles.unitCard,
                    isUnitLocked && styles.unitCardLocked,
                    { borderLeftColor: section.color },
                  ]}
                >
                  {/* Unit header */}
                  <View style={styles.unitHeader}>
                    <Text style={styles.unitIcon}>{unit.icon}</Text>
                    <View style={styles.unitText}>
                      <Text style={[Typography.headlineMd, { color: isUnitLocked ? Surface.outline : Surface.onSurface }]}>
                        {unit.title}
                      </Text>
                      <Text style={[Typography.bodyMd, { color: Surface.onSurfaceVariant }]} numberOfLines={1}>
                        {unit.description}
                      </Text>
                    </View>
                    {isUnitLocked && <Text style={styles.unitLockText}>🔒</Text>}
                  </View>

                  {/* Vertical dashed connector line */}
                  {lessons.length > 1 && (
                    <View style={styles.unitConnectorLine} />
                  )}

                  {/* Lessons stacked vertically */}
                  <View style={styles.lessonsList}>
                    {lessons.map((lesson: any, lessonIndex: number) => {
                      const isCompleted = !!lessonProgressMap[lesson.id];
                      const isLastVisited = lastLessonId === lesson.id;

                      const prevLessonCompleted = lessonIndex === 0 || lessons.slice(0, lessonIndex).every((prevLesson: any) => lessonProgressMap[prevLesson.id]);
                      const isLessonLocked = isUnitLocked || !prevLessonCompleted;

                      const statusLabel = isCompleted ? "COMPLETED" : isLastVisited ? "CURRENT" : isLessonLocked ? "LOCKED" : "";
                      const statusColor = isCompleted ? Brand.success : isLastVisited ? Primary.primary : Surface.outline;

                      return (
                        <View key={lesson.id} style={styles.lessonNode}>
                          {/* Vertical connector between lessons */}
                          {lessonIndex > 0 && (
                            <View style={[
                              styles.lessonConnector,
                              { borderLeftColor: isCompleted && !!lessonProgressMap[lessons[lessonIndex - 1]?.id] ? Brand.success : Surface.outlineVariant },
                            ]} />
                          )}

                          <View style={styles.lessonRow}>
                            {/* Circle */}
                            <Pressable
                              style={({ pressed }) => [
                                styles.nodeCircle,
                                {
                                  backgroundColor: isLessonLocked ? Surface.surfaceContainerHighest : isCompleted ? Brand.success : Primary.primaryContainer,
                                  borderColor: isLastVisited ? Primary.primaryContainer : isCompleted ? Brand.success : Surface.surfaceContainerLowest,
                                  borderWidth: isCompleted || isLastVisited ? 4 : 0,
                                  shadowColor: isLessonLocked ? "transparent" : Primary.primaryContainer,
                                },
                                isLastVisited && styles.nodeCircleCurrent,
                                pressed && !isLessonLocked && { transform: [{ scale: 0.93 }] },
                              ]}
                              onPress={() => {
                                if (isLessonLocked) return;
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                AsyncStorage.setItem(STORAGE_KEYS.lastLesson, lesson.id);
                                setLastLessonId(lesson.id);
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
                              <Text style={[styles.nodeIcon, { opacity: isLessonLocked ? 0.4 : 1 }]}>
                                {isLessonLocked ? "🔒" : isCompleted ? "✓" : "🌟"}
                              </Text>

                              {/* Star badge on completed */}
                              {isCompleted && (
                                <View style={styles.starBadge}>
                                  <Text style={{ fontSize: 14 }}>⭐</Text>
                                </View>
                              )}

                              {/* CURRENT tag */}
                              {isLastVisited && (
                                <View style={styles.currentTag}>
                                  <Text style={[Typography.labelCaps, { color: Surface.surfaceContainerLowest, fontSize: 9 }]}>CURRENT</Text>
                                </View>
                              )}
                            </Pressable>

                            {/* Lesson info */}
                            <View style={styles.lessonInfo}>
                              {statusLabel !== "" && (
                                <Text style={[Typography.labelCaps, { color: statusColor }]}>
                                  {statusLabel}
                                </Text>
                              )}
                              <Text
                                style={[
                                  Typography.headlineMd,
                                  {
                                    color: isLessonLocked ? Surface.outline : isLastVisited ? Primary.primary : Surface.onSurface,
                                    marginTop: Spacing.two,
                                  },
                                ]}
                                numberOfLines={2}
                              >
                                {lesson.title}
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </LinearGradient>
              </View>
            );
          })}

          {/* Mystery reward teaser */}
          <View style={styles.mysteryCard}>
            <Text style={{ fontSize: 36, marginBottom: Spacing.two }}>🎁</Text>
            <Text style={[Typography.headlineMd, { color: Surface.onSurfaceVariant, marginBottom: Spacing.one }]}>
              Mystery Reward
            </Text>
            <Text style={[Typography.bodyMd, { color: Surface.outline, textAlign: "center" }]}>
              Complete 2 more missions to unlock!
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Surface.surface },
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  // Top nav
  topNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Layout.containerMarginMobile,
    paddingBottom: Spacing.three,
    backgroundColor: "rgba(248,249,255,0.9)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.3)",
    shadowColor: Primary.primaryContainer,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  navLeft: { flexDirection: "row", alignItems: "center", gap: Spacing.two },
  avatarRing: {
    width: 40,
    height: 40,
    borderRadius: Rounded.full,
    backgroundColor: Primary.primaryContainer,
    borderWidth: 2,
    borderColor: Primary.primary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  xpChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Rounded.full,
    backgroundColor: Surface.surfaceContainerHighest,
    borderWidth: 1,
    borderColor: Surface.outlineVariant,
  },

  scrollContent: { paddingHorizontal: Layout.containerMarginMobile, paddingTop: Spacing.three, gap: Spacing.three },

  // Streak + mascot
  statsRow: { flexDirection: "row", alignItems: "center", gap: Spacing.four },
  streakBadge: {
    alignSelf: "flex-start",
    backgroundColor: Secondary.secondaryFixed,
    borderRadius: Rounded.full,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  xpBarTrack: {
    height: 14,
    backgroundColor: Surface.surfaceContainerHigh,
    borderRadius: Rounded.full,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Surface.outlineVariant,
  },
  xpBarFill: { height: "100%", borderRadius: Rounded.full },
  mascotWrap: { alignItems: "center" },
  mascotCircle: {
    width: 88,
    height: 88,
    borderRadius: Rounded.full,
    backgroundColor: Primary.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Primary.primary,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  mascotBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: Rounded.full,
    backgroundColor: Tertiary.tertiaryContainer,
    borderWidth: 2,
    borderColor: Surface.surfaceContainerLowest,
    alignItems: "center",
    justifyContent: "center",
  },

  // Map
  mapSection: { paddingVertical: Spacing.three, gap: Layout.stackLg },

  // Unit block
  unitBlock: { width: "100%", marginBottom: Layout.stackMd },
  unitCard: {
    borderRadius: Rounded.lg,
    padding: Spacing.four,
    overflow: "hidden",
    borderLeftWidth: 4,
  },
  unitCardLocked: { opacity: 0.6 },
  unitHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  unitIcon: { fontSize: 32 },
  unitText: { flex: 1 },
  unitLockText: { fontSize: 20 },

  // Vertical connector within a unit
  unitConnectorLine: {
    position: "absolute",
    left: Spacing.four + CIRCLE_SIZE / 2 - 2,
    top: Spacing.four + CIRCLE_SIZE + Spacing.two,
    bottom: Spacing.four,
    width: 4,
    borderLeftWidth: 4,
    borderStyle: "dashed",
    borderColor: Surface.outlineVariant,
    zIndex: 0,
  },

  // Lessons list
  lessonsList: { gap: Spacing.three, zIndex: 10 },
  lessonNode: { flexDirection: "row", alignItems: "flex-start" },
  lessonConnector: {
    position: "absolute",
    left: Spacing.four + CIRCLE_SIZE / 2 - 2,
    top: CIRCLE_SIZE + Spacing.two,
    bottom: -(CIRCLE_SIZE / 2 + Spacing.two),
    width: 4,
    borderLeftWidth: 4,
    borderStyle: "dashed",
  },
  lessonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    flex: 1,
  },
  nodeCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  nodeCircleCurrent: {
    shadowColor: Primary.primary,
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 10,
  },
  nodeIcon: { fontSize: 48, color: Surface.surfaceContainerLowest },
  starBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: Secondary.secondaryContainer,
    borderRadius: Rounded.full,
    padding: Spacing.one,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  currentTag: {
    position: "absolute",
    bottom: -10,
    backgroundColor: Primary.primary,
    borderRadius: Rounded.full,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
  lessonInfo: { flex: 1, gap: Spacing.two },

  // Mystery card
  mysteryCard: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: Rounded.lg,
    padding: Spacing.four,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Surface.outlineVariant,
    alignItems: "center",
    zIndex: 10,
    shadowColor: Brand.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },

  // Back button
  backBtn: {
    backgroundColor: Primary.primary,
    borderRadius: Rounded.DEFAULT,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
});