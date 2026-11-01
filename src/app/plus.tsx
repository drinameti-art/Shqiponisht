import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { KANJI, KANJI_GROUPS } from '@/data/kanji';
import { LESSONS } from '@/data/lessons';
import { useProgress } from '@/lib/progress-context';
import { subscription } from '@/lib/subscription';
import { annualSavings, DEMO_PLUS_ALLOWED, type Plan } from '@/lib/subscription-types';
import { BrandHeader } from '@/components/brand';
import { InkText, Reveal, step as at } from '@/components/brand-motion';
import { Logo } from '@/components/logo';
import { C, F, R, S } from '@/theme';

const PLUS_LESSONS = LESSONS.filter((l) => l.premium).length;
const PLUS_GROUPS = new Set(KANJI_GROUPS.filter((g) => g.premium).map((g) => g.id));
const PLUS_KANJI = KANJI.filter((k) => PLUS_GROUPS.has(k.group)).length;

const BENEFITS: [icon: 'school' | 'language' | 'chatbubbles' | 'time', text: string][] = [
  ['school', `Niveli 2: ${PLUS_LESSONS} mësime të reja`],
  ['language', `${PLUS_KANJI} kanji të reja: foljet, koha, paratë, njerëzit`],
  ['chatbubbles', 'Folje, fjali, blerje dhe restoranti'],
  ['time', 'Hiragana dhe katakana të reja: が, ざ, ば, ぱ…'],
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
  const savings = annualSavings(plans ?? []);
  const chosen = plans?.find((p) => p.id === selected);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Mbyll" hitSlop={12}>
          <Ionicons name="close" size={26} color={C.muted} />
        </Pressable>
        <BrandHeader label="PLUS" style={{ flex: 1 }} />
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <Reveal>
          <Logo width={120} style={styles.mark} />
        </Reveal>
        <InkText delay={at(1)} style={styles.title}>
          Shqiponisht <Text style={{ color: C.red }}>Plus</Text>
        </InkText>
        <InkText delay={at(2)} color={C.muted} style={styles.lead}>
          Vazhdo pas bazave: folje, fjali, koha dhe më shumë kanji.
        </InkText>

        <View style={styles.benefits}>
          {BENEFITS.map(([icon, text], i) => (
            <Reveal key={text} delay={at(3 + i)} style={styles.benefit}>
              <View style={styles.benefitIcon}>
                <Ionicons name={icon} size={18} color={C.red} />
              </View>
              <Text style={styles.benefitText}>{text}</Text>
            </Reveal>
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
                    {p.period === 'annual' && savings > 0 && (
                      <View style={styles.saveBadge}>
                        <Text style={styles.saveText}>Kurse {savings}%</Text>
                      </View>
                    )}
                    <Text style={styles.planName}>{PERIOD_LABEL[p.period] || p.title}</Text>
                    <Text style={styles.planPrice}>{p.price}</Text>
                    <Text style={styles.planPer}>
                      {p.period === 'annual' ? 'në vit' : p.period === 'monthly' ? 'në muaj' : ''}
                    </Text>
                    {p.trialDays ? <Text style={styles.trial}>{p.trialDays} ditë falas</Text> : null}
                  </Pressable>
                );
              })}
            </View>
            <Button
              label={
                busy ? 'Duke u përpunuar…' : chosen?.trialDays ? `Fillo ${chosen.trialDays} ditë falas` : 'Abonohu'
              }
              onPress={buy}
              disabled={busy || !selected}
            />
            {chosen?.trialDays ? (
              <Text style={styles.trialNote}>
                Pas provës: {chosen.price} {chosen.period === 'annual' ? 'në vit' : 'në muaj'}. Anulo kur të duash.
              </Text>
            ) : null}
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

        <View style={styles.links}>
          <Text style={styles.link} onPress={() => router.push({ pathname: '/legal/[doc]', params: { doc: 'terms' } })}>
            Kushtet e përdorimit
          </Text>
          <Text style={styles.legal}>·</Text>
          <Text
            style={styles.link}
            onPress={() => router.push({ pathname: '/legal/[doc]', params: { doc: 'privacy' } })}>
            Politika e privatësisë
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.cream },
  top: { flexDirection: 'row', alignItems: 'center', gap: S.lg, paddingHorizontal: S.xl, paddingTop: S.md },
  body: { padding: S.xl, paddingTop: S.xl, gap: S.md, maxWidth: 520, width: '100%', alignSelf: 'center' },
  mark: { alignSelf: 'center' },
  title: { fontSize: 30, fontFamily: F.bold, color: C.ink, textAlign: 'center', letterSpacing: -0.5 },
  lead: { fontFamily: F.regular, fontSize: 15.5, lineHeight: 22, color: C.muted, textAlign: 'center' },
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
  benefitText: { flex: 1, fontFamily: F.regular, fontSize: 15, color: C.ink, lineHeight: 20 },
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
  planName: { fontSize: 13, fontFamily: F.bold, color: C.muted, textTransform: 'uppercase', letterSpacing: 1 },
  planPrice: { fontSize: 22, fontFamily: F.bold, color: C.ink, marginTop: 4 },
  planPer: { fontFamily: F.regular, fontSize: 12.5, color: C.muted },
  active: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    backgroundColor: C.greenSoft,
    borderRadius: R.md,
    padding: S.lg,
    marginTop: S.sm,
  },
  activeText: { flex: 1, fontSize: 15, fontFamily: F.semibold, color: C.greenText },
  unavailable: { gap: S.md, marginTop: S.sm },
  unavailableText: { fontFamily: F.regular, fontSize: 14.5, lineHeight: 21, color: C.muted, textAlign: 'center' },
  message: { fontFamily: F.regular, fontSize: 14, color: C.redText, textAlign: 'center' },
  legal: { fontFamily: F.regular, fontSize: 11.5, lineHeight: 16, color: C.muted, textAlign: 'center' },
  links: { flexDirection: 'row', justifyContent: 'center', gap: S.sm, flexWrap: 'wrap' },
  link: { fontFamily: F.regular, fontSize: 12.5, color: C.ink, textDecorationLine: 'underline' },
  saveBadge: {
    position: 'absolute',
    top: -11,
    backgroundColor: C.green,
    borderRadius: R.pill,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  saveText: { color: C.white, fontSize: 11, fontFamily: F.bold },
  trial: { fontSize: 12, fontFamily: F.bold, color: C.green, marginTop: 4 },
  trialNote: { fontFamily: F.regular, fontSize: 12.5, color: C.muted, textAlign: 'center' },
});
