import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import {
  BEAM_SOLID,
  FEET,
  KOSOVO,
  KOSOVO_BOX,
  LEFT_PILLAR,
  LOGO_VIEWBOX,
  PLAQUES,
  POST,
  RIGHT_PILLAR,
  STARS,
  TIE,
  TOP_BEAM,
} from '@/data/logo-paths.generated';
import { C, F, isDark, R } from '@/theme';

import { BRAND_JP } from './brand';

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

const { width: VW, height: VH } = LOGO_VIEWBOX;
const RED = '#E42020';
const INK = '#141414';
const CREAM = '#F8F0E4';
const GREY = '#C9C1B5';
const INK_TEXT = isDark ? '#FFFFFF' : INK;
const FOOT_Y = 622; // bottom of the pillars, where they grow from
const BEAM_Y = 105; // underside of the black beam, where the centre post grows from

/**
 * The opening of the Shqiponisht reels, frame by frame (ms on one clock):
 * the pillars grow from their feet one after the other, the tie beam slides
 * in from the right, the black beam from the left, the centre post drops,
 * the curved top beam comes down, the stars appear one by one, the map of
 * Kosovo is assembled from flying pieces, SHQIPONISHT tumbles in letter by
 * letter, シュチッポン語 is typed in red, the line "Mëso japonisht në shqip"
 * appears, and a red sun grows from the map until it fills the screen, then
 * shrinks away to reveal the app.
 */
const T = {
  leftPillar: [100, 520],
  rightPillar: [300, 720],
  tie: [720, 980],
  beam: [940, 1180],
  post: [1160, 1400],
  top: [1440, 1760],
  stars: 1840, // + 70 ms per star
  map: 2280, // tiles start between +0 and +480 ms, each takes 620 ms
  letters: 3420, // + 55 ms per letter
  jp: 4240, // + 95 ms per character
  tagline: 4980,
  sunGrow: [5700, 6020],
  sunShrink: [6080, 6480],
} as const;
const END = T.sunShrink[1];

const WORD = 'SHQIPONISHT';
const TAGLINE = 'Mëso japonisht në shqip · 日本語';

/** 0 → 1 between `a` and `b` on the clock, with a strong ease-out. */
function seg(clock: number, a: number, b: number): number {
  'worklet';
  const p = Math.min(1, Math.max(0, (clock - a) / (b - a)));
  return 1 - Math.pow(1 - p, 4);
}

/** The map of Kosovo cut into tiles that fly in from around and settle into place. */
const TILES = (() => {
  const [bx, by, bw, bh] = KOSOVO_BOX;
  const cols = 4;
  const rows = 4;
  const tiles = [];
  let seed = 7;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = bx + (c * bw) / cols;
      const y = by + (r * bh) / rows;
      tiles.push({
        id: `t${r}${c}`,
        x: x - 1,
        y: y - 1,
        w: bw / cols + 2,
        h: bh / rows + 2,
        cx: x + bw / cols / 2,
        cy: y + bh / rows / 2,
        dx: (rnd() - 0.5) * 520,
        dy: (rnd() - 0.5) * 460,
        rot: (rnd() - 0.5) * 160,
        delay: Math.round(rnd() * 480),
      });
    }
  }
  return tiles;
})();

function Tile({ clock, tile }: { clock: SharedValue<number>; tile: (typeof TILES)[number] }) {
  const props = useAnimatedProps(() => {
    const t = seg(clock.get(), T.map + tile.delay, T.map + tile.delay + 620);
    const k = 1 - t;
    return {
      opacity: Math.min(1, t * 3),
      transform: `translate(${tile.dx * k} ${tile.dy * k}) rotate(${tile.rot * k} ${tile.cx} ${tile.cy})`,
    };
  });
  return (
    <AnimatedG animatedProps={props}>
      <G clipPath={`url(#${tile.id})`}>
        <Path d={KOSOVO} fill={INK} fillRule="evenodd" />
      </G>
    </AnimatedG>
  );
}

function Star({ clock, d, index }: { clock: SharedValue<number>; d: string; index: number }) {
  const props = useAnimatedProps(() => ({
    opacity: seg(clock.get(), T.stars + index * 70, T.stars + index * 70 + 220),
  }));
  return <AnimatedPath d={d} fill={CREAM} animatedProps={props} />;
}

