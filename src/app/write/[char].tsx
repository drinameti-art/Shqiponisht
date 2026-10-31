import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { Message, strokeMessage, useStrokeOrder, useWritingPad, type PadFeedback } from '@/components/writing';
import { KANA } from '@/data/kana';
import { KANJI } from '@/data/kanji';
import { useProgress } from '@/lib/progress-context';
import { hasStrokes } from '@/lib/writing';
import { C, R, S } from '@/theme';

/** What to show under the character: its reading (kana) or meaning (kanji). */
function describe(char: string): string {
  const kana = KANA.find((k) => k.hiragana === char || k.katakana === char);
  if (kana) return `lexohet „${kana.sq}“`;
  const kanji = KANJI.find((k) => k.char === char);
  if (kanji) return kanji.meaning;
  return '';
}

export default function WriteScreen() {
  const { char = '' } = useLocalSearchParams<{ char: string }>();
  const { width } = useWindowDimensions();
  const { sfx } = useProgress();
  const size = Math.min(width - S.xl * 2, 320);
  const [mode, setMode] = useState<'watch' | 'practice'>('watch');
  const [guide, setGuide] = useState(true);
  const [feedback, setFeedback] = useState<PadFeedback>({ kind: 'idle', stroke: 0 });

  const order = useStrokeOrder({ char, size });
  const pad = useWritingPad({
    char,
    size,
    showGuide: guide,
    onFeedback: (f) => {
      setFeedback(f);
      if (f.kind === 'ok') sfx('stroke');
      else if (f.kind === 'done') sfx('complete');
      else if (f.kind === 'reversed' || f.kind === 'off') sfx('wrong');
      if (Platform.OS !== 'web' && f.kind !== 'idle') {
        void Haptics.notificationAsync(
          f.kind === 'ok' || f.kind === 'done'
            ? Haptics.NotificationFeedbackType.Success
            : Haptics.NotificationFeedbackType.Warning,
        );
      }
    },
  });

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (!hasStrokes(char)) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.title}>Nuk kemi të dhëna për „{char}“.</Text>
          <Button label="Kthehu" onPress={close} style={{ marginTop: S.lg, alignSelf: 'stretch' }} />
        </View>
      </SafeAreaView>
    );
  }

  const msg = strokeMessage(feedback, order.total);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Mbyll" hitSlop={12}>
          <Ionicons name="close" size={26} color={C.muted} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Si shkruhet {char}</Text>
          <Text style={styles.sub}>
            {describe(char)} · {order.total} {order.total === 1 ? 'vijë' : 'vija'}
          </Text>
        </View>
      </View>

      <View style={styles.seg} accessibilityRole="tablist">
        {(
          [
            ['watch', 'Shiko rendin'],
            ['practice', 'Provo vetë'],
          ] as const
        ).map(([m, label]) => (
          <Pressable
            key={m}
            onPress={() => setMode(m)}
            accessibilityRole="tab"
            accessibilityState={{ selected: mode === m }}
            style={[styles.segBtn, mode === m && styles.segOn]}>
            <Text style={[styles.segText, mode === m && { color: C.white }]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.body} scrollEnabled={mode === 'watch'}>
        {mode === 'watch' ? (
          <>
            {order.view}
            <Text style={styles.counter}>
              Vija {Math.min(order.step + (order.playing ? 1 : 0), order.total)} nga {order.total}
            </Text>
            <View style={styles.controls}>
              <RoundButton icon="play-back" label="Vija e mëparshme" onPress={order.prev} />
              <RoundButton icon="refresh" label="Luaj sërish" onPress={order.replay} big />
              <RoundButton icon="play-forward" label="Vija tjetër" onPress={order.next} />
            </View>
            <Text style={styles.tip}>
              Rregullat bazë: nga lart poshtë, nga e majta në të djathtë; vijat horizontale zakonisht para atyre
              vertikale.
            </Text>
            <Button label="Provo ta shkruash" onPress={() => setMode('practice')} style={{ marginTop: S.lg }} />
          </>
        ) : (
          <>
            {pad.view}
            <Message {...msg} />
            <View style={styles.row}>
              <Button label="Fshi" variant="secondary" onPress={pad.reset} style={{ flex: 1 }} />
              <Button
                label={guide ? 'Fshih modelin' : 'Shfaq modelin'}
                variant="secondary"
                onPress={() => setGuide((g) => !g)}
                style={{ flex: 1 }}
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function RoundButton(props: {
  icon: 'play-back' | 'refresh' | 'play-forward';
  label: string;
  onPress: () => void;
  big?: boolean;
}) {
  const size = props.big ? 56 : 44;
  return (
    <Pressable
      onPress={props.onPress}
      accessibilityRole="button"
      accessibilityLabel={props.label}
      style={({ pressed }) => [
        styles.round,
        { width: size, height: size, borderRadius: size / 2 },
        props.big && { backgroundColor: C.red, borderColor: C.red },
        pressed && { opacity: 0.7 },
      ]}>
      <Ionicons name={props.icon} size={props.big ? 26 : 20} color={props.big ? C.white : C.ink} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.cream },
  top: { flexDirection: 'row', alignItems: 'center', gap: S.md, paddingHorizontal: S.xl, paddingTop: S.md },
  title: { fontSize: 22, fontWeight: '800', color: C.ink },
  sub: { fontSize: 14, color: C.muted },
  seg: {
    flexDirection: 'row',
    backgroundColor: C.card,
    borderRadius: R.pill,
    padding: 3,
    marginHorizontal: S.xl,
    marginTop: S.lg,
    alignSelf: 'stretch',
    maxWidth: 420,
  },
  segBtn: { flex: 1, paddingVertical: 9, borderRadius: R.pill, alignItems: 'center' },
  segOn: { backgroundColor: C.ink },
  segText: { fontSize: 14, fontWeight: '700', color: C.muted },
  body: { padding: S.xl, gap: S.md, maxWidth: 520, width: '100%', alignSelf: 'center' },
  counter: { textAlign: 'center', fontSize: 14, fontWeight: '700', color: C.muted },
  controls: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: S.xl },
  round: {
    borderWidth: 2,
    borderColor: C.line,
    backgroundColor: C.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tip: { fontSize: 13.5, lineHeight: 19, color: C.muted, textAlign: 'center' },
  row: { flexDirection: 'row', gap: S.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: S.xl },
});
