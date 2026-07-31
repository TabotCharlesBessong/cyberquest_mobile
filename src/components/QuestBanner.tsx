import { StyleSheet, Text, View } from 'react-native';
import { Brand, Spacing } from '@/constants/theme';

type QuestBannerProps = {
  emoji: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  isCompleted: boolean;
  isClaimed: boolean;
  xpReward: number;
  gemsReward: number;
  onClaim?: () => void;
};

export function QuestBanner({
  emoji,
  title,
  description,
  progress,
  target,
  isCompleted,
  isClaimed,
  xpReward,
  gemsReward,
  onClaim,
}: QuestBannerProps) {
  const pct = Math.min(progress / target, 1);

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.rewardRow}>
            <Text style={styles.reward}>⭐ {xpReward}</Text>
            <Text style={styles.reward}>💎 {gemsReward}</Text>
          </View>
        </View>
        <Text style={styles.description} numberOfLines={1}>
          {description}
        </Text>
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${pct * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {progress} / {target}
          </Text>
        </View>
        {isCompleted && !isClaimed && (
          <Pressable onPress={onClaim} style={styles.claimBtn}>
            <Text style={styles.claimText}>Claim Reward</Text>
          </Pressable>
        )}
        {isClaimed && (
          <View style={styles.claimedBadge}>
            <Text style={styles.claimedText}>✓ Claimed</Text>
          </View>
        )}
      </View>
    </View>
  );
}

import { Pressable } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Brand.card,
    borderRadius: 20,
    padding: Spacing.three,
    gap: Spacing.three,
    borderWidth: 2,
    borderColor: '#ffe2c2',
    shadowColor: Brand.shadow,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 32,
  },
  body: {
    flex: 1,
    gap: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1c2742',
  },
  rewardRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  reward: {
    fontSize: 12,
    fontWeight: '800',
    color: '#5b6478',
  },
  description: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7c869c',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#e2e8f4',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Brand.success,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7c869c',
    minWidth: 50,
    textAlign: 'right',
  },
  claimBtn: {
    marginTop: Spacing.two,
    backgroundColor: Brand.success,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  claimText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 13,
  },
  claimedBadge: {
    marginTop: Spacing.two,
    backgroundColor: '#e2e8f4',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  claimedText: {
    color: '#7c869c',
    fontWeight: '800',
    fontSize: 12,
  },
});
