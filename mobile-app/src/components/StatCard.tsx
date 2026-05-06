import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

interface Props {
  label: string;
  value: string;
  bgColor?: string;
  icon?: string;
}

export default function StatCard({ label, value, bgColor, icon }: Props) {
  return (
    <View style={[styles.card, bgColor ? { backgroundColor: bgColor } : null]}>
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card:  { flex: 1, backgroundColor: COLORS.bg, borderRadius: 10, padding: 12, alignItems: 'center', margin: 4 },
  icon:  { fontSize: 20, marginBottom: 4 },
  label: { fontSize: 10, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center', marginBottom: 4 },
  value: { fontSize: 18, fontWeight: '900', color: COLORS.text, textAlign: 'center' },
});
