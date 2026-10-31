import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';

import { BOX, gradeStroke, pointsToPath, strokesFor, type Point, type StrokeGrade } from '@/lib/writing';
import { C, R } from '@/theme';

const INK = C.ink;
const ACTIVE = C.red;

/** The faint cross-shaped guide lines of Japanese writing practice paper. */
function Guides() {
  return (
    <G>
      <Line x1={BOX / 2} y1={2} x2={BOX / 2} y2={BOX - 2} stroke={C.line} strokeWidth={0.6} strokeDasharray="3 3" />
      <Line x1={2} y1={BOX / 2} x2={BOX - 2} y2={BOX / 2} stroke={C.line} strokeWidth={0.6} strokeDasharray="3 3" />
    </G>
  );
}

const strokeProps = { fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/**
 * Animates a character's strokes in order. The screen using it shows one
 * character for its whole life, so `char` is not expected to change.
 * `step` is how many strokes are
 * fully drawn; the next one is drawn progressively while `playing`.
 */
export function useStrokeOrder({ char, size }: { char: string; size: number }) {
  const strokes = strokesFor(char);
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  // Playing ends by itself once every stroke is drawn.
  const playing = autoplay && step < strokes.length;

  useEffect(() => {
    if (!playing) return;
    const duration = Math.max(350, strokes[step].len * 9);
    let frame = 0;
    let begin = 0;
    const tick = (t: number) => {
      begin ||= t;
      const p = Math.min(1, (t - begin) / duration);
      setProgress(p);
      if (p < 1) frame = requestAnimationFrame(tick);
      else
        setTimeout(() => {
          setStep((s) => s + 1);
          setProgress(0);
        }, 180);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, step, strokes]);

  const replay = () => {
    setStep(0);
    setProgress(0);
    setAutoplay(true);
  };
  const go = (to: number) => {
    setAutoplay(false);
    setProgress(0);
    setStep(Math.max(0, Math.min(strokes.length, to)));
  };

  return {
    view: (
      <View style={[styles.paper, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox={`0 0 ${BOX} ${BOX}`}>
          <Guides />
          {strokes.map((s, i) => (
            <Path key={`ghost-${i}`} d={s.d} stroke={C.line} strokeWidth={3} {...strokeProps} />
          ))}
          {strokes.slice(0, step).map((s, i) => (
            <Path key={`done-${i}`} d={s.d} stroke={INK} strokeWidth={3.4} {...strokeProps} />
          ))}
          {step < strokes.length && playing && (
            <Path
              d={strokes[step].d}
              stroke={ACTIVE}
              strokeWidth={3.6}
              strokeDasharray={`${strokes[step].len} ${strokes[step].len}`}
              strokeDashoffset={strokes[step].len * (1 - progress)}
              {...strokeProps}
            />
          )}
          {strokes.slice(0, Math.min(strokes.length, step + (playing ? 1 : 0))).map((s, i) => (
            <SvgText key={`n-${i}`} x={s.label[0]} y={s.label[1]} fontSize={7} fill={i === step ? ACTIVE : C.muted}>
              {i + 1}
            </SvgText>
          ))}
        </Svg>
      </View>
    ),
    step,
    total: strokes.length,
    playing,
    replay,
    prev: () => go(step - 1),
    next: () => go(step + 1),
  };
}

export type PadFeedback = { kind: StrokeGrade | 'done' | 'idle'; stroke: number };

/**
 * A practice square: the learner draws each stroke with a finger. Each stroke
 * is checked against the model (start point, end point, direction); a right
 * stroke stays as ink, a wrong one is wiped and the model stroke is shown.
 */
export function useWritingPad({
  char,
  size,
  showGuide,
  onFeedback,
}: {
  char: string;
  size: number;
  showGuide: boolean;
  onFeedback: (f: PadFeedback) => void;
}) {
  const strokes = useMemo(() => strokesFor(char), [char]);
  const [accepted, setAccepted] = useState<Point[][]>([]);
  const [current, setCurrent] = useState<Point[]>([]);
  const [hint, setHint] = useState(false);
  const live = useRef<Point[]>([]);
  const acceptedRef = useRef<Point[][]>([]);
  const feedbackRef = useRef(onFeedback);
  useEffect(() => {
    feedbackRef.current = onFeedback;
  }, [onFeedback]);

  const reset = useCallback(() => {
    acceptedRef.current = [];
    live.current = [];
    setAccepted([]);
    setCurrent([]);
    setHint(false);
    feedbackRef.current({ kind: 'idle', stroke: 0 });
  }, []);

  const toBox = useCallback(
    (e: GestureResponderEvent): Point => {
      const k = BOX / size;
      const { locationX, locationY } = e.nativeEvent;
      return [Math.round(locationX * k * 10) / 10, Math.round(locationY * k * 10) / 10];
    },
    [size],
  );

  const onGrant = (e: GestureResponderEvent) => {
    live.current = [toBox(e)];
    setCurrent(live.current);
  };
  const onMove = (e: GestureResponderEvent) => {
    const p = toBox(e);
    const last = live.current[live.current.length - 1];
    if (last && Math.hypot(p[0] - last[0], p[1] - last[1]) < 1.2) return;
    live.current = [...live.current, p];
    setCurrent(live.current);
  };
  const onRelease = () => {
    const index = acceptedRef.current.length;
    const model = strokes[index];
    const drawn = live.current;
    live.current = [];
    setCurrent([]);
    if (!model) return;
    const grade = gradeStroke(drawn, model);
    if (grade === 'ok') {
      acceptedRef.current = [...acceptedRef.current, drawn];
      setAccepted(acceptedRef.current);
      setHint(false);
      const done = acceptedRef.current.length === strokes.length;
      feedbackRef.current({ kind: done ? 'done' : 'ok', stroke: index + 1 });
    } else {
      setHint(true);
      feedbackRef.current({ kind: grade, stroke: index + 1 });
    }
  };

  const next = strokes[accepted.length];

  return {
    reset,
    view: (
      <View
        style={[styles.paper, { width: size, height: size }]}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}
        onResponderGrant={onGrant}
        onResponderMove={onMove}
        onResponderRelease={onRelease}>
        <Svg width={size} height={size} viewBox={`0 0 ${BOX} ${BOX}`} pointerEvents="none">
          <Guides />
          {showGuide &&
            strokes.map((s, i) => <Path key={`g-${i}`} d={s.d} stroke={C.guide} strokeWidth={5} {...strokeProps} />)}
          {hint && next && (
            <Path
              d={next.d}
              stroke={ACTIVE}
              strokeOpacity={0.45}
              strokeWidth={4}
              strokeDasharray="4 3"
              {...strokeProps}
            />
          )}
          {accepted.map((pts, i) => (
            <Path key={`a-${i}`} d={pointsToPath(pts)} stroke={INK} strokeWidth={4.5} {...strokeProps} />
          ))}
          {current.length > 0 && <Path d={pointsToPath(current)} stroke={C.muted} strokeWidth={4.5} {...strokeProps} />}
          {next && (showGuide || hint) && <Circle cx={next.start[0]} cy={next.start[1]} r={2.8} fill={ACTIVE} />}
        </Svg>
      </View>
    ),
  };
}

export function strokeMessage(f: PadFeedback, total: number): { text: string; tone: 'ok' | 'bad' | 'muted' } {
  switch (f.kind) {
    case 'idle':
      return { text: `Shkruaj vijën 1 nga ${total}. Pika e kuqe tregon ku fillon.`, tone: 'muted' };
    case 'ok':
      return { text: `Vija ${f.stroke} — saktë! Tani vija ${f.stroke + 1}.`, tone: 'ok' };
    case 'done':
      return { text: 'Bravo! E shkrove të gjithë shenjën me rendin e duhur.', tone: 'ok' };
    case 'reversed':
      return { text: `Vija ${f.stroke} shkon në drejtimin e kundërt. Fillo nga pika e kuqe.`, tone: 'bad' };
    case 'off':
      return { text: `Vija ${f.stroke} nuk përputhet. Ndiq vijën e kuqe me pika.`, tone: 'bad' };
  }
}

const styles = StyleSheet.create({
  paper: {
    backgroundColor: C.paper,
    borderRadius: R.lg,
    borderWidth: 2,
    borderColor: C.line,
    overflow: 'hidden',
    alignSelf: 'center',
  },
});

export const writingStyles = StyleSheet.create({
  message: { fontSize: 14.5, lineHeight: 20, textAlign: 'center', minHeight: 40 },
});

export function Message({ text, tone }: { text: string; tone: 'ok' | 'bad' | 'muted' }) {
  const color = tone === 'ok' ? C.greenText : tone === 'bad' ? C.redText : C.muted;
  return (
    <Text style={[writingStyles.message, { color }]} accessibilityLiveRegion="polite">
      {text}
    </Text>
  );
}
