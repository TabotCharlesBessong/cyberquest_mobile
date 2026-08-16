import { useState } from "react";
import { Pressable, StyleSheet, Text, View, Modal } from "react-native";
import { Brand, Spacing } from "@/constants/theme";

type HeartRefillModalProps = {
  visible: boolean;
  onRefill: (method: "gems" | "ad" | "rewards") => void;
  onDismiss: () => void;
};

export function HeartRefillModal({
  visible,
  onRefill,
  onDismiss,
}: HeartRefillModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleRefill(method: "gems" | "ad" | "rewards") {
    setLoading(method);
    try {
      onRefill(method);
    } finally {
      setLoading(null);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.emoji}>❤️</Text>
          <Text style={styles.title}>Out of Hearts!</Text>
          <Text style={styles.subtitle}>
            You have no hearts left. Choose an option to refill and continue
            your mission.
          </Text>

          <Pressable
            onPress={() => handleRefill("ad")}
            disabled={loading !== null}
            style={({ pressed }) => [
              styles.option,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.optionEmoji}>📺</Text>
            <View style={styles.optionBody}>
              <Text style={styles.optionTitle}>Watch Video Ad</Text>
              <Text style={styles.optionDesc}>+1 Heart · +5 XP · Free</Text>
            </View>
            <Text style={styles.optionArrow}>›</Text>
          </Pressable>

          <Pressable
            onPress={() => handleRefill("gems")}
            disabled={loading !== null}
            style={({ pressed }) => [
              styles.option,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.optionEmoji}>💎</Text>
            <View style={styles.optionBody}>
              <Text style={styles.optionTitle}>Spend 10 Gems</Text>
              <Text style={styles.optionDesc}>+5 Hearts</Text>
            </View>
            <Text style={styles.optionArrow}>›</Text>
          </Pressable>

          <Pressable
            onPress={() => handleRefill("rewards")}
            disabled={loading !== null}
            style={({ pressed }) => [
              styles.option,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.optionEmoji}>⭐</Text>
            <View style={styles.optionBody}>
              <Text style={styles.optionTitle}>Spend 50 XP</Text>
              <Text style={styles.optionDesc}>+3 Hearts</Text>
            </View>
            <Text style={styles.optionArrow}>›</Text>
          </Pressable>

          <Pressable
            onPress={onDismiss}
            disabled={loading !== null}
            style={styles.dismissBtn}
          >
            <Text style={styles.dismissText}>Maybe Later</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(20, 33, 61, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.four,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: Spacing.five,
    alignItems: "center",
    gap: Spacing.three,
  },
  emoji: { fontSize: 64 },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1c2742",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#5b6478",
    textAlign: "center",
    lineHeight: 22,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#f8f9ff",
    borderRadius: 18,
    padding: Spacing.four,
    gap: Spacing.three,
    borderWidth: 2,
    borderColor: "#e2e8f4",
  },
  optionEmoji: { fontSize: 28 },
  optionBody: { flex: 1 },
  optionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1c2742",
  },
  optionDesc: {
    fontSize: 13,
    fontWeight: "600",
    color: "#7c869c",
    marginTop: 2,
  },
  optionArrow: {
    fontSize: 24,
    fontWeight: "900",
    color: "#7c869c",
  },
  dismissBtn: {
    marginTop: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.five,
  },
  dismissText: {
    color: "#7c869c",
    fontWeight: "800",
    fontSize: 14,
  },
});
