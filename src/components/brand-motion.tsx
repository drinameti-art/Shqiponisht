import { useEffect, useMemo, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Line, Path, Rect } from 'react-native-svg';

import type { Drawing } from '@/data/drawings';
import { pathLength } from '@/lib/path-length';
import { BOX, strokesFor } from '@/lib/writing';
import { C } from '@/theme';

import { EASE_OUT } from './motion';

/**
 * The brand's motion (docs/BRAND.md §5): calm, one element at a time, a soft
 * fade with a small upward slide, then hold. Everything here runs on the UI
 * thread (Reanimated) and shows its final state at once when the phone's
 * "Reduce motion" setting is on.
 */
export const REVEAL_MS = 420;
/** Gap between elements revealed in sequence. */
export const STEP_MS = 280;

/** Delay for the n-th element of a sequence. */
export const step = (n: number, start = 0, gap = STEP_MS) => start + n * gap;

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** Soft fade-in plus a small upward slide, after `delay` ms. */
export function Reveal({
  delay = 0,
  duration = REVEAL_MS,
  distance = 10,
  style,
  children,
}: {
  delay?: number;
  duration?: number;
  distance?: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();
  const t = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (reduced) return;
    t.set(withDelay(delay, withTiming(1, { duration, easing: EASE_OUT })));
  }, [t, delay, duration, reduced]);
  const anim = useAnimatedStyle(() => ({
    opacity: t.get(),
    transform: [{ translateY: (1 - t.get()) * distance }],
  }));
  return <Animated.View style={[style, anim]}>{children}</Animated.View>;
}

/**
 * Text that fades in light grey and then settles into its color (ink by
 * default, or red), as in the reels.
 */
export function InkText({
  delay = 0,
  color = C.ink,
  style,
  children,
  numberOfLines,
}: {
  delay?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
  children: ReactNode;
  numberOfLines?: number;
}) {
  const reduced = useReducedMotion();
  const appear = useSharedValue(reduced ? 1 : 0);
  const ink = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (reduced) return;
    appear.set(withDelay(delay, withTiming(1, { duration: REVEAL_MS, easing: EASE_OUT })));
    ink.set(withDelay(delay + REVEAL_MS, withTiming(1, { duration: 520, easing: EASE_OUT })));
  }, [appear, ink, delay, reduced]);
  const faint = C.faint;
  const anim = useAnimatedStyle(() => ({
    opacity: appear.get(),
    transform: [{ translateY: (1 - appear.get()) * 10 }],
    color: interpolateColor(ink.get(), [0, 1], [faint, color]),
  }));
  return (
    <Animated.Text style={[style, anim]} numberOfLines={numberOfLines}>
      {children}
    </Animated.Text>
  );
}

/** The → that appears between steps. */
export function Arrow({ delay = 0, style }: { delay?: number; style?: StyleProp<TextStyle> }) {
  return (
    <InkText delay={delay} color={C.red} style={[styles.arrow, style]}>
      →
    </InkText>
  );
}

/** Light 4-square practice grid (a square with a dashed cross), as on Japanese writing paper. */
export function PracticeGrid({ size, children }: { size: number; children?: ReactNode }) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 100 100" style={StyleSheet.absoluteFill}>
        <Rect x={1} y={1} width={98} height={98} rx={6} fill="none" stroke={C.line} strokeWidth={1.2} />
        <Line x1={50} y1={3} x2={50} y2={97} stroke={C.guide} strokeWidth={1} strokeDasharray="4 4" />
        <Line x1={3} y1={50} x2={97} y2={50} stroke={C.guide} strokeWidth={1} strokeDasharray="4 4" />
      </Svg>
      {children}
    </View>
  );
}

