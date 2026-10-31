import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { C, isDark, R } from '@/theme';

const RATIO = 900 / 667;

/**
 * The Shqiponisht mark (torii gate over the map of Kosovo). The torii is
 * black, so on a dark screen the mark sits on a cream tile instead of
 * disappearing into the background.
 */
export function Logo({ width, style }: { width: number; style?: StyleProp<ViewStyle> }) {
  const pad = isDark ? Math.round(width * 0.1) : 0;
  return (
    <View style={[isDark && styles.tile, { padding: pad, borderRadius: isDark ? R.lg : 0 }, style]}>
      <Image
        source={require('@/assets/images/logo-mark.png')}
        style={{ width, height: width / RATIO }}
        contentFit="contain"
        accessibilityLabel="Logo e Shqiponisht: portë torii mbi hartën e Kosovës"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { backgroundColor: '#f7f1e5', borderWidth: 1, borderColor: C.line },
});
