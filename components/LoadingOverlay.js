// components/LoadingOverlay.js
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Colors } from '../styles/theme';

const LoadingOverlay = ({ message = 'Processing…' }) => (
  <View style={styles.overlay}>
    <View style={styles.box}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
  box:     { backgroundColor: '#fff', borderRadius: 16, padding: 28, alignItems: 'center', minWidth: 180 },
  text:    { fontSize: 14, color: Colors.textSecondary, marginTop: 14 },
});

export default LoadingOverlay;
