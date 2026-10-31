import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { KANJI, KANJI_GROUPS } from '@/data/kanji';
import { LESSONS } from '@/data/lessons';
import { useProgress } from '@/lib/progress-context';
import { subscription } from '@/lib/subscription';
import { DEMO_PLUS_ALLOWED, type Plan } from '@/lib/subscription-types';
import { C, R, S } from '@/theme';

const PLUS_LESSONS = LESSONS.filter((l) => l.premium).length;
const PLUS_GROUPS = new Set(KANJI_GROUPS.filter((g) => g.premium).map((g) => g.id));
const PLUS_KANJI = KANJI.filter((k) => PLUS_GROUPS.has(k.group)).length;

const BENEFITS: [icon: 'school' | 'language' | 'chatbubbles' | 'time', text: string][] = [
  ['school', `Niveli 2: ${PLUS_LESSONS} mësime të reja`],
  ['language', `${PLUS_KANJI} kanji të reja — foljet, koha, drejtimet, moti`],
  ['chatbubbles', 'Foljet e para dhe fjalitë e para në japonisht'],
  ['time', 'Hiragana dhe katakana me ゛ dhe ゜ (が, ぱ…)'],
];

const PERIOD_LABEL: Record<Plan['period'], string> = { annual: 'Vjetor', monthly: 'Mujor', other: '' };

export default function PlusScreen() {
  const { plus, progress, update } = useProgress();
  const [plans, setPlans] = useState<Plan[] | null>(subscription.available ? null : []);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!subscription.available) return;
    subscription
      .plans()
      .then((p) => {
        setPlans(p);
        setSelected(p[0]?.id ?? null);
      })
      .catch(() => {
        setPlans([]);
        setMessage('Planet nuk u ngarkuan. Kontrollo internetin dhe provo përsëri.');
      });
  }, []);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const buy = async () => {
    if (!selected) return;
    setBusy(true);
    setMessage(null);
    const result = await subscription.purchase(selected);
    setBusy(false);
    if (result.status === 'purchased' && result.plus) {
      update((p) => ({ ...p, plus: true }));
      close();
    } else if (result.status === 'failed') setMessage(result.message ?? 'Blerja nuk u krye.');
  };

  const restore = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const active = await subscription.restore();
      update((p) => ({ ...p, plus: active }));
      setMessage(active ? 'Abonimi u rikthye!' : 'Nuk u gjet asnjë abonim aktiv për këtë llogari.');
    } catch {
      setMessage('Rikthimi nuk u krye. Provo përsëri.');
    }
    setBusy(false);
  };

  const storeName = Platform.OS === 'ios' ? 'App Store' : 'Google Play';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Mbyll" hitSlop={12}>
          <Ionicons name="close" size={26} color={C.muted} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <Image source={require('@/assets/images/logo-mark.png')} style={styles.mark} contentFit="contain" />
        <Text style={styles.title}>
          Shqiponisht <Text style={{ color: C.red }}>Plus</Text>
        </Text>
        <Text style={styles.lead}>Vazhdo pas bazave: folje, fjali, koha dhe më shumë kanji.</Text>

        <View style={styles.benefits}>
          {BENEFITS.map(([icon, text]) => (
            <View key={text} style={styles.benefit}>
              <View style={styles.benefitIcon}>
                <Ionicons name={icon} size={18} color={C.red} />
              </View>
              <Text style={styles.benefitText}>{text}</Text>
            </View>
          ))}
        </View>

        {plus ? (
          <View style={styles.active}>
            <Ionicons name="checkmark-circle" size={22} color={C.green} />
            <Text style={styles.activeText}>
              {progress.plus ? 'Plus është aktiv. Faleminderit!' : 'Plus është aktiv në modalitetin demo.'}
            </Text>
          </View>
        ) : plans === null ? (
          <ActivityIndicator color={C.red} style={{ marginVertical: S.xl }} />
        ) : plans.length > 0 ? (
          <>
            <View style={styles.plans}>
              {plans.map((p) => {
                const on = p.id === selected;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => setSelected(p.id)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    style={[styles.plan, on && styles.planOn]}>
                    <Text style={styles.planName}>{PERIOD_LABEL[p.period] || p.title}</Text>
                    <Text style={styles.planPrice}>{p.price}</Text>
                    <Text style={styles.planPer}>
                      {p.period === 'annual' ? 'në vit' : p.period === 'monthly' ? 'në muaj' : ''}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Button label={busy ? 'Duke u përpunuar…' : 'Abonohu'} onPress={buy} disabled={busy || !selected} />
          </>
        ) : (
          <View style={styles.unavailable}>
            <Text style={styles.unavailableText}>
              Abonimi blihet në aplikacionin Shqiponisht për iPhone dhe Android.
            </Text>
            {DEMO_PLUS_ALLOWED && (
              <Button
                label="Provo Plus (demo)"
                variant="secondary"
                onPress={() => {
                  update((p) => ({ ...p, demoPlus: true }));
                  close();
                }}
              />
            )}
          </View>
        )}

        {message && <Text style={styles.message}>{message}</Text>}

        {subscription.available && <Button label="Rikthe blerjet" variant="ghost" onPress={restore} disabled={busy} />}

        {subscription.available && (
          <Text style={styles.legal}>
            Abonimi rinovohet automatikisht në fund të çdo periudhe, përveç nëse e anulon të paktën 24 orë para. Pagesa
            bëhet nga llogaria jote në {storeName}. Mund ta menaxhosh ose ta anulosh kur të duash te cilësimet e{' '}
            {storeName}.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.cream },
  top: { paddingHorizontal: S.xl, paddingTop: S.md },
  body: { padding: S.xl, paddingTop: 0, gap: S.md, maxWidth: 520, width: '100%', alignSelf: 'center' },
  mark: { width: 120, height: 90, alignSelf: 'center' },
  title: { fontSize: 30, fontWeight: '800', color: C.ink, textAlign: 'center', letterSpacing: -0.5 },
  lead: { fontSize: 15.5, lineHeight: 22, color: C.muted, textAlign: 'center' },
  benefits: {
    backgroundColor: C.paper,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.line,
    padding: S.lg,
    gap: S.md,
    marginTop: S.sm,
  },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: S.md },
  benefitIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.redSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: { flex: 1, fontSize: 15, color: C.ink, lineHeight: 20 },
  plans: { flexDirection: 'row', gap: S.sm, marginTop: S.sm },
  plan: {
    flex: 1,
    backgroundColor: C.paper,
    borderWidth: 2,
    borderColor: C.line,
    borderRadius: R.md,
    padding: S.md,
    alignItems: 'center',
  },
  planOn: { borderColor: C.red, backgroundColor: C.redSoft },
  planName: { fontSize: 13, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 1 },
  planPrice: { fontSize: 22, fontWeight: '800', color: C.ink, marginTop: 4 },
  planPer: { fontSize: 12.5, color: C.muted },
  active: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    backgroundColor: C.greenSoft,
    borderRadius: R.md,
    padding: S.lg,
    marginTop: S.sm,
  },
  activeText: { flex: 1, fontSize: 15, fontWeight: '600', color: C.greenDark },
  unavailable: { gap: S.md, marginTop: S.sm },
  unavailableText: { fontSize: 14.5, lineHeight: 21, color: C.muted, textAlign: 'center' },
  message: { fontSize: 14, color: C.redDark, textAlign: 'center' },
  legal: { fontSize: 11.5, lineHeight: 16, color: C.muted, textAlign: 'center' },
});
