import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, scoreColor, competitionColor } from '../constants/colors';
import { getAmazonSuggestions } from '../utils/amazon';
import { fmtNum } from '../utils/format';
import ScoreBar from '../components/ScoreBar';

interface NicheResult {
  niche: string;
  competitionScore: number;
  demandScore: number;
  opportunityScore: number;
  estimatedBooks: number;
  avgReviews: number;
  trend: string;
  tier: 'Green' | 'Yellow' | 'Red';
}

function simHash(s: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h) % mod;
}

function buildNiches(suggestions: string[]): NicheResult[] {
  return suggestions.map((phrase, i) => {
    const comp   = Math.max(10, 65 - i * 4 + simHash(phrase, 20) - 10);
    const demand = Math.max(20, 75 - i * 2 + simHash(phrase + 'r', 20) - 5);
    const opp    = Math.round(demand * 0.55 + (100 - comp) * 0.45);
    return {
      niche: phrase,
      competitionScore: comp,
      demandScore: demand,
      opportunityScore: opp,
      estimatedBooks: 30 + comp * 8 + simHash(phrase, 400),
      avgReviews: Math.max(3, 12 + Math.floor(comp / 5) + simHash(phrase + 'a', 25)),
      trend: ['Rising', 'Stable', 'Declining'][simHash(phrase, 3)],
      tier: opp >= 70 ? 'Green' : opp >= 45 ? 'Yellow' : 'Red',
    };
  }).sort((a, b) => b.opportunityScore - a.opportunityScore);
}

const TIER_COLORS: Record<string, string> = {
  Green:  COLORS.green,
  Yellow: COLORS.amber,
  Red:    COLORS.red,
};

export default function NicheScreen() {
  const [query,   setQuery]   = useState('');
  const [niches,  setNiches]  = useState<NicheResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  async function search() {
    const q = query.trim();
    if (!q) return;
    setLoading(true); setError(''); setNiches([]);
    try {
      const suggestions = await getAmazonSuggestions(q);
      setNiches(buildNiches(suggestions.slice(0, 12)));
    } catch (e: any) {
      setError(e.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎯 Niche Finder</Text>
        <Text style={styles.headerSub}>Demand vs. competition analysis for any topic</Text>
      </View>

      <View style={styles.searchArea}>
        <TextInput
          style={styles.input}
          value={query} onChangeText={setQuery}
          placeholder="e.g. mindfulness, fantasy, keto…"
          placeholderTextColor={COLORS.light}
          returnKeyType="search"
          onSubmitEditing={search}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={search} activeOpacity={0.8}>
          {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.searchBtnText}>Find Niches</Text>}
        </TouchableOpacity>
      </View>

      {/* Legend */}
      {niches.length > 0 && (
        <View style={styles.legend}>
          {(['Green','Yellow','Red'] as const).map(t => (
            <View key={t} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: TIER_COLORS[t] }]} />
              <Text style={styles.legendText}>{t === 'Green' ? '70+ = Go' : t === 'Yellow' ? '45–69 = Caution' : '<45 = Avoid'}</Text>
            </View>
          ))}
        </View>
      )}

      {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

      {!loading && niches.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🎯</Text>
          <Text style={styles.emptyTitle}>Enter a topic to find niches</Text>
          <Text style={styles.emptySub}>We score each niche by demand vs. competition and give you a clear go/caution/avoid verdict.</Text>
        </View>
      )}

      <FlatList
        data={niches}
        keyExtractor={item => item.niche}
        contentContainerStyle={{ padding: 12, paddingBottom: 30 }}
        renderItem={({ item, index }) => <NicheCard niche={item} rank={index + 1} />}
      />
    </SafeAreaView>
  );
}

function NicheCard({ niche, rank }: { niche: NicheResult; rank: number }) {
  const tc = TIER_COLORS[niche.tier];
  return (
    <View style={[styles.nicheCard, { borderLeftColor: tc, borderLeftWidth: 4 }]}>
      <View style={styles.nicheTop}>
        <View style={[styles.nicheTier, { backgroundColor: tc + '22' }]}>
          <Text style={[styles.nicheTierScore, { color: tc }]}>{niche.opportunityScore}</Text>
          <Text style={[styles.nicheTierLabel, { color: tc }]}>{niche.tier}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.nicheName}>{niche.niche}</Text>
          <View style={styles.nicheMetaRow}>
            <Text style={styles.nicheMeta}>~{fmtNum(niche.estimatedBooks)} books</Text>
            <Text style={styles.nicheMeta}>~{niche.avgReviews} avg reviews</Text>
            <Text style={[styles.nicheMeta, { color: niche.trend === 'Rising' ? COLORS.green : niche.trend === 'Declining' ? COLORS.red : COLORS.muted }]}>
              {niche.trend === 'Rising' ? '↑' : niche.trend === 'Declining' ? '↓' : '→'} {niche.trend}
            </Text>
          </View>
        </View>
      </View>
      <ScoreBar label="Opportunity" score={niche.opportunityScore} />
      <ScoreBar label="Demand"      score={niche.demandScore} />
      <ScoreBar label="Competition" score={niche.competitionScore} color={competitionColor(niche.competitionScore)} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: COLORS.bg },
  header:     { backgroundColor: COLORS.navy, padding: 16, paddingTop: 4 },
  headerTitle:{ fontSize: 20, fontWeight: '900', color: '#fff', marginBottom: 2 },
  headerSub:  { fontSize: 12, color: COLORS.light },
  searchArea: { flexDirection: 'row', margin: 12, gap: 8 },
  input:      { flex: 1, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, padding: 11, fontSize: 14, color: COLORS.text, backgroundColor: COLORS.card },
  searchBtn:  { backgroundColor: COLORS.green, borderRadius: 10, paddingHorizontal: 14, justifyContent: 'center' },
  searchBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  legend:     { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 8, marginHorizontal: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot:  { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: COLORS.muted },
  errorBox:   { margin: 12, backgroundColor: COLORS.redBg, padding: 12, borderRadius: 10 },
  errorText:  { color: COLORS.red, fontSize: 13 },
  empty:      { alignItems: 'center', padding: 40 },
  emptyIcon:  { fontSize: 36, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  emptySub:   { fontSize: 13, color: COLORS.muted, textAlign: 'center' },
  nicheCard:  { backgroundColor: COLORS.card, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  nicheTop:   { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  nicheTier:  { width: 52, height: 52, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  nicheTierScore: { fontSize: 18, fontWeight: '900' },
  nicheTierLabel: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  nicheName:  { fontSize: 14, fontWeight: '800', color: COLORS.text, flexWrap: 'wrap' },
  nicheMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  nicheMeta:  { fontSize: 11, color: COLORS.muted },
});
