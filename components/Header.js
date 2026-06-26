// components/Header.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../styles/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Header = ({ title, subtitle, onBack, rightAction, darkMode = false }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, darkMode && styles.headerDark, { paddingTop: insets.top + 8 }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
      <View style={styles.row}>
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </TouchableOpacity>
        )}
        <View style={styles.titleBox}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={styles.sub} numberOfLines={1}>{subtitle}</Text> : null}
        </View>
        {rightAction && <View>{rightAction}</View>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header:    { backgroundColor: Colors.primary, paddingBottom: 14, paddingHorizontal: 16 },
  headerDark:{ backgroundColor: Colors.primaryDark },
  row:       { flexDirection: 'row', alignItems: 'center' },
  backBtn:   { marginRight: 12, padding: 4 },
  titleBox:  { flex: 1 },
  title:     { fontSize: 18, fontWeight: '700', color: Colors.white, letterSpacing: 0.3 },
  sub:       { fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 2 },
});

export default Header;
