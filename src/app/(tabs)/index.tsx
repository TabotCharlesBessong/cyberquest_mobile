import { useRouter } from "expo-router";
import { useRef, useEffect } from "react";
import {
  Animated,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProgressBar } from "@/components/ProgressBar";
import { QuestBanner } from "@/components/QuestBanner";
import { StatsCard } from "@/components/StatsCard";
import { useHomeData } from "@/hooks/useHomeData";
import { useRecordActivity, useActiveEvent } from "@/hooks/useApiQueries";
import { Brand, Spacing } from "@/constants/theme";
import { api } from "@/lib/api";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const recordActivity = useRecordActivity();
  const dailyLoginRef = useRef(false);
  const eventQuery = useActiveEvent();
  const activeEvent = eventQuery.data?.data as
    | {
        id: string;
        name: string;
        description: string;
        multiplier: number;
        startsAt: string;
        endsAt: string;
      }
    | null
    | undefined;
  const {
    user,
    lectures,
    modules,
    xp,
    xpForNext,
    xpIntoLevel,
    isLoading,
    error,
    isRefreshing,
    completedCount,
    total,
    isUnlocked,
    onRefresh,
    quests,
    questsQuery,
  } = useHomeData();

  useEffect(() => {
    if (!dailyLoginRef.current && user) {
      dailyLoginRef.current = true;
      recordActivity.mutate("daily_login");
    }
  }, [user, recordActivity]);

  const scale = useRef(new Animated.Value(1)).current;

  function onPressIn() {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  }

  function onPressOut() {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 200,
      useNativeDriver: true,
    }).start();
  }

  if (isLoading) {
    return (
      <View
        style={[
          styles.flex,
          styles.center,
          { paddingTop: insets.top + Spacing.six },
        ]}
      >
        <Text style={styles.loadingText}>Loading your mission map...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.flex,
          styles.center,
          { paddingTop: insets.top + Spacing.six },
        ]}
      >
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={onRefresh} style={styles.retryBtn}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  const activeQuest = quests[0];

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + Spacing.three },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={Brand.primary}
        />
      }
    >
      <View style={styles.topBar}>
        <View style={styles.heroId}>
          <Text style={styles.avatar}>{user?.avatar}</Text>
          <View>
            <Text style={styles.hi}>Hi {user?.name}!</Text>
            <Text style={styles.level}>Level {user?.level ?? 1}</Text>
          </View>
        </View>
        <View style={styles.streak}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakNum}>{user?.streak ?? 0}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <StatsCard emoji="⭐" value={`${xp}`} label="XP" />
        <StatsCard emoji="❤️" value={`${user?.hearts ?? 0}`} label="Hearts" />
        <StatsCard
          emoji="💎"
          value={`${user?.gems ?? 0}`}
          label="Gems"
          accent
        />
      </View>

      <View style={styles.xpCard}>
        <View style={styles.xpRow}>
          <Text style={styles.xpLabel}>Level Progress</Text>
          <Text style={styles.xpValue}>
            {xpIntoLevel} / {xpForNext} XP
          </Text>
        </View>
        <ProgressBar value={xpIntoLevel / xpForNext} color={Brand.success} />
      </View>

      {activeQuest && (
        <QuestBanner
          emoji="⚡"
          title={activeQuest.title}
          description={activeQuest.description}
          progress={activeQuest.progress}
          target={activeQuest.target}
          isCompleted={activeQuest.isCompleted}
          isClaimed={activeQuest.isClaimed}
          xpReward={activeQuest.xpReward}
          gemsReward={activeQuest.gemsReward}
          onClaim={async () => {
            try {
              await api.gamification.claimQuestReward(activeQuest.id);
              questsQuery.refetch();
            } catch (e) {
              console.warn("Failed to claim quest", e);
            }
          }}
        />
      )}

      {activeEvent && (
        <Pressable style={styles.eventBanner} onPress={() => {}}>
          <Text style={styles.eventEmoji}>🎉</Text>
          <View style={styles.eventText}>
            <Text style={styles.eventTitle}>{activeEvent.name}</Text>
            <Text style={styles.eventSub}>{activeEvent.description}</Text>
            <Text style={styles.eventMultiplier}>
              {activeEvent.multiplier}x XP
            </Text>
          </View>
        </Pressable>
      )}

      <Text style={styles.sectionTitle}>Your Mission Map</Text>

      <View style={styles.path}>
        {lectures.map((m, i) => {
          const unlocked = isUnlocked(i);
          const progress = modules.find((p) => p.slug === m.slug);
          const done = progress?.status === "completed";
          return (
            <Pressable
              key={m.id}
              onPress={() => {
                if (!unlocked) return;
                router.push({
                  pathname: "/section/[slug]",
                  params: { slug: m.slug },
                });
              }}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              disabled={!unlocked}
              style={({ pressed }) => [
                styles.nodeWrap,
                { marginLeft: i % 2 === 0 ? 0 : Spacing.five },
                pressed && unlocked && { opacity: 0.9 },
              ]}
            >
              <View style={[styles.connector, { backgroundColor: m.color }]} />
              <Animated.View
                style={[
                  styles.node,
                  {
                    backgroundColor: m.color,
                    opacity: unlocked ? 1 : 0.5,
                    transform: [{ scale }],
                  },
                ]}
              >
                <View style={styles.nodeIcon}>
                  <Text style={styles.nodeEmoji}>
                    {unlocked ? m.icon : "🔒"}
                  </Text>
                </View>
                <View style={styles.nodeText}>
                  <Text style={styles.nodeTitle}>{m.title}</Text>
                  <Text style={styles.nodeSubtitle}>
                    {unlocked
                      ? m.subtitle
                      : "Locked — finish the world before!"}
                  </Text>
                </View>
                <View style={styles.nodeStatus}>
                  {done ? (
                    <View style={styles.statusDone}>
                      <Text style={styles.statusDoneText}>
                        {m.badge} Review
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.statusStart,
                        { backgroundColor: "rgba(255,255,255,0.25)" },
                      ]}
                    >
                      <Text style={styles.statusStartText}>
                        {unlocked ? "Start ▶" : "Locked"}
                      </Text>
                    </View>
                  )}
                </View>
              </Animated.View>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.progressFoot}>
        {completedCount} / {total} worlds completed 🌟
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
  },
  scroll: { flex: 1, backgroundColor: Brand.surface },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  loadingText: { fontSize: 16, fontWeight: "700", color: "#7c869c" },
  errorText: {
    fontSize: 16,
    fontWeight: "700",
    color: Brand.danger,
    textAlign: "center",
    marginBottom: Spacing.three,
  },
  retryBtn: {
    backgroundColor: Brand.primary,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroId: { flexDirection: "row", alignItems: "center", gap: Spacing.two },
  avatar: {
    fontSize: 40,
    width: 56,
    height: 56,
    textAlign: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#e2e8f4",
    overflow: "hidden",
    lineHeight: 56,
  },
  hi: { fontSize: 20, fontWeight: "800", color: "#1c2742" },
  level: { fontSize: 13, fontWeight: "700", color: Brand.primary },
  streak: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 6,
    borderWidth: 2,
    borderColor: "#ffe2c2",
  },
  streakEmoji: { fontSize: 20 },
  streakNum: { fontSize: 18, fontWeight: "900", color: "#ff8a3d" },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  xpCard: {
    marginTop: Spacing.three,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: Spacing.three,
    gap: Spacing.two,
    shadowColor: Brand.shadow,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },
  xpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  xpLabel: { fontSize: 14, fontWeight: "800", color: "#3a4560" },
  xpValue: { fontSize: 14, fontWeight: "800", color: Brand.success },
  sectionTitle: {
    marginTop: Spacing.five,
    marginBottom: Spacing.two,
    fontSize: 20,
    fontWeight: "900",
    color: "#1c2742",
  },
  path: { gap: Spacing.three },
  nodeWrap: { position: "relative" },
  connector: {
    position: "absolute",
    left: 28,
    top: -Spacing.three,
    width: 4,
    height: Spacing.three,
    opacity: 0.4,
  },
  node: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    padding: Spacing.three,
    gap: Spacing.three,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  nodeIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  nodeEmoji: { fontSize: 34 },
  nodeText: { flex: 1, gap: 2 },
  nodeTitle: { fontSize: 19, fontWeight: "900", color: "#fff" },
  nodeSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
  },
  nodeStatus: {},
  statusDone: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  statusDoneText: { color: "#1c2742", fontWeight: "900", fontSize: 13 },
  statusStart: { borderRadius: 14, paddingVertical: 8, paddingHorizontal: 12 },
  statusStartText: { color: "#fff", fontWeight: "900", fontSize: 13 },
  progressFoot: {
    textAlign: "center",
    marginTop: Spacing.four,
    color: "#7c869c",
    fontSize: 14,
    fontWeight: "700",
  },
  eventBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: Spacing.three,
    borderWidth: 2,
    borderColor: Brand.warning,
    marginBottom: Spacing.four,
  },
  eventEmoji: { fontSize: 28 },
  eventText: { flex: 1 },
  eventTitle: { fontSize: 15, fontWeight: "900", color: "#1c2742" },
  eventSub: { fontSize: 13, fontWeight: "700", color: "#5b6478" },
  eventMultiplier: { fontSize: 12, fontWeight: "800", color: Brand.warning },
});
