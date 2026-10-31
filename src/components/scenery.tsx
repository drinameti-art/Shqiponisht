import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { C } from '@/theme';

const W = 390;
const H = 440;
const SAKURA = '#f6b8c4';
const SAKURA_DEEP = '#ee95a8';

/** One cherry-blossom flower: five petals around a darker centre. */
function Blossom({ x, y, r, rot = 0 }: { x: number; y: number; r: number; rot?: number }) {
  return (
    <G transform={`translate(${x} ${y}) rotate(${rot})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <Ellipse key={a} cx={0} cy={-r * 0.62} rx={r * 0.42} ry={r * 0.6} fill={SAKURA} transform={`rotate(${a})`} />
      ))}
      <Circle r={r * 0.28} fill={SAKURA_DEEP} />
    </G>
  );
}

/** A petal drifting down and sideways in a slow loop. */
function Petal({
  left,
  delay,
  duration,
  drift,
  size,
}: {
  left: number;
  delay: number;
  duration: number;
  drift: number;
  size: number;
}) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withDelay(delay, withRepeat(withTiming(1, { duration, easing: Easing.linear }), -1)));
  }, [t, delay, duration]);
  const style = useAnimatedStyle(() => ({
    opacity: t.value < 0.08 ? t.value / 0.08 : t.value > 0.85 ? (1 - t.value) / 0.15 : 1,
    transform: [
      { translateY: -20 + t.value * (H * 0.95) },
      { translateX: drift * Math.sin(t.value * Math.PI * 2) + t.value * 30 },
      { rotate: `${t.value * 540}deg` },
    ],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.petal, { left: `${left}%`, width: size, height: size * 0.7, borderRadius: size }, style]}
    />
  );
}

/**
 * The welcome scene, drawn in the logo's colours: a pale dawn sky, a rising
 * red sun, Mt. Fuji, layered hills, a small torii gate and a cherry-blossom
 * branch with falling petals. Motion is skipped when the system asks for
 * reduced motion.
 */
export function Scenery({ height }: { height: number }) {
  const reduced = useReducedMotion();
  const rise = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (!reduced) rise.set(withTiming(1, { duration: 1600, easing: Easing.out(Easing.cubic) }));
  }, [reduced, rise]);

  const sunStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + rise.value * 0.65,
    transform: [{ translateY: (1 - rise.value) * 70 }, { scale: 0.92 + rise.value * 0.08 }],
  }));

  const petals = useMemo(
    () =>
      [8, 22, 37, 51, 64, 78, 90].map((left, i) => ({
        left,
        delay: i * 900,
        duration: 7000 + (i % 3) * 1800,
        drift: 14 + (i % 4) * 6,
        size: 9 + (i % 3) * 3,
      })),
    [],
  );

  // The scene is drawn on a 390×440 canvas and scaled to cover the given height.
  return (
    <View
      style={[styles.wrap, { height }]}
      accessibilityRole="image"
      accessibilityLabel="Mali Fuji, dielli dhe lulet e qershisë">
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMax slice"
        style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#fbd9d3" />
            <Stop offset="0.6" stopColor="#fbe9df" />
            <Stop offset="1" stopColor={C.cream} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={W} height={H} fill="url(#sky)" />
      </Svg>

      <Animated.View style={[styles.sunWrap, sunStyle]}>
        <View style={styles.sunGlow} />
        <View style={styles.sun} />
      </Animated.View>

      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMax slice"
        style={StyleSheet.absoluteFill}>
        {/* far hills */}
        <Path
          d="M0 318 C60 296 110 300 160 312 C220 326 270 300 330 296 C360 294 380 300 390 304 L390 440 L0 440 Z"
          fill="#efc9c2"
        />
        {/* Mt. Fuji with snow cap */}
        <Path d="M38 360 L168 206 C176 197 190 196 198 205 L340 360 Z" fill="#3b3f4d" />
        <Path
          d="M168 206 C176 197 190 196 198 205 L232 245 L220 241 L209 252 L196 240 L184 254 L172 241 L158 252 L150 240 L138 244 Z"
          fill="#fdfaf4"
        />
        {/* near hills */}
        <Path d="M0 352 C70 330 120 342 190 356 C260 370 320 340 390 344 L390 440 L0 440 Z" fill="#d9a49b" />
        <Path d="M0 386 C80 368 150 380 220 392 C290 404 340 384 390 380 L390 440 L0 440 Z" fill="#b5615a" />
        {/* torii gate on the right hill */}
        <G transform="translate(300 318)">
          <Path d="M-34 0 C-12 4 12 4 34 0 L32 6 C10 9 -10 9 -32 6 Z" fill={C.red} />
          <Rect x={-27} y={7} width={54} height={5} fill={C.ink} />
          <Rect x={-22} y={20} width={44} height={4.5} fill={C.red} />
          <Rect x={-21} y={11} width={6} height={56} fill={C.red} />
          <Rect x={15} y={11} width={6} height={56} fill={C.red} />
          <Rect x={-2.5} y={11} width={5} height={10} fill={C.red} />
        </G>
        {/* foreground */}
        <Path d="M0 412 C90 398 180 404 260 414 C320 421 360 414 390 410 L390 440 L0 440 Z" fill={C.cream} />
        {/* cherry branch, top left */}
        <Path
          d="M-10 36 C40 44 80 66 112 98 C130 116 150 126 176 130"
          stroke="#6b4a3f"
          strokeWidth={6}
          fill="none"
          strokeLinecap="round"
        />
        <Path d="M64 58 C70 34 88 22 108 18" stroke="#6b4a3f" strokeWidth={3.5} fill="none" strokeLinecap="round" />
        <Path d="M118 104 C122 86 134 76 150 72" stroke="#6b4a3f" strokeWidth={3} fill="none" strokeLinecap="round" />
        <Blossom x={30} y={30} r={13} rot={10} />
        <Blossom x={70} y={52} r={11} rot={40} />
        <Blossom x={104} y={20} r={12} rot={-20} />
        <Blossom x={96} y={86} r={10} rot={25} />
        <Blossom x={146} y={72} r={11} rot={-10} />
        <Blossom x={170} y={126} r={12} rot={30} />
        <Blossom x={130} y={118} r={8} rot={0} />
      </Svg>

      {!reduced && petals.map((p, i) => <Petal key={i} {...p} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', overflow: 'hidden', backgroundColor: C.cream },
  sunWrap: { position: 'absolute', alignSelf: 'center', bottom: '42%', alignItems: 'center', justifyContent: 'center' },
  sunGlow: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(228,30,32,0.12)',
  },
  sun: { width: 150, height: 150, borderRadius: 75, backgroundColor: C.red },
  petal: { position: 'absolute', top: 0, backgroundColor: SAKURA },
});
