import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import {
  BEAM,
  FEET,
  GATE,
  KOSOVO,
  KOSOVO_LENGTH,
  LOGO_VIEWBOX,
  PLAQUES,
  STARS,
  TOP_BEAM,
} from '@/data/logo-paths.generated';
import { C, F, isDark, R } from '@/theme';

import { BRAND_JP } from './brand';
import { EASE_OUT } from './motion';

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

const { width: VW, height: VH } = LOGO_VIEWBOX;
const LOGO_RED = '#E42020';
const LOGO_INK = '#141414';
const LOGO_CREAM = '#F8F0E4';

/**
 * Timeline (ms), as in the reels: the gate is built from the ground up, the
 * stars appear one by one, the map of Kosovo is drawn and filled, then the
 * wordmark settles in and the intro fades into the app (docs/BRAND.md §5).
 */
const T = {
  feet: 0,
  rise: 150, // pillars and tie beam grow upward
  riseMs: 700,
  beam: 750, // black beam opens from the centre
  beamMs: 420,
  stars: 1050,
  starGap: 70,
  top: 1050, // curved top beam
  map: 1300,
  mapMs: 900,
  mapFill: 1950,
  word: 2100,
  jp: 2400,
  out: 3150,
  outMs: 380,
};

const ease = (ms: number) => ({ duration: ms, easing: EASE_OUT });

function useTimeline(delay: number, ms: number) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.set(withDelay(delay, withTiming(1, ease(ms))));
  }, [v, delay, ms]);
  return v;
}

function Star({ d, index }: { d: string; index: number }) {
  const t = useTimeline(T.stars + index * T.starGap, 260);
  const props = useAnimatedProps(() => ({ opacity: t.get() }));
  return <AnimatedPath d={d} fill={LOGO_CREAM} animatedProps={props} />;
}

function Fade({ value, children }: { value: SharedValue<number>; children: React.ReactNode }) {
  const props = useAnimatedProps(() => ({ opacity: value.get() }));
  return <AnimatedG animatedProps={props}>{children}</AnimatedG>;
}

/** The logo being built. Sized by `width`; keeps the logo's aspect ratio. */
function AnimatedMark({ width }: { width: number }) {
  const feet = useTimeline(T.feet, 300);
  const rise = useTimeline(T.rise, T.riseMs);
  const beam = useTimeline(T.beam, T.beamMs);
  const top = useTimeline(T.top, 450);
  const map = useTimeline(T.map, T.mapMs);
  const mapFill = useTimeline(T.mapFill, 400);

  // Pillars + tie beam: a clip rectangle that grows from the feet upward.
  const riseClip = useAnimatedProps(() => {
    const h = VH * rise.get();
    return { y: VH - h, height: h };
  });
  // Black beam (and the cream plaques under it) open from the centre outwards.
  const beamClip = useAnimatedProps(() => {
    const w = VW * beam.get();
    return { x: (VW - w) / 2, width: w };
  });
  const topProps = useAnimatedProps(() => ({ opacity: top.get() }));
  // Kosovo: the outline is drawn first, then the map fills in.
  const mapProps = useAnimatedProps(() => ({
    strokeDashoffset: KOSOVO_LENGTH * (1 - map.get()),
    fillOpacity: mapFill.get(),
  }));

  return (
    <Svg width={width} height={(width * VH) / VW} viewBox={`0 0 ${VW} ${VH}`}>
      <Defs>
        <ClipPath id="rise">
          <AnimatedRect x={0} width={VW} animatedProps={riseClip} />
        </ClipPath>
        <ClipPath id="beam">
          <AnimatedRect y={0} height={VH} animatedProps={beamClip} />
        </ClipPath>
      </Defs>
      <Fade value={feet}>
        {FEET.map((d) => (
          <Path key={d} d={d} fill={LOGO_INK} />
        ))}
      </Fade>
      <G clipPath="url(#beam)">
        {PLAQUES.map((d) => (
          <Path key={d} d={d} fill={LOGO_CREAM} />
        ))}
        {BEAM.map((d) => (
          <Path key={d} d={d} fill={LOGO_INK} fillRule="evenodd" />
        ))}
      </G>
      <G clipPath="url(#rise)">
        {GATE.map((d) => (
          <Path key={d} d={d} fill={LOGO_RED} fillRule="evenodd" />
        ))}
      </G>
      {STARS.map((d, i) => (
        <Star key={d} d={d} index={i} />
      ))}
      <AnimatedG animatedProps={topProps}>
        {TOP_BEAM.map((d) => (
          <Path key={d} d={d} fill={LOGO_RED} />
        ))}
      </AnimatedG>
      <AnimatedPath
        d={KOSOVO}
        fill={LOGO_INK}
        fillRule="evenodd"
        stroke={LOGO_INK}
        strokeWidth={5}
        strokeLinejoin="round"
        strokeDasharray={`${KOSOVO_LENGTH} ${KOSOVO_LENGTH}`}
        animatedProps={mapProps}
      />
    </Svg>
  );
}

/**
 * Plays once each time the app opens, over the first screen: the logo builds
 * itself, SHQIPONISHT and シュチッポン語 settle in, then everything fades into
 * the app. Tap to skip. With "Reduce motion" on it is skipped entirely.
 */
export function LogoIntro() {
  const reduced = useReducedMotion();
  const [done, setDone] = useState(reduced);
  const { width } = useWindowDimensions();
  const out = useSharedValue(1);
  const word = useTimeline(T.word, 500);
  const jp = useTimeline(T.jp, 500);

  useEffect(() => {
    if (reduced) return;
    out.set(
      withDelay(
        T.out,
        withTiming(0, { duration: T.outMs, easing: Easing.out(Easing.quad) }, (fin) => {
          if (fin) scheduleOnRN(setDone, true);
        }),
      ),
    );
  }, [out, reduced]);

  const skip = () =>
    out.set(
      withTiming(0, { duration: 200 }, (fin) => {
        if (fin) scheduleOnRN(setDone, true);
      }),
    );

  const overlay = useAnimatedStyle(() => ({ opacity: out.get() }));
  const wordStyle = useAnimatedStyle(() => ({
    opacity: word.get(),
    transform: [{ translateY: (1 - word.get()) * 10 }],
  }));
  const jpStyle = useAnimatedStyle(() => ({ opacity: jp.get(), transform: [{ translateY: (1 - jp.get()) * 10 }] }));

  if (done) return null;
  const markWidth = Math.min(300, width * 0.68);
  return (
    <Animated.View
      style={[styles.overlay, overlay]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <Pressable style={styles.center} onPress={skip} accessibilityLabel="Kapërce hyrjen">
        <View style={isDark ? styles.tile : undefined}>
          <AnimatedMark width={markWidth} />
        </View>
        <Animated.Text
          style={[styles.word, { fontSize: markWidth * 0.11, letterSpacing: markWidth * 0.025 }, wordStyle]}>
          SHQIPONISHT
        </Animated.Text>
        <Animated.View style={jpStyle}>
          <Text style={[styles.jp, { fontSize: markWidth * 0.07 }]}>{BRAND_JP}</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: C.cream, zIndex: 100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tile: { backgroundColor: LOGO_CREAM, borderRadius: R.lg, padding: 24 },
  word: { fontFamily: F.bold, color: C.ink, marginTop: 18 },
  jp: { fontFamily: F.jp, color: C.red, letterSpacing: 2, marginTop: 2 },
});
