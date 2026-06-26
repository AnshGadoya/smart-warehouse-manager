// components/Badge.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Badge = ({ label, color = '#43A047', bgColor, size = 'md', style }) => {
  const bg = bgColor || color + '22';
  return (
    <View style={[styles.badge, { backgroundColor: bg, paddingHorizontal: size === 'sm' ? 8 : 10, paddingVertical: size === 'sm' ? 3 : 5 }, style]}>
      <Text style={[styles.text, { color, fontSize: size === 'sm' ? 10 : 12 }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: { borderRadius: 99, alignSelf: 'flex-start' },
  text:  { fontWeight: '700', letterSpacing: 0.3 },
});

export default Badge;
