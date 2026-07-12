import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProgressBar } from "@/components/ProgressBar";
import { Brand, Spacing } from "@/constants/theme";
import { MODULES } from "@/data/modules";
import type { Progress, User } from "@/data/types";
import { auth } from "@/lib/storage";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);

  useFocusEffect(
    useCallback(() => {
      const u = auth.getCurrentUser();
      if (!u) {
        router.replace("/");
        return;
      }
      setUser(u);
      setProgress(auth.getProgress(u));
    }, [router]),
  );

  if (!user || !progress) return <View style={styles.flex} />;

  const completedCount = progress.completedModules.length;
  const total = MODULES.length;
  const xpForNext = 100;
  const xpIntoLevel = progress.xp % xpForNext;

  function isUnlocked(index: number) {
    if (index === 0) return true;
    const prev = MODULES[index - 1];
    return progress!.completedModules.includes(prev.id);
  }

  function openModule(id: string, unlocked: boolean) {
    if (!unlocked) return;
    router.push({ pathname: "/lesson", params: { module: id } });
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + Spacing.three },
      ]}
    >
      <View style={styles.topBar}>
        <View style={styles.heroId}>
          <Text style={styles.avatar}>{user.avatar}</Text>
          <View>
            <Text style={styles.hi}>Hi {user.name}!</Text>
            <Text style={styles.level}>
              Level {Math.floor(progress.xp / xpForNext) + 1}
            </Text>
          </View>
        </View>
        <View style={styles.streak}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakNum}>{progress.streak}</Text>
        </View>
      </View>

      <View style={styles.xpCard}>
        <View style={styles.xpRow}>
          <Text style={styles.xpLabel}>Daily XP</Text>
          <Text style={styles.xpValue}>{progress.xp} XP</Text>
        </View>
        <ProgressBar value={xpIntoLevel / xpForNext} color={Brand.success} />
      </View>

      <Text style={styles.sectionTitle}>Your Mission Map</Text>

      <View style={styles.path}>
        {MODULES.map((m, i) => {
          const unlocked = isUnlocked(i);
          const done = progress.completedModules.includes(m.id);
          return (
            <ModuleNode
              key={m.id}
              index={i}
              icon={m.icon}
              title={m.title}
              subtitle={m.subtitle}
              color={m.color}
              badge={m.badge}
              done={done}
              unlocked={unlocked}
              onPress={() => openModule(m.id, unlocked)}
            />
          );
        })}
      </View>

      <Text style={styles.progressFoot}>
        {completedCount} / {total} worlds completed 🌟
      </Text>
    </ScrollView>
  );
}

function ModuleNode({
  index,
  icon,
  title,
  subtitle,
  color,
  badge,
  done,
  unlocked,
  onPress,
}: {
  index: number;
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  badge: string;
  done: boolean;
  unlocked: boolean;
  onPress: () => void;
}) {
  const offset = index % 2 === 0 ? 0 : Spacing.five;
  return (
    <Pressable
      onPress={onPress}
      disabled={!unlocked}
      style={({ pressed }) => [
        styles.nodeWrap,
        { marginLeft: offset },
        pressed && unlocked && styles.pressed,
      ]}
    >
      <View style={[styles.connector, { backgroundColor: color }]} />
      <View
        style={[
          styles.node,
          { backgroundColor: color, opacity: unlocked ? 1 : 0.5 },
        ]}
      >
        <View style={styles.nodeIcon}>
          <Text style={styles.nodeEmoji}>{unlocked ? icon : "🔒"}</Text>
        </View>
        <View style={styles.nodeText}>
          <Text style={styles.nodeTitle}>{title}</Text>
          <Text style={styles.nodeSubtitle}>
            {unlocked ? subtitle : "Locked  finish the world before!"}
          </Text>
        </View>
        <View style={styles.nodeStatus}>
          {done ? (
            <View style={styles.statusDone}>
              <Text style={styles.statusDoneText}>{badge} Review</Text>
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
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flex: 1, backgroundColor: Brand.surface },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
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
  pressed: { transform: [{ scale: 0.98 }] },
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
});