/** The logo being built on the shared clock. */
function AnimatedMark({ clock, width }: { clock: SharedValue<number>; width: number }) {
  const growLeft = useAnimatedProps(() => {
    const h = (FOOT_Y + 40) * seg(clock.get(), T.leftPillar[0], T.leftPillar[1]);
    return { y: FOOT_Y + 40 - h, height: h };
  });
  const growRight = useAnimatedProps(() => {
    const h = (FOOT_Y + 40) * seg(clock.get(), T.rightPillar[0], T.rightPillar[1]);
    return { y: FOOT_Y + 40 - h, height: h };
  });
  const leftFoot = useAnimatedProps(() => ({ opacity: seg(clock.get(), T.leftPillar[0], T.leftPillar[0] + 120) }));
  const rightFoot = useAnimatedProps(() => ({ opacity: seg(clock.get(), T.rightPillar[0], T.rightPillar[0] + 120) }));
  const tie = useAnimatedProps(() => {
    const t = seg(clock.get(), T.tie[0], T.tie[1]);
    return { opacity: Math.min(1, t * 4), transform: `translate(${(1 - t) * 520} 0)` };
  });
  const beam = useAnimatedProps(() => {
    const t = seg(clock.get(), T.beam[0], T.beam[1]);
    return { opacity: Math.min(1, t * 4), transform: `translate(${(1 - t) * -520} 0)` };
  });
  const post = useAnimatedProps(() => ({ height: 80 * seg(clock.get(), T.post[0], T.post[1]) }));
  const top = useAnimatedProps(() => {
    const t = seg(clock.get(), T.top[0], T.top[1]);
    return { opacity: Math.min(1, t * 3), transform: `translate(0 ${(1 - t) * -160})` };
  });

  return (
    <Svg width={width} height={(width * VH) / VW} viewBox={`0 0 ${VW} ${VH}`} style={{ overflow: 'visible' }}>
      <Defs>
        <ClipPath id="growLeft">
          <AnimatedRect x={0} width={VW} animatedProps={growLeft} />
        </ClipPath>
        <ClipPath id="growRight">
          <AnimatedRect x={0} width={VW} animatedProps={growRight} />
        </ClipPath>
        <ClipPath id="post">
          <AnimatedRect x={0} y={BEAM_Y} width={VW} animatedProps={post} />
        </ClipPath>
        {TILES.map((t) => (
          <ClipPath key={t.id} id={t.id}>
            <Rect x={t.x} y={t.y} width={t.w} height={t.h} />
          </ClipPath>
        ))}
      </Defs>

      <AnimatedPath d={FEET[0]} fill={INK} animatedProps={leftFoot} />
      <AnimatedPath d={FEET[1] ?? FEET[0]} fill={INK} animatedProps={rightFoot} />
      <G clipPath="url(#growLeft)">
        <Path d={LEFT_PILLAR} fill={RED} />
      </G>
      <G clipPath="url(#growRight)">
        <Path d={RIGHT_PILLAR} fill={RED} />
      </G>
      <AnimatedG animatedProps={tie}>
        <Path d={TIE} fill={RED} />
      </AnimatedG>
      <G clipPath="url(#post)">
        <Path d={POST} fill={RED} />
      </G>
      <AnimatedG animatedProps={beam}>
        {PLAQUES.map((d) => (
          <Path key={d} d={d} fill={CREAM} />
        ))}
        <Path d={BEAM_SOLID} fill={INK} />
      </AnimatedG>
      {STARS.map((d, i) => (
        <Star key={d} clock={clock} d={d} index={i} />
      ))}
      <AnimatedG animatedProps={top}>
        {TOP_BEAM.map((d) => (
          <Path key={d} d={d} fill={RED} />
        ))}
      </AnimatedG>
      {TILES.map((t) => (
        <Tile key={t.id} clock={clock} tile={t} />
      ))}
    </Svg>
  );
}

/** One letter of SHQIPONISHT tumbling in: from above-right, turned, grey, then upright and ink. */
function Letter({ clock, ch, index, size }: { clock: SharedValue<number>; ch: string; index: number; size: number }) {
  const style = useAnimatedStyle(() => {
    const a = T.letters + index * 55;
    const t = seg(clock.get(), a, a + 380);
    const ink = seg(clock.get(), a + 200, a + 520);
    return {
      opacity: Math.min(1, t * 2),
      color: interpolateColor(ink, [0, 1], [GREY, INK_TEXT]),
      transform: [
        { translateX: (1 - t) * size * 0.6 },
        { translateY: (1 - t) * -size * 0.8 },
        { rotate: `${(1 - t) * 40}deg` },
      ],
    };
  });
  return (
    <Animated.Text style={[styles.letter, { fontSize: size, letterSpacing: size * 0.18 }, style]}>{ch}</Animated.Text>
  );
}

