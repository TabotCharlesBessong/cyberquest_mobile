import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text } from 'react-native';

type MascotProps = {
  emoji?: string;
  size?: number;
  bounce?: boolean;
};

export function Mascot({ emoji = '🦸', size = 96, bounce = true }: MascotProps) {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!bounce) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 750,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 750,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [bounce, bounceAnim]);

  const translateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -14],
  });

  const scale = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  return (
    <Animated.View style={{ transform: [{ translateY }, { scale }] }}>
      <Text style={{ fontSize: size, lineHeight: size * 1.2 }}>{emoji}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({});
