import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

import { EASE_OUT } from './motion';

import { C, R, S } from '@/theme';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'success' | 'secondary' | 'ghost';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const VARIANTS = {
  primary: { bg: C.red, edge: C.redDark, fg: C.white },
  success: { bg: C.green, edge: C.greenDark, fg: C.white },
  secondary: { bg: C.paper, edge: C.line, fg: C.ink },
  ghost: { bg: 'transparent', edge: 'transparent', fg: C.muted },
} as const;

/** Chunky pill button with a pressed-down edge, used for every primary action. */
export function Button({ label, onPress, variant = 'primary', disabled, style }: ButtonProps) {
  const v = VARIANTS[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: v.bg,
          borderBottomColor: v.edge,
          borderColor: variant === 'secondary' ? C.line : v.bg,
          opacity: disabled ? 0.45 : 1,
          transform: [{ translateY: pressed && !disabled ? 2 : 0 }],
          borderBottomWidth: pressed || variant === 'ghost' ? 2 : 4,
        },
        style,
      ]}>
      <Text style={[styles.buttonText, { color: v.fg }]}>{label}</Text>
    </Pressable>
  );
}

export function ProgressBar({
  value,
  color = C.green,
  height = 10,
  style,
}: {
  value: number;
  color?: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  const reduced = useReducedMotion();
  const width = useSharedValue(pct);
  useEffect(() => {
    width.value = reduced ? pct : withTiming(pct, { duration: 450, easing: EASE_OUT });
  }, [pct, reduced, width]);
  const fill = useAnimatedStyle(() => ({ width: `${width.value}%` }));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}
      style={[styles.track, { height, borderRadius: height }, style]}>
      <Animated.View style={[{ height: '100%', backgroundColor: color, borderRadius: height }, fill]} />
    </View>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <Text style={styles.section}>{children}</Text>;
}

export function Pill({ children, bg = C.goldSoft, fg = '#a8690a' }: { children: ReactNode; bg?: string; fg?: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillText, { color: fg }]}>{children}</Text>
    </View>
  );
}

/** Opens the stroke-order and writing-practice screen for a character. */
export function WriteButton({ char }: { char: string }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/write/[char]', params: { char } })}
      accessibilityRole="button"
      accessibilityLabel={`Si shkruhet ${char}`}
      style={({ pressed }) => [styles.write, pressed && { opacity: 0.8 }]}>
      <Ionicons name="brush" size={16} color={C.ink} />
      <Text style={styles.writeText}>Si shkruhet</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  write: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: C.cream,
    borderRadius: R.pill,
    paddingVertical: 10,
    paddingHorizontal: S.lg,
  },
  writeText: { fontSize: 14.5, fontWeight: '700', color: C.ink },
  button: {
    paddingVertical: 15,
    paddingHorizontal: S.lg,
    borderRadius: R.md,
    borderWidth: 2,
    alignItems: 'center',
  },
  buttonText: { fontSize: 16, fontWeight: '700' },
  track: { backgroundColor: '#e9e0cf', overflow: 'hidden', alignSelf: 'stretch' },
  section: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: C.muted,
    marginTop: S.xl,
    marginBottom: S.md,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: R.pill,
  },
  pillText: { fontSize: 14, fontWeight: '800' },
});
