// components/EmptyState.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../styles/theme';

const EmptyState = ({ icon = 'cube-outline', title = 'No Data', subtitle, darkMode = false }) => (
  <View style={styles.wrap}>
    <View style={styles.circle}>
      <Ionicons name={icon} size={48} color={Colors.grey400} />
    </View>
    <Text style={[styles.title, darkMode && styles.titleDark]}>{title}</Text>
    {subtitle ? <Text style={[styles.sub, darkMode && styles.subDark]}>{subtitle}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  wrap:      { alignItems: 'center', justifyContent: 'center', padding: 40 },
  circle:    { width: 90, height: 90, borderRadius: 45, backgroundColor: Colors.grey200, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title:     { fontSize: 16, fontWeight: '700', color: Colors.textSecondary, marginBottom: 6 },
  titleDark: { color: Colors.darkTextSecondary },
  sub:       { fontSize: 13, color: Colors.textMuted, textAlign: 'center' },
  subDark:   { color: Colors.grey600 },
});

export default EmptyState;
