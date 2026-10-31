import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { C } from '@/theme';

/** Strong ease-out used for UI transitions. */
export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

/**
 * Plays a feedback animation on its child whenever `trigger` changes:
 * "shake" for a wrong answer, "pop" for a right one or a selection.
 */
export function Feedback({
  kind,
  trigger,
  style,
  children,
}: {
  kind: 'shake' | 'pop' | null;
  trigger: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();
  const x = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!kind || trigger === 0 || reduced) return;
    if (kind === 'shake') {
      x.value = withSequence(
        withTiming(-9, { duration: 50 }),
        withTiming(9, { duration: 70 }),
        withTiming(-6, { duration: 60 }),
        withTiming(5, { duration: 60 }),
        withTiming(0, { duration: 50 }),
      );
    } else {
      scale.value = withSequence(withTiming(1.06, { duration: 110, easing: EASE_OUT }), withSpring(1, { damping: 9 }));
    }
  }, [kind, trigger, reduced, x, scale]);

  const animated = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }, { scale: scale.value }] }));
  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

/** A gentle, endless "breathing" pulse that draws the eye to the next step. */
export function Pulse({ active, children }: { active: boolean; children: ReactNode }) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!active || reduced) {
      scale.value = 1;
      return;
    }
    scale.value = withRepeat(
      withSequence(withTiming(1.09, { duration: 750, easing: EASE_OUT }), withTiming(1, { duration: 750 })),
      -1,
    );
  }, [active, reduced, scale]);

  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return <Animated.View style={animated}>{children}</Animated.View>;
}

/** Counts a number up from 0 to `value` over `duration` ms. */
export function CountUp({
  value,
  prefix = '',
  duration = 700,
  style,
}: {
  value: number;
  prefix?: string;
  duration?: number;
  style?: StyleProp<TextStyle>;
}) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(reduced ? value : 0);

  useEffect(() => {
    if (reduced) return;
    let frame = 0;
    let start = 0;
    const tick = (t: number) => {
      start ||= t;
      const p = Math.min(1, (t - start) / duration);
      setShown(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration, reduced]);

  return (
    <Text style={style}>
      {prefix}
      {reduced ? value : shown}
    </Text>
  );
}

const CONFETTI_COLORS = [C.red, C.ink, C.gold, '#ff8a8c', C.green, '#f7f1e5'];

type PieceSpec = {
  x: number;
  drift: number;
  delay: number;
  spin: number;
  color: string;
  w: number;
  h: number;
  fall: number;
};

/** Deterministic pseudo-random spread, so the burst looks varied but is stable across renders. */
function makePieces(count: number, width: number): PieceSpec[] {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  return Array.from({ length: count }, (_, i) => ({
    x: rnd() * width,
    drift: (rnd() - 0.5) * 120,
    delay: rnd() * 350,
    spin: (rnd() - 0.5) * 900,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    w: 7 + rnd() * 6,
    h: 10 + rnd() * 8,
    fall: 1500 + rnd() * 900,
  }));
}

function Piece({ spec, height }: { spec: PieceSpec; height: number }) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(spec.delay, withTiming(1, { duration: spec.fall, easing: Easing.out(Easing.quad) }));
  }, [spec, t]);

  const animated = useAnimatedStyle(() => ({
    opacity: t.value < 0.85 ? 1 : (1 - t.value) / 0.15,
    transform: [
      { translateX: spec.x + spec.drift * t.value },
      { translateY: -40 + (height + 80) * t.value },
      { rotate: `${spec.spin * t.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.piece, { width: spec.w, height: spec.h, backgroundColor: spec.color }, animated]} />
  );
}

/**
 * A one-shot burst of confetti in the logo's colours, drawn over the whole
 * screen without catching touches. Skipped when the system asks for reduced motion.
 */
export function Confetti({ count = 46 }: { count?: number }) {
  const reduced = useReducedMotion();
  const { width, height } = useWindowDimensions();
  const pieces = useMemo(() => makePieces(count, width), [count, width]);

  if (reduced) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p, i) => (
        <Piece key={i} spec={p} height={height} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  piece: { position: 'absolute', top: 0, left: 0, borderRadius: 2 },
});
