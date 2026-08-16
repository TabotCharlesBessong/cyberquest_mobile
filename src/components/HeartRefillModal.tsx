import { useState } from "react";
import { Pressable, StyleSheet, Text, View, Modal } from "react-native";
import { Brand, Spacing } from "@/constants/theme";

type HeartRefillModalProps = {
  visible: boolean;
  hearts: number;
  onRefill: (method: "gems" | "ad") => void;
  onDismiss: () => void;
};

const GEM_COST_PER_HEART = 10;
const MAX_HEARTS = 5;

export function HeartRefillModal({
  visible,
  hearts,
  onRefill,
  onDismiss,
}: HeartRefillModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const missingHearts = Math.max(0, MAX_HEARTS - hearts);
  const gemCost = missingHearts * GEM_COST_PER_HEART;
  const isHeartsFull = hearts >= MAX_HEARTS;

  async function handleRefill(method: "gems" | "ad") {
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
          <Text style={styles.title}>
            {isHeartsFull ? "Hearts Full!" : "Need More Hearts?"}
          </Text>
          <Text style={styles.subtitle}>
            {isHeartsFull
              ? "You already have full hearts. Keep playing!"
              : `You have ${hearts}/${MAX_HEARTS} hearts. Choose an option to refill and continue your mission.`}
          </Text>

          <Pressable
            onPress={() => handleRefill("gems")}
            disabled={loading !== null || isHeartsFull}
            style={({ pressed }) => [
              styles.option,
              pressed && !isHeartsFull && { opacity: 0.85 },
              isHeartsFull && styles.optionDisabled,
            ]}
          >
            <Text style={styles.optionEmoji}>💎</Text>
            <View style={styles.optionBody}>
              <Text style={[styles.optionTitle, isHeartsFull && styles.optionTextDisabled]}>
                {isHeartsFull ? "Hearts Full" : `Spend ${gemCost} Gems`}
              </Text>
              <Text style={[styles.optionDesc, isHeartsFull && styles.optionTextDisabled]}>
                {isHeartsFull ? "Max hearts reached" : `Refill ${missingHearts} heart${missingHearts !== 1 ? "s" : ""} → ${MAX_HEARTS}`}
              </Text>
            </View>
            {!isHeartsFull && <Text style={styles.optionArrow}>›</Text>}
          </Pressable>

          <Pressable
            onPress={() => handleRefill("ad")}
            disabled={loading !== null || isHeartsFull}
            style={({ pressed }) => [
              styles.option,
              pressed && !isHeartsFull && { opacity: 0.85 },
              isHeartsFull && styles.optionDisabled,
            ]}
          >
            <Text style={styles.optionEmoji}>📺</Text>
            <View style={styles.optionBody}>
              <Text style={[styles.optionTitle, isHeartsFull && styles.optionTextDisabled]}>
                {isHeartsFull ? "Hearts Full" : "Watch Video Ad"}
              </Text>
              <Text style={[styles.optionDesc, isHeartsFull && styles.optionTextDisabled]}>
                {isHeartsFull ? "Max hearts reached" : "+1 Heart · +5 XP · Free"}
              </Text>
            </View>
            {!isHeartsFull && <Text style={styles.optionArrow}>›</Text>}
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
  optionDisabled: {
    opacity: 0.6,
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
  optionTextDisabled: {
    color: "#c1c6d5",
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
