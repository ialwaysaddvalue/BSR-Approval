import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, competitionColor } from '../constants/colors';

const CATEGORIES = [
  { name: 'Romance',                 comp: 92, trend: 'Stable',   revenue: 'High'      },
  { name: 'Mystery & Thriller',      comp: 85, trend: 'Rising',   revenue: 'High'      },
  { name: 'Sci-Fi & Fantasy',        comp: 83, trend: 'Rising',   revenue: 'High'      },
  { name: 'Self-Help',               comp: 78, trend: 'Rising',   revenue: 'Very High' },
  { name: 'Business & Money',        comp: 72, trend: 'Rising',   revenue: 'Very High' },
  { name: 'Health & Fitness',        comp: 70, trend: 'Rising',   revenue: 'High'      },
  { name: "Children's Books",        comp: 68, trend: 'Stable',   revenue: 'Moderate'  },
  { name: 'Computers & Tech',        comp: 68, trend: 'Rising',   revenue: 'High'      },
  { name: 'Cookbooks',               comp: 65, trend: 'Stable',   revenue: 'Moderate'  },
  { name: 'Low-Content Books',       comp: 65, trend: 'Rising',   revenue: 'Moderate'  },
  { name: 'Biographies & Memoirs',   comp: 62, trend: 'Stable',   revenue: 'Moderate'  },
  { name: 'Religion & Spirituality', comp: 60, trend: 'Stable',   revenue: 'Moderate'  },
  { name: 'Parenting',               comp: 55, trend: 'Rising',   revenue: 'Moderate'  },
  { name: 'History',                 comp: 58, trend: 'Stable',   revenue: 'Moderate'  },
  { name: 'Education & Teaching',    comp: 48, trend: 'Stable',   revenue: 'Moderate'  },
  { name: 'Travel',                  comp: 52, trend: 'Rising',   revenue: 'Low'       },
];

const OPPORTUNITIES = [
  { title: 'LitRPG / GameLit',            reason: 'Fastest-growing SFF sub-genre, under-served' },
  { title: 'Cozy Mystery',                reason: 'Strong reader loyalty, high series potential' },
  { title: 'AI Tools for Business',       reason: 'Surging demand, very few quality titles yet' },
  { title: 'Clean Romance',               reason: 'Large audience, KU-compatible, evergreen' },
  { title: 'Cybersecurity for Beginners', reason: 'High search volume, few accessible books' },
];

export default function MarketScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>📈 Market Overview</Text>
          <Text style={styles.headerSub}>Genre competition &amp; revenue potential at a glance</Text>
        </View>

        {/* Market stats */}
        <View style={styles.statsRow}>
          {statCard('📚', '7.2M+',    'Total KDP Books')}
          {statCard('📦', '300K+/mo', 'New Books')}
          {statCard('💲', '$4.99',    'Avg Kindle Price')}
          {statCard('⭐', '4M+',      'KU Titles')}
        </View>

        {/* Top opportunities */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔥 Top Opportunities Right Now</Text>
          {OPPORTUNITIES.map((o, i) => (
            <View key={i} style={styles.oppRow}>
              <View style={styles.oppNum}><Text style={styles.oppNumText}>{i + 1}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.oppTitle}>{o.title}</Text>
                <Text style={styles.oppReason}>{o.reason}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Category bars */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Competition by Category</Text>
          <Text style={styles.cardSub}>Red = high competition  ·  Green = opportunity</Text>
          {CATEGORIES.map(c => (
            <View key={c.name} style={styles.barRow}>
              <Text style={styles.barName} numberOfLines={1}>{c.name}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${c.comp}%` as any, backgroundColor: competitionColor(c.comp) }]} />
              </View>
              <Text style={[styles.barScore, { color: competitionColor(c.comp) }]}>{c.comp}</Text>
              <Text style={[styles.trendBadge,
                { color: c.trend === 'Rising' ? COLORS.green : COLORS.muted }]}>
                {c.trend === 'Rising' ? '↑' : '→'}
              </Text>
            </View>
          ))}
        </View>

        {/* Revenue table */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Revenue Potential by Genre</Text>
          {CATEGORIES.filter(c => c.revenue !== 'Low').map(c => (
            <View key={c.name} style={styles.revRow}>
              <Text style={styles.revName}>{c.name}</Text>
              <View style={[styles.revBadge,
                c.revenue === 'Very High' ? styles.revBadgeGreen : c.revenue === 'High' ? styles.revBadgeBlue : styles.revBadgeGray]}>
                <Text style={styles.revBadgeText}>{c.revenue}</Text>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function statCard(icon: string, value: string, label: string) {
  return (
    <View style={styles.statCard} key={label}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statVal}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: COLORS.bg },
  scroll:  { padding: 14, paddingBottom: 40 },
  header:  { backgroundColor: COLORS.navy, borderRadius: 14, padding: 18, marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 4 },
  headerSub: { fontSize: 13, color: COLORS.light },
  statsRow:{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 14, gap: 8 },
  statCard:{ flex: 1, minWidth: '22%', backgroundColor: COLORS.card, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  statIcon:{ fontSize: 18, marginBottom: 4 },
  statVal: { fontSize: 15, fontWeight: '900', color: COLORS.text },
  statLabel:{ fontSize: 9, color: COLORS.muted, textAlign: 'center', marginTop: 2 },
  card:    { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  cardTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  cardSub: { fontSize: 11, color: COLORS.muted, marginBottom: 12 },
  oppRow:  { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 10 },
  oppNum:  { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.amber, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  oppNumText: { fontSize: 11, fontWeight: '900', color: COLORS.navy },
  oppTitle:{ fontSize: 13, fontWeight: '700', color: COLORS.text },
  oppReason:{ fontSize: 11, color: COLORS.muted, marginTop: 2 },
  barRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  barName: { width: 130, fontSize: 11, color: COLORS.text, marginRight: 6 },
  barTrack:{ flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: 99, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 99 },
  barScore:{ width: 24, fontSize: 11, fontWeight: '800', textAlign: 'right', marginLeft: 4 },
  trendBadge: { width: 16, fontSize: 13, fontWeight: '800', textAlign: 'center', marginLeft: 4 },
  revRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  revName: { fontSize: 13, color: COLORS.text },
  revBadge:{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  revBadgeGreen:{ backgroundColor: COLORS.greenBg },
  revBadgeBlue: { backgroundColor: COLORS.blueBg },
  revBadgeGray: { backgroundColor: COLORS.bg },
  revBadgeText: { fontSize: 11, fontWeight: '700' },
});
