import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
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
  sunGrow: [6100, 6370], // from the centre of the map until the screen is red
  sunShrink: [6570, 6900], // after a short hold, into a dot in the middle of the screen
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

/**
 * Everything that moves in the intro is a plain Animated.View (opacity, translate, rotate,
 * a clipped height) holding a static SVG. Animating SVG transforms or clip rectangles directly
 * works in browsers but is unreliable on Android, so the SVG itself never animates here.
 */
type Box = { width: number; height: number; k: number };

/** A static SVG of some logo parts, in logo coordinates, at full logo size. */
function Parts({ box, children }: { box: Box; children: React.ReactNode }) {
  return (
    <Svg width={box.width} height={box.height} viewBox={`0 0 ${VW} ${VH}`}>
      {children}
    </Svg>
  );
}

/** A full-size layer whose style is animated. */
function Layer({ style, box, children }: { style: object; box: Box; children: React.ReactNode }) {
  return (
    <Animated.View pointerEvents="none" style={[styles.layer, { width: box.width, height: box.height }, style]}>
      <Parts box={box}>{children}</Parts>
    </Animated.View>
  );
}

/** Reveals its parts upward from logo y = `fromY` (pillars growing from their feet). */
function GrowUp({
  clock,
  box,
  fromY,
  at,
  children,
}: {
  clock: SharedValue<number>;
  box: Box;
  fromY: number;
  at: readonly [number, number];
  children: React.ReactNode;
}) {
  const style = useAnimatedStyle(() => ({ height: fromY * box.k * seg(clock.get(), at[0], at[1]) }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.clip, { top: undefined, bottom: box.height - fromY * box.k, width: box.width }, style]}>
      <View style={{ position: 'absolute', left: 0, bottom: -(box.height - fromY * box.k) }}>
        <Parts box={box}>{children}</Parts>
      </View>
    </Animated.View>
  );
}

/** Reveals its parts downward from logo y = `fromY` (the centre post dropping from the beam). */
function GrowDown({
  clock,
  box,
  fromY,
  length,
  at,
  children,
}: {
  clock: SharedValue<number>;
  box: Box;
  fromY: number;
  length: number;
  at: readonly [number, number];
  children: React.ReactNode;
}) {
  const style = useAnimatedStyle(() => ({ height: length * box.k * seg(clock.get(), at[0], at[1]) }));
  return (
    <Animated.View pointerEvents="none" style={[styles.clip, { top: fromY * box.k, width: box.width }, style]}>
      <View style={{ position: 'absolute', top: -fromY * box.k, left: 0 }}>
        <Parts box={box}>{children}</Parts>
      </View>
    </Animated.View>
  );
}

function Tile({ clock, box, tile }: { clock: SharedValue<number>; box: Box; tile: (typeof TILES)[number] }) {
  const style = useAnimatedStyle(() => {
    const t = seg(clock.get(), T.map + tile.delay, T.map + tile.delay + 620);
    const k = 1 - t;
    return {
      opacity: Math.min(1, t * 3),
      transform: [
        { translateX: tile.dx * k * box.k },
        { translateY: tile.dy * k * box.k },
        { rotate: `${tile.rot * k}deg` },
      ],
    };
  });
  return (
    <Layer box={box} style={[{ transformOrigin: [tile.cx * box.k, tile.cy * box.k, 0] }, style]}>
      <Defs>
        <ClipPath id={tile.id}>
          <Rect x={tile.x} y={tile.y} width={tile.w} height={tile.h} />
        </ClipPath>
      </Defs>
      <G clipPath={`url(#${tile.id})`}>
        <Path d={KOSOVO} fill={INK} fillRule="evenodd" />
      </G>
    </Layer>
  );
}

function Fade({
  clock,
  box,
  at,
  children,
}: {
  clock: SharedValue<number>;
  box: Box;
  at: readonly [number, number];
  children: React.ReactNode;
}) {
  const style = useAnimatedStyle(() => ({ opacity: seg(clock.get(), at[0], at[1]) }));
  return (
    <Layer box={box} style={style}>
      {children}
    </Layer>
  );
}

