// components/Card.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Shadow } from '../styles/theme';

const Card = ({ children, style, darkMode }) => (
  <View style={[styles.card, darkMode && styles.dark, style]}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.white, borderRadius: BorderRadius.md, padding: 16, ...Shadow.medium },
  dark: { backgroundColor: Colors.darkCard },
});

export default Card;
