import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Brand, Spacing } from "@/constants/theme";
import { MODULES } from "@/data/modules";
import type { Progress, User } from "@/data/types";
import { auth } from "@/lib/storage";

export default function ProfileScreen() {
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

  function logout() {
    auth.logout();
    router.replace("/");
  }

  if (!user || !progress) return <View style={styles.flex} />;

  const level = Math.floor(progress.xp / 100) + 1;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + Spacing.three },
      ]}
    >
      <View style={styles.card}>
        <Text style={styles.avatar}>{user.avatar}</Text>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.age}>Age {user.age} · Cyber Hero</Text>

        <View style={styles.statsRow}>
          <Stat emoji="⭐" value={`${progress.xp}`} label="XP" />
          <Stat emoji="🔥" value={`${progress.streak}`} label="Streak" />
          <Stat emoji="🏅" value={`${progress.badges.length}`} label="Badges" />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Badges earned</Text>
      {progress.badges.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            Complete a world to earn your first badge! 🌟
          </Text>
        </View>
      ) : (
        <View style={styles.badgeGrid}>
          {MODULES.filter((m) => progress.completedModules.includes(m.id)).map(
            (m) => (
              <View key={m.id} style={styles.badgeCell}>
                <Text style={styles.badgeEmoji}>{m.badge}</Text>
                <Text style={styles.badgeName}>{m.badgeName}</Text>
              </View>
            ),
          )}
        </View>
      )}

      <Text style={styles.sectionTitle}>World progress</Text>
      <View style={styles.modules}>
        {MODULES.map((m) => {
          const done = progress.completedModules.includes(m.id);
          return (
            <View key={m.id} style={styles.moduleRow}>
              <View style={[styles.moduleDot, { backgroundColor: m.color }]}>
                <Text style={styles.moduleEmoji}>{done ? "✓" : m.icon}</Text>
              </View>
              <View style={styles.moduleText}>
                <Text style={styles.moduleTitle}>{m.title}</Text>
                <Text style={styles.moduleSub}>
                  {done ? "Completed" : "Not started"}
                </Text>
              </View>
              {done ? (
                <Text style={styles.moduleCheck}>✓</Text>
              ) : (
                <Text style={styles.moduleLock}>○</Text>
              )}
            </View>
          );
        })}
      </View>

      <Button
        label="Log out"
        variant="secondary"
        fullWidth
        onPress={logout}
        style={styles.logout}
      />
      <Text style={styles.demoNote}>
        Demo prototype data is stored locally on this device.
      </Text>
    </ScrollView>
  );
}

function Stat({
  emoji,
  value,
  label,
}: {
  emoji: string;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
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
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: Spacing.five,
    alignItems: "center",
    shadowColor: Brand.shadow,
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  avatar: {
    fontSize: 64,
    width: 100,
    height: 100,
    textAlign: "center",
    lineHeight: 100,
    backgroundColor: Brand.surface,
    borderRadius: 28,
    overflow: "hidden",
  },
  name: { fontSize: 26, fontWeight: "900", color: "#1c2742", marginTop: 8 },
  age: { fontSize: 14, color: "#7c869c", fontWeight: "700", marginTop: 2 },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.three,
    marginTop: Spacing.four,
  },
  stat: {
    alignItems: "center",
    backgroundColor: Brand.surface,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 18,
    minWidth: 84,
  },
  statEmoji: { fontSize: 22 },
  statValue: { fontSize: 20, fontWeight: "900", color: "#1c2742" },
  statLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#7c869c",
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#1c2742",
    marginTop: Spacing.five,
    marginBottom: Spacing.two,
  },
  empty: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: Spacing.three,
    alignItems: "center",
  },
  emptyText: {
    color: "#7c869c",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.two },
  badgeCell: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: Spacing.three,
    alignItems: "center",
    width: "30%",
    shadowColor: Brand.shadow,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  badgeEmoji: { fontSize: 40 },
  badgeName: {
    fontSize: 12,
    fontWeight: "800",
    color: "#3a4560",
    marginTop: 4,
    textAlign: "center",
  },
  modules: { gap: Spacing.two },
  moduleRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  moduleDot: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  moduleEmoji: { fontSize: 22, color: "#fff", fontWeight: "900" },
  moduleText: { flex: 1 },
  moduleTitle: { fontSize: 16, fontWeight: "800", color: "#1c2742" },
  moduleSub: { fontSize: 12, color: "#7c869c", fontWeight: "600" },
  moduleCheck: { fontSize: 22, color: Brand.success, fontWeight: "900" },
  moduleLock: { fontSize: 20, color: "#c4ccdb" },
  logout: { marginTop: Spacing.five },
  demoNote: {
    textAlign: "center",
    color: "#9aa3b5",
    fontSize: 12,
    marginTop: Spacing.three,
  },
});
