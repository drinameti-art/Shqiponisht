import { Image } from 'expo-image';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { C, F, isDark, R } from '@/theme';

const RATIO = 900 / 667;

/**
 * The Shqiponisht mark (torii gate over the map of Kosovo). The torii is
 * black, so on a dark screen the mark sits on a cream tile instead of
 * disappearing into the background. `wordmark` adds SHQIPONISHT underneath
 * and シュチッポン語 in red, as on Instagram (docs/BRAND.md §3).
 */
export function Logo({ width, wordmark, style }: { width: number; wordmark?: boolean; style?: StyleProp<ViewStyle> }) {
  const pad = isDark ? Math.round(width * 0.1) : 0;
  const mark = (
    <View style={[isDark && styles.tile, { padding: pad, borderRadius: isDark ? R.lg : 0 }, !wordmark && style]}>
      <Image
        source={require('@/assets/images/logo-mark.png')}
        style={{ width, height: width / RATIO }}
        contentFit="contain"
        accessibilityLabel="Logo e Shqiponisht: portë torii mbi hartën e Kosovës"
      />
    </View>
  );
  if (!wordmark) return mark;
  return (
    <View style={[styles.lockup, style]}>
      {mark}
      <Text style={[styles.word, { fontSize: Math.max(14, width * 0.11), letterSpacing: width * 0.025 }]}>
        SHQIPONISHT
      </Text>
      <Text style={[styles.jp, { fontSize: Math.max(12, width * 0.07) }]}>シュチッポン語</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { backgroundColor: '#F8F0E4', borderWidth: 1, borderColor: C.line },
  lockup: { alignItems: 'center' },
  word: { fontFamily: F.bold, color: C.ink, marginTop: 10 },
  jp: { fontFamily: F.jp, color: C.red, letterSpacing: 2, marginTop: 2 },
});
