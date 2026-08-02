# CyberQuest — AI Agent Project Brief

## Main Goal

Improve the design and animation of the CyberQuest app — a gamified kids' cybersecurity education app — to deliver a polished, high-engagement experience with smooth animations, meaningful transitions, and satisfying sound effects. The app currently has basic animations and a simple visual style; the goal is to elevate it to a production-quality, delight-driven gamified experience.

---

## Current State

### App Overview
- **Name**: CyberQuest (display name: "CyberSafe Kids")
- **Purpose**: Kids cybersecurity education through gamified lessons, quests, and a mission map
- **Stack**: React Native / Expo, TypeScript, React Native Reanimated v4.5.0, expo-av for audio, Zustand for state, TanStack Query for data fetching
- **Backend**: Separate Node/Express API (`cyberquest_api`) with PostgreSQL/Sequelize

### Screens & Navigation
- **Root layout** (`src/app/_layout.tsx`): Stack navigator with `slide_from_right` animation, dark/light theme provider
- **Tab layout** (`src/app/(tabs)/_layout.tsx`): 5 tabs — Learn, Shop, Gear, Class, Rewards, Profile; uses `fade` animation between tab screens
- **Bottom tabs** (`src/components/BottomTabs.tsx`): Animated tab bar with scale + opacity transitions on active state
- **Key screens**:
  - `src/app/index.tsx` — Home / Mission Map (connected nodes, XP bar, streak, quests)
  - `src/app/section/[slug].tsx` — Section detail with snake-path lesson layout
  - `src/app/unit/[id].tsx` — Unit detail with vertical lesson list
  - `src/app/lesson.tsx` — Lesson player (story + quiz steps, progress bar, celebration overlay)
  - `src/app/classroom.tsx` / `classroom-play.tsx` — Classroom view
  - `src/app/leaderboard.tsx` — Leaderboard
  - `src/app/badge/[id].tsx` — Badge detail
  - `src/app/avatar-customizer.tsx` — Avatar picker
  - `src/app/onboarding.tsx` — Onboarding flow
  - `src/app/shop.tsx`, `inventory.tsx`, `rewards.tsx`, `profile.tsx` — Tab screens

### Existing Animation Infrastructure
- **Libraries**: `react-native-reanimated` v4.5.0, `react-native-gesture-handler` ~2.32.0, `expo-av` ^16.0.8
- **No Lottie, Moti, Framer Motion, NativeWind, Tamagui, or Unistyles**
- **Current animations** (basic, using React Native `Animated` API):
  - `Celebration.tsx` — Confetti particles with falling + rotating, scale-up card entrance (spring)
  - `Mascot.tsx` — Idle bounce (translateY + scale loop, sin easing)
  - `ProgressBar.tsx` — Width animation from 0 to target (700ms)
  - `BottomTabs.tsx` — Tab icon scale + opacity on active state
  - `HomeScreen` — Pressable scale on press (0.96 spring), node scale animation
  - `splash.tsx` — Splash screen with scale-up badge + fade-out
  - `LessonScreen` — Step entrance (opacity + translateY + translateX shake), shake animation for wrong answers
  - `useLessonPlayer.ts` — Manages `enter` and `shake` animated values, step transitions

### Existing Sound Infrastructure
- `src/utils/sounds.ts` — Loads and plays `success.mp3` and `fail.mp3` via `expo-av`
- Called from `useLessonPlayer.ts` on correct/wrong answers
- No sound for level-up, badge earned, quest claim, or button taps

