import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

interface Props {
  label: string;
  score: number;
  color?: string;
}

export default function ScoreBar({ label, score, color }: Props) {
  const barColor = color ?? (score >= 70 ? COLORS.green : score >= 45 ? COLORS.amber : COLORS.red);
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${score}%` as any, backgroundColor: barColor }]} />
      </View>
      <Text style={[styles.num, { color: barColor }]}>{score}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', marginVertical: 3 },
  label: { width: 80, fontSize: 11, color: COLORS.muted },
  track: { flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: 99, overflow: 'hidden', marginHorizontal: 8 },
  fill:  { height: '100%', borderRadius: 99 },
  num:   { width: 24, fontSize: 11, fontWeight: '800', textAlign: 'right' },
});