/** Slides in from (dx, dy) logo units away while fading in. */
function Slide({
  clock,
  box,
  at,
  dx = 0,
  dy = 0,
  children,
}: {
  clock: SharedValue<number>;
  box: Box;
  at: readonly [number, number];
  dx?: number;
  dy?: number;
  children: React.ReactNode;
}) {
  const style = useAnimatedStyle(() => {
    const t = seg(clock.get(), at[0], at[1]);
    return {
      opacity: Math.min(1, t * 3),
      transform: [{ translateX: (1 - t) * dx * box.k }, { translateY: (1 - t) * dy * box.k }],
    };
  });
  return (
    <Layer box={box} style={style}>
      {children}
    </Layer>
  );
}

/** The logo being built on the shared clock. */
function AnimatedMark({ clock, width }: { clock: SharedValue<number>; width: number }) {
  const box: Box = { width, height: (width * VH) / VW, k: width / VW };
  const starAt = (i: number) => [T.stars + i * 70, T.stars + i * 70 + 220] as const;
  return (
    <View style={{ width: box.width, height: box.height }}>
      <Fade clock={clock} box={box} at={[T.leftPillar[0], T.leftPillar[0] + 120]}>
        <Path d={FEET[0]} fill={INK} />
      </Fade>
      <Fade clock={clock} box={box} at={[T.rightPillar[0], T.rightPillar[0] + 120]}>
        <Path d={FEET[1] ?? FEET[0]} fill={INK} />
      </Fade>
      <GrowUp clock={clock} box={box} fromY={FOOT_Y} at={T.leftPillar}>
        <Path d={LEFT_PILLAR} fill={RED} />
      </GrowUp>
      <GrowUp clock={clock} box={box} fromY={FOOT_Y} at={T.rightPillar}>
        <Path d={RIGHT_PILLAR} fill={RED} />
      </GrowUp>
      <Slide clock={clock} box={box} at={T.tie} dx={520}>
        <Path d={TIE} fill={RED} />
      </Slide>
      <GrowDown clock={clock} box={box} fromY={BEAM_Y} length={80} at={T.post}>
        <Path d={POST} fill={RED} />
      </GrowDown>
      <Slide clock={clock} box={box} at={T.beam} dx={-520}>
        {PLAQUES.map((d) => (
          <Path key={d} d={d} fill={CREAM} />
        ))}
        <Path d={BEAM_SOLID} fill={INK} />
      </Slide>
      {STARS.map((d, i) => (
        <Fade key={d} clock={clock} box={box} at={starAt(i)}>
          <Path d={d} fill={CREAM} />
        </Fade>
      ))}
      <Slide clock={clock} box={box} at={T.top} dy={-160}>
        {TOP_BEAM.map((d) => (
          <Path key={d} d={d} fill={RED} />
        ))}
      </Slide>
      {TILES.map((t) => (
        <Tile key={t.id} clock={clock} box={box} tile={t} />
      ))}
    </View>
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
  // While the screen is fully red, the backdrop and logo go and the sun moves to the screen centre,
  // so it shrinks into a dot in the middle, as in the reel, and reveals the app.
  const covered = (T.sunGrow[1] + T.sunShrink[0]) / 2;
  const backdrop = useAnimatedStyle(() => ({ opacity: clock.get() < covered ? 1 : 0 }));
  const toCentre = { x: width / 2 - sunAt.x, y: height / 2 - sunAt.y };
  const sun = useAnimatedStyle(() => {
    const grow = seg(clock.get(), T.sunGrow[0], T.sunGrow[1]);
    const shrink = seg(clock.get(), T.sunShrink[0], T.sunShrink[1]);
    const moved = clock.get() >= covered;
    return {
      transform: [
        { translateX: moved ? toCentre.x : 0 },
        { translateY: moved ? toCentre.y : 0 },
        { scale: grow * (1 - shrink) },
      ],
    };
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
  layer: { position: 'absolute', top: 0, left: 0 },
  clip: { position: 'absolute', left: 0, overflow: 'hidden' },
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
