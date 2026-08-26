import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Brand, Secondary, Surface, Spacing, Rounded, Typography } from "@/constants/theme";
import { formatTime, calculateAccuracy } from "@/lib/lessonStats";

const CONFETTI = ["🎉", "⭐", "💫", "🎊", "✨", "🌟"];

type CelebrationProps = {
  visible: boolean;
  emoji?: string;
  title: string;
  subtitle?: string;
  xp?: number;
  gems?: number;
  badgeName?: string;
  elapsedTime?: number;
  accuracy?: number;
  onContinue: () => void;
};

export function Celebration({
  visible,
  emoji = "🏆",
  title,
  subtitle,
  xp = 30,
  gems = 0,
  badgeName,
  elapsedTime = 0,
  accuracy = 100,
  onContinue,
}: CelebrationProps) {
  const scale = useRef(new Animated.Value(0)).current;
  const [pieces, setPieces] = useState<
    { id: number; left: string; delay: number; emoji: string }[]
  >([]);

  useEffect(() => {
    if (!visible) return;
    Animated.spring(scale, {
      toValue: 1,
      friction: 6,
      tension: 120,
      useNativeDriver: true,
    }).start();
    const next = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: `${5 + Math.random() * 90}%`,
      delay: Math.random() * 500,
      emoji: CONFETTI[i % CONFETTI.length],
    }));
    setPieces(next);
  }, [visible, scale]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      {pieces.map((p) => (
        <FallingPiece
          key={p.id}
          left={p.left}
          delay={p.delay}
          emoji={p.emoji}
        />
      ))}

      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>⏱</Text>
            <Text style={styles.statValue}>{formatTime(elapsedTime)}</Text>
            <Text style={styles.statLabel}>TIME</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🎯</Text>
            <Text style={styles.statValue}>{accuracy}%</Text>
            <Text style={styles.statLabel}>ACCURACY</Text>
          </View>
        </View>

          <View style={styles.chips}>
          <View style={styles.chip}>
            <Text style={styles.chipValue}>+{xp}</Text>
            <Text style={styles.chipLabel}>XP</Text>
          </View>
          {gems > 0 ? (
            <View style={[styles.chip, { backgroundColor: Brand.warning }]}>
              <Text style={styles.chipValue}>+{gems}</Text>
              <Text style={styles.chipLabel}>GEMS</Text>
            </View>
          ) : null}
          {badgeName ? (
            <View style={[styles.chip, { backgroundColor: Brand.warning }]}>
              <Text style={styles.chipValue}>{badgeName}</Text>
              <Text style={styles.chipLabel}>BADGE</Text>
            </View>
          ) : null}
        </View>
        <Pressable style={styles.button} onPress={onContinue}>
          <Text style={styles.buttonText}>Continue</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

function FallingPiece({
  left,
  delay,
  emoji,
}: {
  left: string;
  delay: number;
  emoji: string;
}) {
  const translateY = useRef(new Animated.Value(-40)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 700,
            duration: 2200,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: 360,
            duration: 2200,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(translateY, {
          toValue: -40,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [delay, translateY, rotate]);

  return (
    <Animated.Text
      style={[
        styles.piece,
        {
          left: left as `${number}%`,
          transform: [
            { translateY },
            {
              rotate: rotate.interpolate({
                inputRange: [0, 360],
                outputRange: ["0deg", "360deg"],
              }),
            },
          ],
        },
      ]}
    >
      {emoji}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(20, 33, 61, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 10,
  },
  emoji: { fontSize: 80, marginBottom: 8 },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1c2742",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#5b6478",
    textAlign: "center",
    marginTop: 8,
  },
  statsBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.four,
    marginTop: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    backgroundColor: Surface.surfaceContainerLow,
    borderRadius: Rounded.lg,
    width: "100%",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: Spacing.half,
  },
  statIcon: { fontSize: 20 },
  statValue: {
    fontSize: 18,
    fontWeight: "900",
    color: Surface.onSurface,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: Surface.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Surface.outlineVariant,
  },
  chips: { flexDirection: "row", gap: 12, marginTop: Spacing.three },
  chip: {
    backgroundColor: Brand.success,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: "center",
    minWidth: 84,
  },
  chipValue: { color: "#fff", fontSize: 20, fontWeight: "800" },
  chipLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  button: {
    marginTop: Spacing.three,
    backgroundColor: Brand.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 40,
    width: "100%",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  piece: {
    position: "absolute",
    top: 0,
    fontSize: 22,
  },
});
