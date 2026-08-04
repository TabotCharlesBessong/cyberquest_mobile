import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCurrentUser, useUserName } from '@/hooks/useAuth';
import { useMyProgress } from '@/hooks/useApiQueries';
import { Primary, Secondary, Brand, Spacing } from '@/constants/theme';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const CHART_DATA = [45, 70, 30, 90, 55, 20, 10];

const SKILLS_MASTERED = [
  { name: 'Phishing Detection', status: 'Certified 2 days ago', done: true },
  { name: 'Password Hygiene', status: 'Certified 1 week ago', done: true },
  { name: 'Digital Privacy', status: '75% Complete', done: false },
  { name: 'Social Engineering', status: 'Next Module', done: false },
];

export default function ParentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useCurrentUser();
  const name = useUserName();
  const [confirmed, setConfirmed] = useState<string[]>([]);
  const [timeLimit, setTimeLimit] = useState(60);
  const [emailReports, setEmailReports] = useState(true);
  const [restrictChat, setRestrictChat] = useState(false);

  const progressQuery = useMyProgress();
  const progress = (progressQuery.data?.data as { user: { xp: number; level: number; streak: number; gems: number } } | undefined);

  if (!user) {
    router.replace('/');
    return null;
  }

  function toggleHabit(habit: string) {
    setConfirmed((prev) =>
      prev.includes(habit) ? prev.filter((h) => h !== habit) : [...prev, habit]
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: Brand.surface }]}>
      <View style={[styles.orbContainer, { paddingTop: insets.top }]}>
        <Animated.View style={[styles.orb, styles.orbPrimary]} />
        <Animated.View style={[styles.orb, styles.orbSecondary]} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="always"
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.guardianLabel}>Guardian Portal</Text>
            <Text style={styles.title}>{name}&apos;s Progress</Text>
          </View>
          <View style={styles.dateChip}>
            <Text style={styles.dateText}>Oct 12 - Oct 18, 2023</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>PROGRESS SUMMARY</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{progress?.user?.level ?? user.level ?? 1}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{progress?.user?.xp ?? user.xp}</Text>
              <Text style={styles.statLabel}>XP</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{progress?.user?.streak ?? user.streak}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{progress?.user?.gems ?? user.gems}</Text>
              <Text style={styles.statLabel}>Gems</Text>
            </View>
          </View>
        </View>

        <View style={styles.bentoGrid}>
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.cardTitle}>Weekly Activity</Text>
              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: Primary.primary }]} />
                  <Text style={styles.legendText}>Quests</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: Secondary.secondary }]} />
                  <Text style={styles.legendText}>Review</Text>
                </View>
              </View>
            </View>
            <View style={styles.chartBody}>
              {DAYS.map((day, i) => (
                <View key={day} style={styles.barCol}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${CHART_DATA[i]}%`,
                          backgroundColor:
                            i === 3 ? Secondary.secondary : Primary.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{day}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.skillsCard}>
            <Text style={styles.cardTitle}>Skills Mastered</Text>
            <View style={styles.skillsList}>
              {SKILLS_MASTERED.map((skill) => (
                <View key={skill.name} style={styles.skillRow}>
                  <View
                    style={[
                      styles.skillIcon,
                      skill.done && { backgroundColor: Primary.primaryFixed },
                    ]}
                  >
                    <Text style={styles.skillIconText}>
                      {skill.done ? '✓' : '○'}
                    </Text>
                  </View>
                  <View style={styles.skillInfo}>
                    <Text
                      style={[
                        styles.skillName,
                        !skill.done && { opacity: 0.6 },
                      ]}
                    >
                      {skill.name}
                    </Text>
                    <Text style={styles.skillMeta}>{skill.status}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.controlsCard}>
            <Text style={styles.cardTitle}>Parental Controls</Text>
            <View style={styles.controlBlock}>
              <View style={styles.controlHeader}>
                <View>
                  <Text style={styles.controlTitle}>Daily Time Limit</Text>
                  <Text style={styles.controlSub}>
                    Max usage allowed per day
                  </Text>
                </View>
                <Text style={styles.timeDisplay}>
                  {timeLimit >= 60
                    ? `${Math.floor(timeLimit / 60)}h ${
                        timeLimit % 60 ? `${timeLimit % 60}m` : ''
                      }`
                    : `${timeLimit} min`}
                </Text>
              </View>

              <Slider
                value={timeLimit}
                onValueChange={setTimeLimit}
                min={15}
                max={180}
                step={15}
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>15m</Text>
                <Text style={styles.sliderLabel}>3h</Text>
              </View>
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleIcon}>📧</Text>
                <View>
                  <Text style={styles.toggleTitle}>Email Weekly Reports</Text>
                  <Text style={styles.toggleSub}>
                    Detailed breakdown of learning gaps
                  </Text>
                </View>
              </View>
              <Toggle
                value={emailReports}
                onValueChange={setEmailReports}
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleIcon}>🚫</Text>
                <View>
                  <Text style={styles.toggleTitle}>Restrict Chat Features</Text>
                  <Text style={styles.toggleSub}>
                    Disable peer-to-peer interaction
                  </Text>
                </View>
              </View>
              <Toggle
                value={restrictChat}
                onValueChange={setRestrictChat}
              />
            </View>
          </View>

          <View style={styles.reportCard}>
            <View style={styles.reportImagePlaceholder}>
              <View style={styles.reportBadge}>
                <Text style={styles.reportBadgeText}>New Report</Text>
              </View>
            </View>
            <View style={styles.reportBody}>
              <Text style={styles.cardTitle}>Detailed Security Report</Text>
              <Text style={styles.reportText}>
                {name} correctly identified 9/10 phishing attempts this week.
                Great improvement in recognizing &apos;Urgent&apos; subject
                lines.
              </Text>
              <View style={styles.reportActions}>
                <Pressable style={styles.reportPrimaryBtn}>
                  <Text style={styles.reportPrimaryText}>Download Full PDF</Text>
                </Pressable>
                <Pressable style={styles.reportSecondaryBtn}>
                  <Text style={styles.reportSecondaryText}>
                    View All Reports
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>HABIT CHECK-IN</Text>
        <View style={styles.habitList}>
          {['Used strong passwords', 'Asked before clicking links', 'Blocked a cyberbully', 'Kept info private'].map(
            (habit) => {
              const checked = confirmed.includes(habit);
              return (
                <Pressable
                  key={habit}
                  onPress={() => toggleHabit(habit)}
                  style={[styles.habitRow, checked && styles.habitRowChecked]}
                >
                  <Text style={styles.habitCheck}>{checked ? '✅' : '⬜'}</Text>
                  <Text style={[styles.habitText, checked && styles.habitTextChecked]}>
                    {habit}
                  </Text>
                </Pressable>
              );
            }
          )}
        </View>

        <Text style={styles.sectionLabel}>SAFETY TIPS FOR PARENTS</Text>
        <View style={styles.tips}>
          <Tip emoji="🛡️" text="Keep the computer in a common area" />
          <Tip emoji="🔒" text="Use parental controls on devices" />
          <Tip emoji="🗣️" text="Talk openly about online experiences" />
          <Tip emoji="⏰" text="Set screen-time limits together" />
        </View>

        <View style={styles.tipCard}>
          <View style={styles.tipIconWrap}>
            <Text style={styles.tipIcon}>💡</Text>
          </View>
          <View style={styles.tipBody}>
            <Text style={styles.tipTitle}>Guardian Tip: MFA Training</Text>
            <Text style={styles.tipText}>
              {name} hasn&apos;t started the Multi-Factor Authentication (MFA)
              quest yet. Suggesting this quest could boost their account
              security score by 25%.
            </Text>
          </View>
          <Pressable style={styles.tipBtn}>
            <Text style={styles.tipBtnText}>Assign Quest</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function Tip({ emoji, text }: { emoji: string; text: string }) {
  return (
    <View style={styles.tip}>
      <Text style={styles.tipEmoji}>{emoji}</Text>
      <Text style={styles.tipText}>{text}</Text>
    </View>
  );
}

function Slider({
  value,
  onValueChange,
  min,
  max,
  step,
}: {
  value: number;
  onValueChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  const trackWidth = 280;
  const thumbSize = 24;
  const maxLeft = trackWidth - thumbSize;

  const left = ((value - min) / (max - min)) * maxLeft;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      const newLeft = Math.max(0, Math.min(maxLeft, gestureState.moveX - 20));
      const ratio = newLeft / maxLeft;
      const raw = min + ratio * (max - min);
      const stepped = Math.round(raw / step) * step;
      const clamped = Math.max(min, Math.min(max, stepped));
      onValueChange(clamped);
    },
    onPanResponderRelease: () => {},
  });

  return (
    <View style={styles.sliderTrackWrap}>
      <View style={styles.sliderTrack}>
        <View
          style={[
            styles.sliderFill,
            { width: `${((value - min) / (max - min)) * 100}%` },
          ]}
        />
      </View>
      <View
        style={[styles.sliderThumb, { left }]}
        {...panResponder.panHandlers}
      />
    </View>
  );
}

function Toggle({
  value,
  onValueChange,
}: {
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      style={[styles.toggleTrack, value && styles.toggleTrackActive]}
    >
      <View style={[styles.toggleThumb, value && styles.toggleThumbActive]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  orbContainer: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  orb: {
    position: 'absolute',
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
  scroll: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  header: {
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  guardianLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    fontWeight: '700',
    color: Primary.primary,
    letterSpacing: 0.05,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontFamily: 'SplineSans_800ExtraBold',
    fontSize: 28,
    fontWeight: '800',
    color: '#1c2742',
    letterSpacing: -0.02,
    lineHeight: 34,
  },
  dateChip: {
    backgroundColor: 'rgba(240,244,251,0.8)',
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(193,198,213,0.4)',
  },
  dateText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    fontWeight: '500',
    color: '#414753',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: Brand.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 8,
  },
  cardLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    fontWeight: '700',
    color: Primary.primary,
    letterSpacing: 0.05,
    marginBottom: Spacing.one,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F4F7FF',
    borderRadius: 16,
    padding: Spacing.three,
    alignItems: 'center',
    gap: Spacing.one,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  statValue: {
    fontFamily: 'SplineSans_800ExtraBold',
    fontSize: 24,
    fontWeight: '800',
    color: Primary.primary,
  },
  statLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    fontWeight: '700',
    color: '#727784',
    letterSpacing: 0.05,
  },
  bentoGrid: {
    gap: Spacing.three,
  },
  chartCard: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: Brand.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 8,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: 'SplineSans_700Bold',
    fontSize: 18,
    fontWeight: '700',
    color: '#1c2742',
  },
  legend: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    fontWeight: '700',
    color: '#727784',
    letterSpacing: 0.05,
  },
  chartBody: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 180,
    gap: 8,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  barTrack: {
    flex: 1,
    width: '100%',
    backgroundColor: '#E5E8F0',
    borderRadius: 9999,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 9999,
  },
  barLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    fontWeight: '700',
    color: '#727784',
    letterSpacing: 0.05,
  },
  skillsCard: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: Brand.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 8,
  },
  skillsList: {
    gap: Spacing.two,
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    backgroundColor: '#F4F7FF',
    borderRadius: 16,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(193,198,213,0.2)',
  },
  skillIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillIconText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#7c869c',
  },
  skillInfo: {
    flex: 1,
  },
  skillName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    fontWeight: '700',
    color: '#1c2742',
  },
  skillMeta: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    fontWeight: '700',
    color: '#727784',
    letterSpacing: 0.05,
    marginTop: 2,
  },
  controlsCard: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: Brand.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 8,
  },
  controlBlock: {
    backgroundColor: 'rgba(77,150,255,0.06)',
    borderRadius: 16,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(77,150,255,0.1)',
    gap: Spacing.three,
  },
  controlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  controlTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    fontWeight: '700',
    color: Primary.primary,
  },
  controlSub: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    fontWeight: '700',
    color: '#414753',
    letterSpacing: 0.05,
    marginTop: 2,
  },
  timeDisplay: {
    fontFamily: 'SplineSans_700Bold',
    fontSize: 20,
    fontWeight: '700',
    color: Primary.primary,
  },
  sliderTrackWrap: {
    height: 40,
    justifyContent: 'center',
  },
  sliderTrack: {
    height: 8,
    backgroundColor: Primary.primaryFixed,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: Primary.primary,
    borderRadius: 9999,
  },
  sliderThumb: {
    position: 'absolute',
    top: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Primary.primary,
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: Primary.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    fontWeight: '700',
    color: '#727784',
    letterSpacing: 0.05,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: 16,
    backgroundColor: '#F4F7FF',
    borderWidth: 1,
    borderColor: 'rgba(193,198,213,0.2)',
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    flex: 1,
  },
  toggleIcon: {
    fontSize: 20,
  },
  toggleTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    fontWeight: '700',
    color: '#1c2742',
  },
  toggleSub: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    fontWeight: '700',
    color: '#727784',
    letterSpacing: 0.05,
    marginTop: 2,
  },
  toggleTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E8F0',
    padding: 2,
    justifyContent: 'center',
  },
  toggleTrackActive: {
    backgroundColor: Primary.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(193,198,213,0.2)',
    shadowColor: Brand.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 8,
  },
  reportImagePlaceholder: {
    height: 180,
    backgroundColor: '#E5E8F0',
    justifyContent: 'flex-end',
    padding: Spacing.three,
  },
  reportBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Primary.primary,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  reportBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.05,
  },
  reportBody: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  reportText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    fontWeight: '400',
    color: '#414753',
    lineHeight: 20,
  },
  reportActions: {
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  reportPrimaryBtn: {
    backgroundColor: Primary.primary,
    borderRadius: 9999,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: Brand.primaryDark,
  },
  reportPrimaryText: {
    fontFamily: 'SplineSans_700Bold',
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  reportSecondaryBtn: {
    borderWidth: 2,
    borderColor: Primary.primary,
    borderRadius: 9999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  reportSecondaryText: {
    fontFamily: 'SplineSans_700Bold',
    fontSize: 16,
    fontWeight: '700',
    color: Primary.primary,
  },
  sectionLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    fontWeight: '700',
    color: Primary.primary,
    letterSpacing: 0.05,
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
    marginLeft: 4,
  },
  habitList: { gap: Spacing.two },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: Spacing.three,
    borderWidth: 2,
    borderColor: '#e2e8f4',
  },
  habitRowChecked: { borderColor: Brand.success, backgroundColor: '#f0fff7' },
  habitCheck: { fontSize: 20 },
  habitText: { flex: 1, fontSize: 15, fontWeight: '700', color: '#2b3552' },
  habitTextChecked: { color: '#1f7a50' },
  tips: { gap: Spacing.two },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: Spacing.three,
    borderWidth: 2,
    borderColor: '#e2e8f4',
  },
  tipEmoji: { fontSize: 22 },
  tipText: { fontSize: 15, fontWeight: '700', color: '#2b3552', flex: 1 },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    backgroundColor: '#FFF8E1',
    borderRadius: 20,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(189,144,0,0.2)',
  },
  tipIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipIcon: {
    fontSize: 24,
  },
  tipBody: {
    flex: 1,
  },
  tipTitle: {
    fontFamily: 'SplineSans_700Bold',
    fontSize: 16,
    fontWeight: '700',
    color: '#3D2D00',
    marginBottom: 4,
  },
  tipBtn: {
    backgroundColor: Secondary.secondaryContainer,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 9999,
  },
  tipBtnText: {
    fontFamily: 'SplineSans_700Bold',
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});