### Design System
- **Colors**: `Brand` object in `src/constants/theme.ts` — primary (#4D96FF), accent (#9B5DE5), success (#2BC48A), warning (#FFC93C), danger (#FF6B6B), surface (#F4F7FF)
- **Light/dark mode**: Basic support in theme, limited visual differentiation
- **Typography**: Spline Sans / Inter via CSS custom properties in `global.css`, no explicit font scale
- **Components**: Custom-built (no UI library) — `Button.tsx`, `themed-text.tsx`, `themed-view.tsx`, `FormComponents.tsx`
- **Data**: `src/data/modules.ts` — Hardcoded lesson modules with story/quiz steps; `src/data/types.ts` — TypeScript types for User, Progress, LessonStep, ModuleData

### Gaps & Pain Points
- No page transition animations beyond the stack slide
- No shared element transitions between screens
- No Lottie or complex animation library — limited to React Native `Animated` API
- Sound effects are minimal (only success/fail)
- No haptic feedback
- No shimmer/sweep effects on progress bars
- No staggered child animations
- No reduced-motion accessibility support
- Light/dark mode has minimal visual distinction
- No loading skeleton animations
- No micro-interactions on most components

---

## Phases of Implementation

### Phase 1: Animation Foundation & Infrastructure
**Goal**: Set up the animation infrastructure and patterns that all subsequent work depends on.

1. Install and configure `react-native-reanimated` (already installed, v4.5.0 — verify it's fully set up with the New Architecture)
2. Install `expo-screen-transition` or configure custom transition animations for Expo Router
3. Create a reusable animation hook library (`src/hooks/useAnimation.ts`) with:
   - `useEntrance` — staggered fade + slide-up animation
   - `usePressable` — scale + opacity press feedback
   - `useShimmer` — shimmer/sweep animation for loading states
4. Create a `src/components/animations/` directory with reusable animated primitives:
   - `FadeInView` — opacity + translateY entrance
   - `ScaleInView` — scale entrance with overshoot
   - `StaggerContainer` — children stagger animation wrapper
   - `ShimmerBar` — loading skeleton shimmer
5. Add `prefers-reduced-motion` support across all animated components
6. Add haptic feedback (`expo-haptics`) for all press interactions

### Phase 2: Screen Transitions & Navigation Polish
**Goal**: Make every screen transition feel smooth and intentional.

1. Implement custom transition animations for Expo Router stack screens:
   - Forward: slide from right + fade in
   - Back: slide to left + fade out
   - Modal: fade + scale up
2. Add shared element transitions between Home → Section → Unit → Lesson
3. Implement tab switch animations (scale + color transition on the BottomTabs)
4. Add page-level entrance animations to all screens using the Phase 1 hooks
5. Add transition animations for the Celebration overlay (fade in backdrop + scale card)

### Phase 3: Micro-Interactions & Component Polish
**Goal**: Add delightful micro-interactions to every interactive element.

1. **Home screen**:
   - Staggered entrance for stats cards, quest banner, mission nodes
   - Pulse animation on active quest banner
   - Ripple effect on mission map nodes
   - XP bar shimmer on level-up
2. **Section/Unit screens**:
   - Staggered card entrance for lesson lists
   - Lock/unlock transition animation (scale + glow)
   - Snake path connector line draw animation
3. **Lesson player**:
   - Question card flip animation (3D rotateY)
   - Option staggered scale-in (40ms stagger)
   - Correct answer: green glow + scale pulse
   - Wrong answer: red shake + fade (already partially implemented, enhance)
   - Progress bar gradient sweep
4. **BottomTabs**: Enhance with bounce animation on selection
5. **All buttons**: Add press scale + ripple feedback
6. **Loading states**: Replace all loading text with skeleton shimmer screens

### Phase 4: Celebration & Reward Animations
**Goal**: Make every achievement feel impactful and satisfying.

1. Upgrade `Celebration.tsx` with:
   - Particle burst system (configurable count, speed, spread)
   - Badge reveal animation (scale + glow + sparkle)
   - XP counter animation (counting up from 0 to earned value)
   - Level-up animation (screen flash + scale + particles)
2. Add new celebration types:
   - Streak milestone celebration
   - Quest claim celebration
   - Badge earned celebration
   - Section completion celebration
3. Implement screen-wide celebration effects (confetti full-screen overlay)
4. Add emoji reaction animations (floating up from tapped elements)

### Phase 5: Sound Design & Audio Polish
**Goal**: Add a complete, context-aware sound system.

1. Expand `src/utils/sounds.ts` with:
   - `playSuccess()` — already exists, enhance with 3-note ascending chime
   - `playFail()` — already exists, enhance with descending tone
   - `playLevelUp()` — triumphant fanfare
   - `playBadgeEarned()` — ascending arpeggio
   - `playQuestClaim()` — coin collection sound
   - `playButtonTap()` — subtle click
   - `playStreakMilestone()` — rising scale with sparkle
   - `playCelebration()` — celebration fanfare
2. Add sound volume control in settings
3. Add haptic-sound synchronization (sound plays with the animation)
4. Implement sound preloading on app start
5. Add sound for navigation transitions (subtle slide sound)

### Phase 6: Visual Design Elevation
**Goal**: Elevate the visual design to a polished, cohesive, professional look.

1. Refine color system:
   - Add gradient definitions (linear gradients for headers, buttons, progress bars)
   - Add glass-morphism card styles
   - Add subtle background patterns/texture
2. Typography scale:
   - Define explicit heading, body, caption, button text scales
   - Add font loading for custom fonts (Spline Sans)
3. Icon system:
   - Replace emoji-only icons with a proper icon set (e.g., `@expo/vector-icons` or custom SVG)
   - Add icon animation (pulse, bounce on interaction)
4. Dark mode enhancement:
   - Ensure all screens have fully polished dark mode
   - Add subtle color temperature shifts between modes
5. Add custom illustrations or illustration placeholders for empty states
6. Implement smooth theme switching (animated color transitions)

### Phase 7: Advanced Features & Polish
**Goal**: Add advanced gamification features and final polish.

1. **Mascot companion**:
   - Add contextual mascot reactions (celebrate on correct answer, console on wrong)
   - Mascot idle animations (bounce, blink, wave)
   - Mascot progression (unlocks new mascot expressions as user levels up)
2. **Progress visualization**:
   - Animated progress rings (circular progress indicators)
   - Skill tree visualization with connection line animations
   - Streak fire animation (flickering flame effect)
3. **Onboarding flow**:
   - Animated step indicators
   - Slide transitions between onboarding pages
   - Interactive tutorial with highlight animations
4. **Performance optimization**:
   - Ensure all animations run at 60fps
   - Profile and optimize re-renders during animations
   - Add `will-change` hints for animated elements
5. **Accessibility**:
   - Announce animation state changes for screen readers
   - Ensure all animations respect reduced motion
   - Add focus-visible states for keyboard navigation

---

## Key Files Reference

### Core Screens
| Screen | File |
|---|---|
| Home / Mission Map | `src/app/(tabs)/index.tsx` |
| Section Detail | `src/app/section/[slug].tsx` |
| Unit Detail | `src/app/unit/[id].tsx` |
| Lesson Player | `src/app/lesson.tsx` |
| Classroom | `src/app/classroom.tsx` |
| Classroom Play | `src/app/classroom-play.tsx` |
| Leaderboard | `src/app/leaderboard.tsx` |
| Badge Detail | `src/app/badge/[id].tsx` |
| Avatar Customizer | `src/app/avatar-customizer.tsx` |
| Onboarding | `src/app/onboarding.tsx` |
| Shop | `src/app/(tabs)/shop.tsx` |
| Inventory | `src/app/(tabs)/inventory.tsx` |
| Rewards | `src/app/(tabs)/rewards.tsx` |
| Profile | `src/app/(tabs)/profile.tsx` |

### Layout & Navigation
| File | Purpose |
|---|---|
| `src/app/_layout.tsx` | Root layout with theme provider and stack navigator |
| `src/app/(tabs)/_layout.tsx` | Tab layout with bottom tabs |
| `src/components/BottomTabs.tsx` | Animated bottom tab bar |
| `src/lib/navigation.ts` | Safe back navigation helper |

### Animation & Sound
| File | Purpose |
|---|---|
| `src/components/Celebration.tsx` | Confetti celebration overlay |
| `src/components/Mascot.tsx` | Animated mascot character |
| `src/components/ProgressBar.tsx` | Animated progress bar |
| `src/utils/sounds.ts` | Sound loading and playback |
| `src/hooks/useLessonPlayer.ts` | Lesson player state + animations |

### Design System
| File | Purpose |
|---|---|
| `src/constants/theme.ts` | Colors, spacing, fonts, brand tokens |
| `src/global.css` | CSS custom properties for fonts |
| `src/components/themed-text.tsx` | Themed text component |
| `src/components/themed-view.tsx` | Themed view component |
| `src/components/Button.tsx` | Reusable button component |

### Data & Types
| File | Purpose |
|---|---|
| `src/data/types.ts` | TypeScript types (User, LessonStep, ModuleData, etc.) |
| `src/data/modules.ts` | Hardcoded lesson modules for development |
| `src/stores/authStore.ts` | Zustand auth state store |

### Hooks
| File | Purpose |
|---|---|
| `src/hooks/useApiQueries.ts` | Data fetching hooks for curriculum and progress |
| `src/hooks/useHomeData.ts` | Home screen data loading |
| `src/hooks/useLessonPlayer.ts` | Lesson player state management |
| `src/hooks/useProfileData.ts` | Profile screen data |
| `src/hooks/useColorScheme.ts` | Color scheme detection |
| `src/hooks/useTheme.ts` | Theme management |

---

## Constraints

- Must use `react-native-reanimated` for all animations (already installed)
- Must use `expo-av` for all sound (already installed)
- Must maintain compatibility with Expo Router navigation
- Must support both iOS and Android
- Must support light and dark mode
- Must respect `prefers-reduced-motion` accessibility setting
- No new heavy dependencies unless justified (prefer using what's already installed)
- All animations must use native driver where possible for 60fps performance
- Must not break existing functionality or data flow