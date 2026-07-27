import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCallback } from "react";

import {
  useCurriculumSection,
  useCurriculumUnits,
} from "@/hooks/useApiQueries";
import { useAuthStore } from "@/stores/authStore";
import { Brand, Spacing } from "@/constants/theme";
import { Pressable, ScrollView, Text, View, Animated } from "react-native";

export default function SectionDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const slug = typeof params.slug === "string" ? params.slug : undefined;
  const user = useAuthStore((s) => s.user);
  const sectionQuery = useCurriculumSection(slug ?? "", user?.ageGroup ?? "A");

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

      <Text style={styles.sectionTitle}>Units</Text>

      {units.map((unit: any) => (
        <View key={unit.id} style={styles.unitCard}>
          <View style={styles.unitHeader}>
            <Text style={styles.unitIcon}>{unit.icon}</Text>
            <View style={styles.unitText}>
              <Text style={styles.unitTitle}>{unit.title}</Text>
              <Text style={styles.unitDesc}>{unit.description}</Text>
            </View>
          </View>

          <View style={styles.lessonList}>
            {unit.lessons?.map((lesson: any) => (
              <Pressable
                key={lesson.id}
                style={styles.lessonRow}
                onPress={() => {
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
                <View
                  style={[styles.lessonDot, { backgroundColor: section.color }]}
                />
                <View style={styles.lessonInfo}>
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  <Text style={styles.lessonMeta}>
                    {lesson.questions?.length
                      ? `${lesson.questions.length} questions`
                      : "Lesson"}
                  </Text>
                </View>
                <Text style={styles.lessonArrow}>›</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
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
    borderRadius: 24,
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
  sectionTitle: {
    marginBottom: Spacing.three,
    fontSize: 18,
    fontWeight: "900",
    color: "#1c2742",
  },
  unitCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: Spacing.four,
    marginBottom: Spacing.three,
    gap: Spacing.three,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },
  unitHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  unitIcon: { fontSize: 32 },
  unitText: { flex: 1 },
  unitTitle: { fontSize: 17, fontWeight: "900", color: "#1c2742" },
  unitDesc: { fontSize: 13, fontWeight: "600", color: "#5b6478", marginTop: 2 },
  lessonList: { gap: Spacing.two },
  lessonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    backgroundColor: "#f8fafc",
    borderRadius: 14,
  },
  lessonDot: { width: 10, height: 10, borderRadius: 5 },
  lessonInfo: { flex: 1 },
  lessonTitle: { fontSize: 15, fontWeight: "800", color: "#1c2742" },
  lessonMeta: { fontSize: 12, fontWeight: "700", color: "#7c869c" },
  lessonArrow: { fontSize: 22, fontWeight: "900", color: "#7c869c" },
});
