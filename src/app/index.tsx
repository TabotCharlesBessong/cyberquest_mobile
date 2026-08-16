import { useRouter, usePathname } from "expo-router";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Mascot } from "@/components/Mascot";
import { useCurrentUser, useIsAuthenticated } from "@/hooks/useAuth";
import { Brand, Spacing } from "@/constants/theme";

export default function WelcomeScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const user = useCurrentUser();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    if (pathname !== "/") return;
    if (isAuthenticated && user?.onboarded) {
      router.replace("/(tabs)");
    } else if (isAuthenticated && user && !user.onboarded) {
      router.replace("/onboarding");
    }
  }, [isAuthenticated, user, router, pathname]);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + Spacing.six },
      ]}
    >
      <View style={styles.heroCard}>
        <Mascot emoji="🦸" size={120} />
        <Text style={styles.title}>CyberSafe Kids</Text>
        <Text style={styles.tagline}>
          An edutainment adventure that teaches children aged 6–12 how to stay
          safe from cybercrime.
        </Text>
      </View>

      <View style={styles.features}>
        <Feature emoji="🎮" text="Play fun lessons" />
        <Feature emoji="🏆" text="Earn badges & streaks" />
        <Feature emoji="🛡️" text="Learn real safety skills" />
      </View>

      <View style={styles.actions}>
        <Button
          label="Get Started"
          fullWidth
          onPress={() => router.push("/auth?mode=signup")}
        />
        <Pressable onPress={() => router.push("/auth?mode=login")}>
          <Text style={styles.secondary}>I already have an account</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function Feature({ emoji, text }: { emoji: string; text: string }) {
  return (
    <View style={styles.feature}>
      <Text style={styles.featureEmoji}>{emoji}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Brand.surface },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    alignItems: "center",
    gap: Spacing.five,
  },
  heroCard: {
    alignItems: "center",
    gap: Spacing.three,
    marginTop: Spacing.four,
  },
  title: {
    fontSize: 40,
    fontWeight: "900",
    color: "#1c2742",
    textAlign: "center",
  },
  tagline: {
    fontSize: 17,
    color: "#5b6478",
    textAlign: "center",
    maxWidth: 420,
    lineHeight: 24,
  },
  features: { width: "100%", maxWidth: 420, gap: Spacing.two },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: Spacing.three,
    shadowColor: Brand.shadow,
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },
  featureEmoji: { fontSize: 28 },
  featureText: { fontSize: 17, fontWeight: "700", color: "#2b3552" },
  actions: {
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    gap: Spacing.three,
    marginTop: Spacing.three,
  },
  secondary: { color: Brand.primary, fontSize: 15, fontWeight: "700" },
});
