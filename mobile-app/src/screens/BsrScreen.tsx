import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, scoreColor, competitionColor } from '../constants/colors';
import { bsrToMonthly, getCompetitionInfo, BsrCategory } from '../utils/bsr';
import { fmtMoney, fmtBsr, fmtNum } from '../utils/format';
import StatCard from '../components/StatCard';
import ScoreBar from '../components/ScoreBar';

const CATEGORIES: { key: BsrCategory; label: string }[] = [
  { key: 'kindle',  label: 'Kindle eBooks' },
  { key: 'print',   label: 'Print Books'   },
  { key: 'audible', label: 'Audible'       },
];

export default function BsrScreen() {
  const [bsr,      setBsr]      = useState('');
  const [category, setCategory] = useState<BsrCategory>('kindle');
  const [price,    setPrice]    = useState('9.99');
  const [royalty,  setRoyalty]  = useState('70');
  const [result,   setResult]   = useState<ReturnType<typeof compute> | null>(null);

  function compute() {
    const b = parseInt(bsr, 10);
    const p = parseFloat(price) || 9.99;
    const r = (parseFloat(royalty) || 70) / 100;
    if (!b || b < 1) return null;

    const monthly   = bsrToMonthly(b, category);
    const daily     = monthly / 30;
    const compInfo  = getCompetitionInfo(b);
    const revMonthly = monthly * p * r;

    return { bsr: b, monthly, daily: parseFloat(daily.toFixed(1)), compInfo, price: p, royaltyRate: r, revMonthly, revAnnual: revMonthly * 12 };
  }

  function handleCalc() {
    const r = compute();
    if (r) setResult(r);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <View style={styles.header}>
            <Text style={styles.headerTitle}>📊 BSR Calculator</Text>
            <Text style={styles.headerSub}>Convert Best Seller Rank to estimated monthly sales & revenue</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.catRow}>
              {CATEGORIES.map(c => (
                <TouchableOpacity key={c.key}
                  style={[styles.catBtn, category === c.key && styles.catBtnActive]}
                  onPress={() => setCategory(c.key)}>
                  <Text style={[styles.catText, category === c.key && styles.catTextActive]}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.row2}>
              <View style={styles.field}>
                <Text style={styles.label}>Best Seller Rank</Text>
                <TextInput style={styles.input} value={bsr} onChangeText={setBsr}
                  keyboardType="numeric" placeholder="e.g. 15000"
                  placeholderTextColor={COLORS.light} />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Price ($)</Text>
                <TextInput style={styles.input} value={price} onChangeText={setPrice}
                  keyboardType="decimal-pad" placeholder="9.99"
                  placeholderTextColor={COLORS.light} />
              </View>
            </View>

            <Text style={styles.label}>Royalty Rate</Text>
            <View style={[styles.segRow, { marginBottom: 14 }]}>
              {['70', '35'].map(r => (
                <TouchableOpacity key={r} style={[styles.seg, royalty === r && styles.segActive]} onPress={() => setRoyalty(r)}>
                  <Text style={[styles.segText, royalty === r && styles.segTextActive]}>{r}% (KDP {r === '70' ? 'Standard' : 'Reduced'})</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.btnPrimary} onPress={handleCalc} activeOpacity={0.8}>
              <Text style={styles.btnText}>Calculate →</Text>
            </TouchableOpacity>
          </View>

          {result && (
            <>
              {/* Sales stats */}
              <View style={styles.statsGrid}>
                <StatCard label="Daily Sales"     value={String(result.daily)}                  icon="📦" bgColor={COLORS.blueBg} />
                <StatCard label="Monthly Sales"   value={String(result.monthly)}                icon="📅" bgColor={COLORS.greenBg} />
              </View>
              <View style={styles.statsGrid}>
                <StatCard label="Monthly Revenue" value={fmtMoney(result.revMonthly)}   icon="💰" bgColor={COLORS.yellowBg} />
                <StatCard label="Annual Revenue"  value={fmtMoney(result.revAnnual)}   icon="🏦" bgColor="#f3e8ff" />
              </View>

              {/* Competition */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Competition Analysis</Text>
                <View style={styles.compRow}>
                  <View style={[styles.compCircle, { borderColor: competitionColor(result.compInfo.score) }]}>
                    <Text style={[styles.compCircleScore, { color: competitionColor(result.compInfo.score) }]}>{result.compInfo.score}</Text>
                    <Text style={styles.compCircleLabel}>{result.compInfo.level}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <ScoreBar label="Competition" score={result.compInfo.score}
                      color={competitionColor(result.compInfo.score)} />
                    <ScoreBar label="Opportunity" score={result.compInfo.opportunityScore} />
                    <View style={styles.benchmarkRow}>
                      <View style={styles.benchmark}>
                        <Text style={styles.benchmarkVal}>{fmtBsr(25_000)}</Text>
                        <Text style={styles.benchmarkLabel}>Kindle Top-100 BSR</Text>
                      </View>
                      <View style={styles.benchmark}>
                        <Text style={styles.benchmarkVal}>{fmtBsr(250_000)}</Text>
                        <Text style={styles.benchmarkLabel}>Top-1,000 BSR</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Revenue */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Revenue Breakdown</Text>
                {revenueRow('Price',            fmtMoney(result.price))}
                {revenueRow('Royalty Rate',      Math.round(result.royaltyRate * 100) + '%')}
                {revenueRow('Royalty/Sale',      fmtMoney(result.price * result.royaltyRate))}
                {revenueRow('Monthly Sales',     result.monthly + ' copies')}
                {revenueRow('Monthly Revenue',   fmtMoney(result.revMonthly), true)}
                {revenueRow('Annual Revenue',    fmtMoney(result.revAnnual), true)}
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function revenueRow(label: string, value: string, bold = false) {
  return (
    <View style={rrStyles.row} key={label}>
      <Text style={rrStyles.label}>{label}</Text>
      <Text style={[rrStyles.value, bold && rrStyles.bold]}>{value}</Text>
    </View>
  );
}
const rrStyles = StyleSheet.create({
  row:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  label: { fontSize: 13, color: COLORS.muted },
  value: { fontSize: 13, color: COLORS.text },
  bold:  { fontWeight: '800' },
});

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 16, paddingBottom: 40 },
  header: { backgroundColor: COLORS.navy, borderRadius: 14, padding: 18, marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 4 },
  headerSub: { fontSize: 13, color: COLORS.light },
  card:   { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  cardTitle: { fontSize: 15, fontWeight: '800', marginBottom: 12, color: COLORS.text },
  row2:   { flexDirection: 'row', gap: 10, marginBottom: 10 },
  field:  { flex: 1 },
  label:  { fontSize: 11, fontWeight: '700', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 5 },
  input:  { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 8, padding: 10, fontSize: 15, color: COLORS.text, backgroundColor: COLORS.card },
  catRow: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  catBtn: { flex: 1, padding: 8, borderRadius: 8, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center' },
  catBtnActive: { backgroundColor: COLORS.blue, borderColor: COLORS.blue },
  catText:      { fontSize: 11, fontWeight: '700', color: COLORS.muted },
  catTextActive:{ color: '#fff' },
  segRow: { flexDirection: 'row', borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 8, overflow: 'hidden' },
  seg:    { flex: 1, padding: 10, alignItems: 'center', backgroundColor: COLORS.card },
  segActive: { backgroundColor: COLORS.blue },
  segText:   { fontSize: 12, fontWeight: '700', color: COLORS.muted },
  segTextActive: { color: '#fff' },
  btnPrimary: { backgroundColor: COLORS.blue, borderRadius: 10, padding: 14, alignItems: 'center' },
  btnText: { fontSize: 16, fontWeight: '900', color: '#fff' },
  statsGrid: { flexDirection: 'row', marginBottom: 4 },
  compRow:   { flexDirection: 'row', alignItems: 'center' },
  compCircle:{ width: 72, height: 72, borderRadius: 36, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  compCircleScore: { fontSize: 22, fontWeight: '900' },
  compCircleLabel: { fontSize: 9, color: COLORS.muted, textTransform: 'uppercase' },
  benchmarkRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  benchmark: { flex: 1, backgroundColor: COLORS.bg, borderRadius: 8, padding: 8, alignItems: 'center' },
  benchmarkVal: { fontSize: 13, fontWeight: '900', color: COLORS.text },
  benchmarkLabel: { fontSize: 9, color: COLORS.muted, textAlign: 'center', marginTop: 2 },
});