function AnimatedStroke({
  d,
  len,
  index,
  progress,
  color,
  width,
  fill,
}: {
  d: string;
  len: number;
  index: number;
  progress: SharedValue<number>;
  color: string;
  width: number;
  /** Optional fill that fades in as the outline closes (colour drops, coins). */
  fill?: string;
}) {
  const props = useAnimatedProps(() => {
    const local = Math.min(1, Math.max(0, progress.get() - index));
    return { strokeDashoffset: len * (1 - local), fillOpacity: Math.max(0, (local - 0.6) / 0.4) };
  });
  return (
    <AnimatedPath
      d={d}
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={fill ?? 'none'}
      strokeDasharray={`${len} ${len}`}
      animatedProps={props}
    />
  );
}

/** Animates a 0..n "stroke counter": each stroke takes time by its length, with a short lift between strokes. */
function useStrokeProgress(lengths: number[], delay: number, msPerUnit: number, replay: unknown) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(reduced ? lengths.length : 0);
  useEffect(() => {
    if (reduced) {
      progress.set(lengths.length);
      return;
    }
    progress.set(0);
    // One timing per stroke, chained with delays; a stroke "lifts" 140 ms before the next.
    let at = delay;
    const timers: ReturnType<typeof setTimeout>[] = [];
    lengths.forEach((len, i) => {
      const ms = Math.max(220, len * msPerUnit);
      timers.push(setTimeout(() => progress.set(withTiming(i + 1, { duration: ms, easing: EASE_OUT })), at));
      at += ms + 140;
    });
    return () => timers.forEach(clearTimeout);
  }, [progress, lengths, delay, msPerUnit, reduced, replay]);
  return progress;
}

/**
 * A kanji or kana written stroke by stroke, like a felt-tip, on the 4-square
 * practice grid. Uses the KanjiVG strokes the writing practice uses; falls
 * back to plain text for characters without stroke data. Change `replay` to
 * write it again.
 */
export function BrushKanji({
  char,
  size = 160,
  delay = 0,
  color = C.ink,
  replay,
  fallback,
}: {
  char: string;
  size?: number;
  delay?: number;
  color?: string;
  replay?: unknown;
  fallback?: ReactNode;
}) {
  const strokes = useMemo(() => strokesFor(char), [char]);
  const lengths = useMemo(() => strokes.map((s) => s.len), [strokes]);
  const progress = useStrokeProgress(lengths, delay, 7, replay);
  const inset = size * 0.08;
  return (
    <PracticeGrid size={size}>
      {strokes.length > 0 ? (
        <Svg
          width={size - inset * 2}
          height={size - inset * 2}
          viewBox={`0 0 ${BOX} ${BOX}`}
          style={{ position: 'absolute', left: inset, top: inset }}>
          {strokes.map((s, i) => (
            <AnimatedStroke key={i} d={s.d} len={s.len} index={i} progress={progress} color={color} width={5.5} />
          ))}
        </Svg>
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.center]}>{fallback}</View>
      )}
    </PracticeGrid>
  );
}

/** A line drawing (flower, rain cloud…) that draws itself line by line. */
export function DrawPath({
  drawing,
  size = 140,
  delay = 0,
  replay,
}: {
  drawing: Drawing;
  size?: number;
  delay?: number;
  replay?: unknown;
}) {
  const lengths = useMemo(() => drawing.paths.map((p) => pathLength(p.d)), [drawing]);
  const progress = useStrokeProgress(lengths, delay, 5, replay);
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {drawing.paths.map((p, i) => (
        <AnimatedStroke
          key={i}
          d={p.d}
          len={lengths[i] + 1}
          index={i}
          progress={progress}
          color={p.accent ? C.red : C.ink}
          width={2.6}
          fill={p.fill}
        />
      ))}
    </Svg>
  );
}

/** The same drawing, still (for lists, where many animations at once would be wasteful). */
export function DrawingIcon({ drawing, size = 40 }: { drawing: Drawing; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityElementsHidden>
      {drawing.paths.map((p, i) => (
        <Path
          key={i}
          d={p.d}
          stroke={p.accent ? C.red : C.ink}
          strokeWidth={size < 60 ? 4.5 : 3}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={p.fill ?? 'none'}
        />
      ))}
    </Svg>
  );
}

const styles = StyleSheet.create({
  arrow: { fontSize: 22, textAlign: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
});
