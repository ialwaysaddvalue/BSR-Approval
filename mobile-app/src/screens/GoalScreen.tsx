import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, scoreColor } from '../constants/colors';
import { monthlyToBsr, getAchievability, getFitScore } from '../utils/bsr';
import { GENRES, Genre } from '../data/genres';
import { fmtMoney, fmtBsr, fmtNum } from '../utils/format';
import ScoreBar from '../components/ScoreBar';

interface GoalResult {
  target: number;
  royaltyPer: number;
  totalCopies: number;
  copiesPerBook: number;
  requiredBsr: number;
  achievability: ReturnType<typeof getAchievability>;
  genres: Array<{ genre: Genre; fitScore: number }>;
}

export default function GoalScreen() {
  const [target,  setTarget]  = useState('');
  const [books,   setBooks]   = useState('3');
  const [price,   setPrice]   = useState('9.99');
  const [royalty, setRoyalty] = useState('70');
  const [result,  setResult]  = useState<GoalResult | null>(null);
  const [loading, setLoading] = useState(false);

  function calculate() {
    const t  = parseFloat(target);
    const b  = Math.max(1, parseInt(books, 10) || 1);
    const p  = parseFloat(price) || 9.99;
    const r  = (parseFloat(royalty) || 70) / 100;
    if (!t || t <= 0) return;

    setLoading(true);
    // Run synchronously — no network needed
    const royaltyPer    = p * r;
    const totalCopies   = Math.ceil(t / royaltyPer);
    const copiesPerBook = Math.ceil(totalCopies / b);
    const requiredBsr   = monthlyToBsr(copiesPerBook);
    const achievability = getAchievability(requiredBsr);

    const genres = GENRES.map(genre => ({
      genre,
      fitScore: getFitScore(requiredBsr, genre.bsrRange[0], genre.bsrRange[1]),
    })).sort((a, b2) => b2.fitScore - a.fitScore);

    setResult({ target: t, royaltyPer, totalCopies, copiesPerBook, requiredBsr, achievability, genres });
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>💰 Profit Goal</Text>
            <Text style={styles.headerSub}>Enter your income target — we'll show you exactly what to write</Text>
          </View>

          {/* Form */}
          <View style={styles.card}>
            <View style={styles.row2}>
              <View style={styles.field}>
                <Text style={styles.label}>Monthly Goal ($)</Text>
                <TextInput
                  style={styles.input}
                  value={target} onChangeText={setTarget}
                  keyboardType="numeric" placeholder="e.g. 3000"
                  placeholderTextColor={COLORS.light}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Books to Publish</Text>
                <TextInput
                  style={styles.input}
                  value={books} onChangeText={setBooks}
                  keyboardType="numeric" placeholder="3"
                  placeholderTextColor={COLORS.light}
                />
              </View>
            </View>
            <View style={styles.row2}>
              <View style={styles.field}>
                <Text style={styles.label}>Book Price ($)</Text>
                <TextInput
                  style={styles.input}
                  value={price} onChangeText={setPrice}
                  keyboardType="decimal-pad" placeholder="9.99"
                  placeholderTextColor={COLORS.light}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Royalty Rate (%)</Text>
                <View style={styles.segRow}>
                  {['70', '35'].map(r => (
                    <TouchableOpacity key={r} style={[styles.seg, royalty === r && styles.segActive]}
                      onPress={() => setRoyalty(r)}>
                      <Text style={[styles.segText, royalty === r && styles.segTextActive]}>{r}%</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.btnPrimary} onPress={calculate} activeOpacity={0.8}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>Show Me What to Write →</Text>}
            </TouchableOpacity>
          </View>

          {/* Results */}
          {result && (
            <>
              {/* Summary */}
              <View style={[styles.card, styles.summaryCard, { borderLeftColor: result.achievability.color }]}>
                <View style={styles.summaryTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.summaryTitle}>Path to {fmtMoney(result.target)}/month</Text>
                    <Text style={styles.summarySub}>with {parseInt(books)} book{parseInt(books) > 1 ? 's' : ''} at {fmtMoney(parseFloat(price))}</Text>
                  </View>
                  <View style={[styles.achieveCircle, { borderColor: result.achievability.color }]}>
                    <Text style={[styles.achieveScore, { color: result.achievability.color }]}>{result.achievability.score}</Text>
                    <Text style={[styles.achieveLabel, { color: result.achievability.color }]}>{result.achievability.label}</Text>
                  </View>
                </View>
                <View style={styles.statsRow}>
                  {miniStat('Copies/book/mo', String(result.copiesPerBook))}
                  {miniStat('BSR Needed', fmtBsr(result.requiredBsr))}
                  {miniStat('Royalty/Sale', fmtMoney(result.royaltyPer))}
                </View>
              </View>

              {/* Genre list */}
              <Text style={styles.sectionLabel}>Best Genres for Your Goal</Text>
              {result.genres.map(({ genre, fitScore }, i) => (
                <GenreCard key={genre.id} genre={genre} fitScore={fitScore} rank={i + 1} isTop={i === 0} />
              ))}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function miniStat(label: string, value: string) {
  return (
    <View style={styles.miniStat} key={label}>
      <Text style={styles.miniStatVal}>{value}</Text>
      <Text style={styles.miniStatLabel}>{label}</Text>
    </View>
  );
}

function GenreCard({ genre, fitScore, rank, isTop }: { genre: Genre; fitScore: number; rank: number; isTop: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const fc = scoreColor(fitScore);
  return (
    <TouchableOpacity
      style={[styles.genreCard, isTop && styles.genreCardTop]}
      onPress={() => setExpanded(e => !e)}
      activeOpacity={0.85}
    >
      <View style={styles.genreHeader}>
        <View style={[styles.genreRank, { backgroundColor: fc + '22' }]}>
          <Text style={[styles.genreRankText, { color: fc }]}>{rank}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.genreNameRow}>
            <Text style={styles.genreName}>{genre.name}</Text>
            {isTop && <View style={styles.topBadge}><Text style={styles.topBadgeText}>TOP PICK</Text></View>}
          </View>
          <Text style={styles.genreMeta}>
            {genre.avgWriteWeeks}wk to write · {genre.kuCompatible ? 'KU Compatible' : 'No KU'} · {genre.seriesPotential} series potential
          </Text>
        </View>
        <View style={styles.fitBadge}>
          <Text style={[styles.fitScore, { color: fc }]}>{fitScore}</Text>
          <Text style={styles.fitLabel}>Fit</Text>
        </View>
      </View>

      <ScoreBar label="Fit Score" score={fitScore} />
      <ScoreBar label="Competition" score={genre.competition}
        color={genre.competition <= 40 ? COLORS.green : genre.competition <= 65 ? COLORS.amber : COLORS.red} />

      {expanded && (
        <View style={styles.topicsWrap}>
          <Text style={styles.topicsHeader}>Specific Topics to Write:</Text>
          {genre.topics.map((t, i) => (
            <View key={i} style={[styles.topicCard, i === 0 && styles.topicCardBest]}>
              <View style={styles.topicRow}>
                <Text style={styles.topicTitle}>{t.title}</Text>
                <View style={styles.demandBadge}>
                  <Text style={styles.demandText}>{t.demand}</Text>
                </View>
              </View>
              <Text style={styles.topicNotes}>{t.notes}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.expandHint}>{expanded ? '▲ Less' : '▼ See topics'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: COLORS.bg },
  scroll:    { padding: 16, paddingBottom: 40 },
  header:    { backgroundColor: COLORS.navy, borderRadius: 14, padding: 18, marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 4 },
  headerSub: { fontSize: 13, color: COLORS.light },

  card:      { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  row2:      { flexDirection: 'row', gap: 10, marginBottom: 10 },
  field:     { flex: 1 },
  label:     { fontSize: 11, fontWeight: '700', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 5 },
  input:     { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 8, padding: 10, fontSize: 15, color: COLORS.text, backgroundColor: COLORS.card },
  segRow:    { flexDirection: 'row', borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 8, overflow: 'hidden' },
  seg:       { flex: 1, padding: 10, alignItems: 'center', backgroundColor: COLORS.card },
  segActive: { backgroundColor: COLORS.blue },
  segText:   { fontSize: 14, fontWeight: '700', color: COLORS.muted },
  segTextActive: { color: '#fff' },

  btnPrimary: { backgroundColor: COLORS.amber, borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 4 },
  btnText:   { fontSize: 16, fontWeight: '900', color: COLORS.navy },

  summaryCard:  { borderLeftWidth: 4 },
  summaryTop:   { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  summaryTitle: { fontSize: 17, fontWeight: '900', color: COLORS.text },
  summarySub:   { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  achieveCircle:{ width: 64, height: 64, borderRadius: 32, borderWidth: 3, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  achieveScore: { fontSize: 20, fontWeight: '900' },
  achieveLabel: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },

  statsRow:  { flexDirection: 'row' },
  miniStat:  { flex: 1, alignItems: 'center', backgroundColor: COLORS.bg, borderRadius: 8, padding: 8, marginHorizontal: 3 },
  miniStatVal: { fontSize: 14, fontWeight: '900', color: COLORS.text },
  miniStatLabel: { fontSize: 9, color: COLORS.muted, marginTop: 2, textAlign: 'center' },

  sectionLabel: { fontSize: 13, fontWeight: '800', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: 4 },

  genreCard:    { backgroundColor: COLORS.card, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  genreCardTop: { borderColor: COLORS.green, borderWidth: 2 },
  genreHeader:  { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 10 },
  genreRank:    { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  genreRankText:{ fontSize: 16, fontWeight: '900' },
  genreNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  genreName:    { fontSize: 15, fontWeight: '800', color: COLORS.text },
  genreMeta:    { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  fitBadge:     { alignItems: 'center' },
  fitScore:     { fontSize: 22, fontWeight: '900' },
  fitLabel:     { fontSize: 9, color: COLORS.muted, textTransform: 'uppercase' },
  topBadge:     { backgroundColor: COLORS.greenBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 99 },
  topBadgeText: { fontSize: 9, fontWeight: '800', color: '#065f46' },

  topicsWrap:   { marginTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10 },
  topicsHeader: { fontSize: 12, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  topicCard:    { backgroundColor: COLORS.bg, borderRadius: 8, padding: 10, marginBottom: 7 },
  topicCardBest:{ backgroundColor: COLORS.blueBg },
  topicRow:     { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 },
  topicTitle:   { flex: 1, fontSize: 13, fontWeight: '700', color: COLORS.text },
  demandBadge:  { backgroundColor: COLORS.amber + '33', borderRadius: 99, paddingHorizontal: 7, paddingVertical: 2 },
  demandText:   { fontSize: 11, fontWeight: '800', color: COLORS.amberDark },
  topicNotes:   { fontSize: 11, color: COLORS.muted, marginTop: 4 },
  expandHint:   { fontSize: 11, color: COLORS.light, textAlign: 'center', marginTop: 8 },
});
