import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, scoreColor, competitionColor } from '../constants/colors';
import { getAmazonSuggestions, buildKeywordData, KeywordResult } from '../utils/amazon';
import { fmtNum } from '../utils/format';
import ScoreBar from '../components/ScoreBar';

export default function KeywordsScreen() {
  const [query,    setQuery]    = useState('');
  const [keywords, setKeywords] = useState<KeywordResult[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [filter,   setFilter]   = useState<'all' | 'long' | 'broad'>('all');

  async function search() {
    const q = query.trim();
    if (!q) return;
    setLoading(true); setError(''); setKeywords([]);
    try {
      const suggestions = await getAmazonSuggestions(q);
      setKeywords(buildKeywordData(suggestions));
    } catch (e: any) {
      setError(e.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  }

  const displayed = keywords.filter(k =>
    filter === 'all'   ? true :
    filter === 'long'  ? k.wordCount > 2 :
    k.wordCount <= 2
  );

  const totalSearches = keywords.reduce((s, k) => s + k.estimatedMonthlySearches, 0);
  const avgComp = keywords.length ? Math.round(keywords.reduce((s, k) => s + k.competitionScore, 0) / keywords.length) : 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔑 Keyword Research</Text>
        <Text style={styles.headerSub}>Find high-value Amazon book keywords</Text>
      </View>

      <View style={styles.searchArea}>
        <TextInput
          style={styles.input}
          value={query} onChangeText={setQuery}
          placeholder="e.g. cozy mystery, keto diet, self help…"
          placeholderTextColor={COLORS.light}
          returnKeyType="search"
          onSubmitEditing={search}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={search} activeOpacity={0.8}>
          {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.searchBtnText}>Search</Text>}
        </TouchableOpacity>
      </View>

      {/* Summary bar */}
      {keywords.length > 0 && (
        <View style={styles.summaryBar}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryVal}>{keywords.length}</Text>
            <Text style={styles.summaryLabel}>Keywords</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryVal}>{fmtNum(totalSearches)}</Text>
            <Text style={styles.summaryLabel}>Total Searches/mo</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryVal, { color: competitionColor(avgComp) }]}>{avgComp}</Text>
            <Text style={styles.summaryLabel}>Avg Competition</Text>
          </View>
        </View>
      )}

      {/* Filter tabs */}
      {keywords.length > 0 && (
        <View style={styles.tabs}>
          {(['all','long','broad'] as const).map(f => (
            <TouchableOpacity key={f} style={[styles.tab, filter === f && styles.tabActive]} onPress={() => setFilter(f)}>
              <Text style={[styles.tabText, filter === f && styles.tabTextActive]}>
                {f === 'all' ? 'All' : f === 'long' ? 'Long Tail' : 'Broad'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {error ? (
        <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>
      ) : null}

      {!loading && keywords.length === 0 && query.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔑</Text>
          <Text style={styles.emptyTitle}>Enter a keyword to research</Text>
          <Text style={styles.emptySub}>Pulls real Amazon autocomplete suggestions and enriches with estimated search volumes and competition scores.</Text>
        </View>
      )}

      <FlatList
        data={displayed}
        keyExtractor={item => item.keyword}
        contentContainerStyle={{ padding: 12, paddingBottom: 30 }}
        renderItem={({ item }) => <KeywordRow kw={item} />}
        ListEmptyComponent={loading ? null : (
          keywords.length > 0 ? <Text style={styles.noResults}>No keywords in this group</Text> : null
        )}
      />
    </SafeAreaView>
  );
}

function KeywordRow({ kw }: { kw: KeywordResult }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <TouchableOpacity style={styles.kwCard} onPress={() => setExpanded(e => !e)} activeOpacity={0.85}>
      <View style={styles.kwTop}>
        <Text style={styles.kwWord} numberOfLines={expanded ? undefined : 1}>{kw.keyword}</Text>
        <View style={[styles.kwTypeBadge, kw.type === 'Long Tail' ? styles.kwTypeLong : styles.kwTypeBroad]}>
          <Text style={styles.kwTypeText}>{kw.type}</Text>
        </View>
      </View>
      {expanded ? (
        <View style={styles.kwDetails}>
          <ScoreBar label="Competition" score={kw.competitionScore} color={competitionColor(kw.competitionScore)} />
          <ScoreBar label="Opportunity" score={kw.opportunityScore} />
          <View style={styles.kwMetaRow}>
            <View style={styles.kwMeta}><Text style={styles.kwMetaVal}>{fmtNum(kw.estimatedMonthlySearches)}</Text><Text style={styles.kwMetaLabel}>Searches/mo</Text></View>
            <View style={styles.kwMeta}><Text style={styles.kwMetaVal}>${kw.avgCpc}</Text><Text style={styles.kwMetaLabel}>Avg CPC</Text></View>
          </View>
        </View>
      ) : (
        <View style={styles.kwRow}>
          <Text style={styles.kwVol}>{fmtNum(kw.estimatedMonthlySearches)}/mo</Text>
          <View style={styles.kwScoreRow}>
            <Text style={[styles.kwScore, { color: competitionColor(kw.competitionScore) }]}>Comp: {kw.competitionScore}</Text>
            <Text style={[styles.kwScore, { color: scoreColor(kw.opportunityScore) }]}>Opp: {kw.opportunityScore}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: COLORS.bg },
  header:     { backgroundColor: COLORS.navy, padding: 16, paddingTop: 4 },
  headerTitle:{ fontSize: 20, fontWeight: '900', color: '#fff', marginBottom: 2 },
  headerSub:  { fontSize: 12, color: COLORS.light },
  searchArea: { flexDirection: 'row', margin: 12, gap: 8 },
  input:      { flex: 1, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, padding: 11, fontSize: 14, color: COLORS.text, backgroundColor: COLORS.card },
  searchBtn:  { backgroundColor: COLORS.blue, borderRadius: 10, paddingHorizontal: 18, justifyContent: 'center' },
  searchBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  summaryBar: { flexDirection: 'row', backgroundColor: COLORS.card, marginHorizontal: 12, borderRadius: 10, padding: 12, marginBottom: 8, gap: 4 },
  summaryItem:{ flex: 1, alignItems: 'center' },
  summaryVal: { fontSize: 16, fontWeight: '900', color: COLORS.text },
  summaryLabel:{ fontSize: 9, color: COLORS.muted, marginTop: 2, textAlign: 'center' },
  tabs:       { flexDirection: 'row', marginHorizontal: 12, backgroundColor: COLORS.card, borderRadius: 10, padding: 4, marginBottom: 4 },
  tab:        { flex: 1, padding: 8, alignItems: 'center', borderRadius: 8 },
  tabActive:  { backgroundColor: COLORS.blue },
  tabText:    { fontSize: 12, fontWeight: '700', color: COLORS.muted },
  tabTextActive: { color: '#fff' },
  errorBox:   { margin: 12, backgroundColor: COLORS.redBg, padding: 12, borderRadius: 10 },
  errorText:  { color: COLORS.red, fontSize: 13 },
  empty:      { alignItems: 'center', padding: 40 },
  emptyIcon:  { fontSize: 36, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  emptySub:   { fontSize: 13, color: COLORS.muted, textAlign: 'center' },
  noResults:  { textAlign: 'center', color: COLORS.muted, padding: 20 },
  kwCard:     { backgroundColor: COLORS.card, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  kwTop:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 },
  kwWord:     { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.text },
  kwTypeBadge:{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 99 },
  kwTypeLong: { backgroundColor: COLORS.blueBg },
  kwTypeBroad:{ backgroundColor: COLORS.bg },
  kwTypeText: { fontSize: 9, fontWeight: '800', color: COLORS.blue },
  kwRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kwVol:      { fontSize: 12, color: COLORS.muted },
  kwScoreRow: { flexDirection: 'row', gap: 10 },
  kwScore:    { fontSize: 12, fontWeight: '700' },
  kwDetails:  { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: COLORS.border },
  kwMetaRow:  { flexDirection: 'row', marginTop: 8, gap: 8 },
  kwMeta:     { flex: 1, backgroundColor: COLORS.bg, borderRadius: 8, padding: 8, alignItems: 'center' },
  kwMetaVal:  { fontSize: 14, fontWeight: '900', color: COLORS.text },
  kwMetaLabel:{ fontSize: 9, color: COLORS.muted, marginTop: 1 },
});
