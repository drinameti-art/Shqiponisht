import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

import { speakJapanese } from '@/lib/speech';

import { EASE_OUT } from './motion';

import { C, F, R, S } from '@/theme';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'success' | 'secondary' | 'ghost';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const VARIANTS = {
  primary: { bg: C.red, edge: C.redEdge, fg: C.white },
  success: { bg: C.green, edge: C.greenEdge, fg: C.white },
  secondary: { bg: C.paper, edge: C.card, fg: C.ink },
  ghost: { bg: 'transparent', edge: C.card, fg: C.muted },
} as const;

/** The brand CTA: a flat pill (red by default) that presses in slightly. */
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
          backgroundColor: pressed && !disabled && variant !== 'ghost' ? v.edge : v.bg,
          borderColor: variant === 'secondary' ? C.line : 'transparent',
          opacity: disabled ? 0.45 : 1,
          transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
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

export function Pill({
  children,
  bg = C.goldSoft,
  fg = C.goldText,
}: {
  children: ReactNode;
  bg?: string;
  fg?: string;
}) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillText, { color: fg }]}>{children}</Text>
    </View>
  );
}

/** Pronounces Japanese text. `tone="dark"` is for use on the dark detail cards. */
export function SpeakButton({
  text,
  size = 40,
  tone = 'light',
  label = 'Dëgjo',
}: {
  text: string;
  size?: number;
  tone?: 'light' | 'dark';
  label?: string;
}) {
  const [speaking, setSpeaking] = useState(false);
  const dark = tone === 'dark';
  return (
    <Pressable
      onPress={() => {
        setSpeaking(true);
        speakJapanese(text, () => setSpeaking(false));
      }}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${text}`}
      hitSlop={8}
      style={({ pressed }) => [
        styles.speak,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: speaking ? C.red : dark ? 'rgba(255,255,255,0.12)' : C.paper,
          borderColor: speaking ? C.red : dark ? 'transparent' : C.line,
        },
        pressed && { opacity: 0.75 },
      ]}>
      <Ionicons
        name={speaking ? 'volume-high' : 'volume-medium'}
        size={size * 0.5}
        color={speaking ? C.white : dark ? C.onPanel : C.ink}
      />
    </Pressable>
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
  speak: { alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
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
  writeText: { fontSize: 14.5, fontFamily: F.bold, color: C.ink },
  button: {
    paddingVertical: 15,
    paddingHorizontal: S.xl,
    borderRadius: R.pill,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  buttonText: { fontSize: 16, fontFamily: F.semibold, letterSpacing: 0.2 },
  track: { backgroundColor: C.track, overflow: 'hidden', alignSelf: 'stretch' },
  section: {
    fontSize: 12,
    fontFamily: F.bold,
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
  pillText: { fontSize: 14, fontFamily: F.bold },
});
