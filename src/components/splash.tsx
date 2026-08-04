import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
  useAnimatedStyle,
  Easing,
} from "react-native-reanimated";

import { Brand, Secondary, Spacing, Typography } from "@/constants/theme";
import { Mascot } from "@/components/Mascot";

SplashScreen.preventAutoHideAsync();

const LOADING_PHASES = [
  "Initializing Firewalls...",
  "Encrypting Comms...",
  "Syncing Hero Stats...",
  "Loading Hero Data...",
];

export function SplashOverlay() {
  const [visible, setVisible] = useState(true);
  const [phaseIndex, setPhaseIndex] = useState(0);

  const progress = useSharedValue(0);
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(1);
  const spin = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 2, stiffness: 90 });

    spin.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.linear }), -1, false);

    progress.value = withTiming(1, {
      duration: 3000,
      easing: Easing.out(Easing.cubic),
    });

    const phaseTimer = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % LOADING_PHASES.length);
    }, 1500);

    const mainTimer = setTimeout(() => {
      opacity.value = withTiming(0, {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      }, (finished) => {
        if (finished) {
          SplashScreen.hideAsync();
          setVisible(false);
        }
      });
    }, 1400);

    return () => {
      clearTimeout(mainTimer);
      clearInterval(phaseTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const spinStyle = useAnimatedStyle(() => {
    const rotation = spin.value * 360;
    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  const scaleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const opacityStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
    };
  });

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, opacityStyle]}>
      <View style={styles.content}>
        <View style={styles.ringsContainer}>
          <Animated.View style={[styles.ring, styles.ringOuter, spinStyle]} />
          <Animated.View style={[styles.ring, styles.ringInner, spinStyle]} />
          <Animated.View style={[styles.mascotWrap, scaleStyle]}>
            <Mascot emoji="🛡️" size={100} bounce={false} />
          </Animated.View>
        </View>

        <Text style={styles.title}>CyberQuest</Text>
        <Text style={styles.tagline}>Ready your shield, Hero. The digital world awaits.</Text>
      </View>

      <View style={styles.statusBar}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
        <View style={styles.statusRow}>
          <Animated.View style={[styles.syncIcon, spinStyle]}>
            <Text style={styles.syncEmoji}>🔄</Text>
          </Animated.View>
          <Text style={styles.statusText}>{LOADING_PHASES[phaseIndex]}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Brand.primary,
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 1000,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
  },
  ringsContainer: {
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    borderRadius: 9999,
    borderColor: "rgba(255,255,255,0.15)",
  },
  ringOuter: {
    width: 180,
    height: 180,
    borderWidth: 2,
  },
  ringInner: {
    width: 140,
    height: 140,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  mascotWrap: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...Typography.displayHero,
    color: "#fff",
    textAlign: "center",
  },
  tagline: {
    ...Typography.bodyLg,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    maxWidth: 280,
  },
  statusBar: {
    width: "100%",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  progressTrack: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 9999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 9999,
    backgroundColor: Secondary.secondaryContainer,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
  },
  syncIcon: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  syncEmoji: {
    fontSize: 16,
  },
  statusText: {
    ...Typography.labelCaps,
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 0.05,
  },
});