/** One character of シュチッポン語, typed in. */
function Kana({ clock, ch, index, size }: { clock: SharedValue<number>; ch: string; index: number; size: number }) {
  const style = useAnimatedStyle(() => ({ opacity: seg(clock.get(), T.jp + index * 95, T.jp + index * 95 + 160) }));
  return <Animated.Text style={[styles.jp, { fontSize: size }, style]}>{ch}</Animated.Text>;
}

/**
 * Plays each time the app opens, over the first screen. Tap to jump to the
 * closing red sun. With "Reduce motion" on it is skipped entirely.
 */
export function LogoIntro() {
  const reduced = useReducedMotion();
  const [done, setDone] = useState(reduced);
  const { width, height } = useWindowDimensions();
  const clock = useSharedValue(0);
  const [sunAt, setSunAt] = useState({ x: width / 2, y: height / 2 });

  useEffect(() => {
    if (reduced) return;
    clock.set(
      withTiming(END, { duration: END, easing: Easing.linear }, (fin) => {
        if (fin) scheduleOnRN(setDone, true);
      }),
    );
  }, [clock, reduced]);

  const skip = () => {
    if (clock.get() >= T.sunGrow[0]) return;
    clock.set(T.sunGrow[0]);
    clock.set(
      withTiming(END, { duration: END - T.sunGrow[0], easing: Easing.linear }, (fin) => {
        if (fin) scheduleOnRN(setDone, true);
      }),
    );
  };

  const markWidth = Math.min(300, width * 0.68);
  const markHeight = (markWidth * VH) / VW;
  const letterSize = markWidth * 0.11;
  const diameter = 2.3 * Math.hypot(width, height);

  // The red sun starts at the centre of the map of Kosovo.
  const onMarkLayout = (e: LayoutChangeEvent) => {
    const { x, y } = e.nativeEvent.layout;
    const [bx, by, bw, bh] = KOSOVO_BOX;
    setSunAt({ x: x + ((bx + bw / 2) / VW) * markWidth, y: y + ((by + bh / 2) / VH) * markHeight });
  };

  // The cream backdrop and the logo vanish while the sun covers the screen, so it shrinks onto the app.
  const backdrop = useAnimatedStyle(() => ({ opacity: clock.get() < (T.sunGrow[1] + T.sunShrink[0]) / 2 ? 1 : 0 }));
  const sun = useAnimatedStyle(() => {
    const grow = seg(clock.get(), T.sunGrow[0], T.sunGrow[1]);
    const shrink = seg(clock.get(), T.sunShrink[0], T.sunShrink[1]);
    return { transform: [{ scale: grow * (1 - shrink) }] };
  });
  const tagline = useAnimatedStyle(() => ({
    opacity: seg(clock.get(), T.tagline, T.tagline + 400),
    transform: [{ translateY: (1 - seg(clock.get(), T.tagline, T.tagline + 400)) * 8 }],
  }));

  if (done) return null;
  return (
    <View
      style={styles.overlay}
      pointerEvents="box-none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <Animated.View style={[styles.fill, styles.backdrop, backdrop]}>
        <Pressable style={styles.center} onPress={skip} accessibilityLabel="Kapërce hyrjen">
          <View onLayout={onMarkLayout} style={isDark ? styles.tile : undefined}>
            <AnimatedMark clock={clock} width={markWidth} />
          </View>
          <View style={styles.word}>
            {[...WORD].map((ch, i) => (
              <Letter key={i} clock={clock} ch={ch} index={i} size={letterSize} />
            ))}
          </View>
          <View style={styles.row}>
            {[...BRAND_JP].map((ch, i) => (
              <Kana key={i} clock={clock} ch={ch} index={i} size={markWidth * 0.07} />
            ))}
          </View>
          <Animated.Text style={[styles.tagline, tagline]}>{TAGLINE}</Animated.Text>
        </Pressable>
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.sun,
          {
            width: diameter,
            height: diameter,
            borderRadius: diameter / 2,
            left: sunAt.x - diameter / 2,
            top: sunAt.y - diameter / 2,
          },
          sun,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 },
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  backdrop: { backgroundColor: C.cream },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tile: { backgroundColor: CREAM, borderRadius: R.lg, padding: 24 },
  word: { flexDirection: 'row', marginTop: 18 },
  letter: { fontFamily: F.bold },
  row: { flexDirection: 'row', marginTop: 4 },
  jp: { fontFamily: F.jp, color: C.red, letterSpacing: 2 },
  tagline: { fontFamily: F.regular, fontSize: 12.5, color: C.muted, marginTop: 10 },
  sun: { position: 'absolute', backgroundColor: RED },
});
