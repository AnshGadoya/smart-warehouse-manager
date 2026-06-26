// components/Button.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Colors, BorderRadius } from '../styles/theme';

const VARIANTS = {
  primary:   { bg: Colors.primary,   text: Colors.white },
  secondary: { bg: Colors.accent,    text: Colors.white },
  danger:    { bg: Colors.danger,    text: Colors.white },
  success:   { bg: Colors.success,   text: Colors.white },
  warning:   { bg: Colors.warning,   text: Colors.white },
  outline:   { bg: 'transparent',    text: Colors.primary,  border: Colors.primary },
  ghost:     { bg: 'transparent',    text: Colors.primary },
};

const SIZES = {
  sm: { px: 12, py: 7,  fs: 12 },
  md: { px: 20, py: 12, fs: 14 },
  lg: { px: 28, py: 15, fs: 16 },
};

const Button = ({
  title, onPress, variant = 'primary', size = 'md',
  loading = false, disabled = false, icon, style, textStyle,
}) => {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  return (
    <TouchableOpacity
      style={[
        styles.base,
        { backgroundColor: v.bg, paddingHorizontal: s.px, paddingVertical: s.py },
        v.border && { borderWidth: 2, borderColor: v.border },
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading
        ? <ActivityIndicator color={v.text} size="small" />
        : (
          <View style={styles.row}>
            {icon}
            <Text style={[styles.text, { color: v.text, fontSize: s.fs }, textStyle]}>
              {title}
            </Text>
          </View>
        )
      }
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: { borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  row:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  text: { fontWeight: '700', letterSpacing: 0.3 },
  disabled: { opacity: 0.5 },
});

export default Button;
