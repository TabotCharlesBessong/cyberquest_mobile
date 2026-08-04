import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Mascot } from "@/components/Mascot";
import { Primary, Secondary, Brand, Spacing } from "@/constants/theme";

type AuthShellProps = {
  title: string;
  subtitle: string;
  mascot: string;
  children: React.ReactNode;
};

export function AuthShell({ title, subtitle, mascot, children }: AuthShellProps) {
  const insets = useSafeAreaInsets();
  // eslint-disable-next-line react-hooks/refs
  const orb1Y = useRef(new Animated.Value(0)).current;
  // eslint-disable-next-line react-hooks/refs
  const orb2Y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(orb1Y, {
          toValue: 1,
          duration: 6000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(orb1Y, {
          toValue: 0,
          duration: 6000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orb2Y, {
          toValue: 1,
          duration: 7000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(orb2Y, {
          toValue: 0,
          duration: 7000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  // eslint-disable-next-line react-hooks/refs
  }, [orb1Y, orb2Y]);

  // eslint-disable-next-line react-hooks/refs
  const orb1Translate = orb1Y.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });

  // eslint-disable-next-line react-hooks/refs
  const orb2Translate = orb2Y.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 30],
  });

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + Spacing.six },
        ]}
        keyboardShouldPersistTaps="always"
      >
        <View style={styles.orbContainer}>
          <Animated.View
            style={[
              styles.orb,
              styles.orbPrimary,
              { transform: [{ translateY: orb1Translate }] },
            ]}
          />
          <Animated.View
            style={[
              styles.orb,
              styles.orbSecondary,
              { transform: [{ translateY: orb2Translate }] },
            ]}
          />
        </View>

        <View style={styles.mascotWrap}>
          <Mascot emoji={mascot} size={96} bounce />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={styles.card}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flex: 1, backgroundColor: Brand.surface },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    alignItems: "center",
  },
  orbContainer: {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    pointerEvents: "none",
  },
  orb: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 9999,
  },
  orbPrimary: {
    top: -100,
    left: -100,
    backgroundColor: Primary.primaryContainer,
    opacity: 0.35,
  },
  orbSecondary: {
    bottom: -100,
    right: -100,
    backgroundColor: Secondary.secondaryContainer,
    opacity: 0.35,
  },
  mascotWrap: {
    position: "absolute",
    top: -20,
    right: -10,
    transform: [{ rotate: "12deg" }],
  },
  header: {
    alignItems: "center",
    gap: Spacing.two,
    marginTop: Spacing.six,
    marginBottom: Spacing.four,
  },
  title: {
    fontFamily: "SplineSans_800ExtraBold",
    fontSize: 48,
    fontWeight: "800",
    color: Primary.primary,
    letterSpacing: -0.02,
    lineHeight: 56,
  },
  subtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    fontWeight: "500",
    color: "#414753",
    textAlign: "center",
  },
  card: {
    width: "100%",
    maxWidth: 448,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.three,
    shadowColor: Brand.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
});
