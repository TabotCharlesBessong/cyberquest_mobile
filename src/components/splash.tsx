import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

import { Brand } from "@/constants/theme";

SplashScreen.preventAutoHideAsync();

export function SplashOverlay() {
  const [visible, setVisible] = useState(true);
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      tension: 90,
      useNativeDriver: true,
    }).start();
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          SplashScreen.hideAsync();
          setVisible(false);
        }
      });
    }, 1400);
    return () => clearTimeout(timer);
  }, [scale, opacity]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity }]}>
      <Animated.View style={[styles.badge, { transform: [{ scale }] }]}>
        <Text style={styles.badgeText}>🛡️</Text>
      </Animated.View>
      <Text style={styles.title}>CyberSafe Kids</Text>
      <Text style={styles.subtitle}>Learn. Play. Stay Safe.</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Brand.primary,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  badge: {
    width: 130,
    height: 130,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  badgeText: { fontSize: 72 },
  title: { color: "#fff", fontSize: 32, fontWeight: "800" },
  subtitle: { color: "rgba(255,255,255,0.85)", fontSize: 16, marginTop: 6 },
});
