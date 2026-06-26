// components/Input.js
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius } from '../styles/theme';

const Input = ({
  label, value, onChangeText, placeholder,
  secureTextEntry = false, keyboardType = 'default',
  multiline = false, numberOfLines = 1,
  error, editable = true, darkMode = false,
  style, leftIcon, required = false, ...props
}) => {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrap, style]}>
      {label && (
        <Text style={[styles.label, darkMode && styles.labelDark]}>
          {label}{required && <Text style={{ color: Colors.danger }}> *</Text>}
        </Text>
      )}
      <View style={[
        styles.box,
        focused   && styles.boxFocused,
        error     && styles.boxError,
        !editable && styles.boxDisabled,
        darkMode  && styles.boxDark,
      ]}>
        {leftIcon && <Ionicons name={leftIcon} size={18} color={Colors.grey500} style={{ marginRight: 8 }} />}
        <TextInput
          style={[styles.input, multiline && { minHeight: numberOfLines * 40, textAlignVertical: 'top' }, darkMode && styles.inputDark]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={darkMode ? Colors.grey600 : Colors.grey400}
          secureTextEntry={secureTextEntry && !show}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          editable={editable}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShow(s => !s)}>
            <Ionicons name={show ? 'eye-outline' : 'eye-off-outline'} size={20} color={Colors.grey500} />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6 },
  labelDark: { color: Colors.darkTextSecondary },
  box: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.grey100, borderRadius: BorderRadius.sm,
    borderWidth: 1.5, borderColor: Colors.grey300, paddingHorizontal: 12,
  },
  boxDark:     { backgroundColor: Colors.darkSurface, borderColor: Colors.darkBorder },
  boxFocused:  { borderColor: Colors.primary, backgroundColor: '#EEF2FF' },
  boxError:    { borderColor: Colors.danger },
  boxDisabled: { opacity: 0.55 },
  input: { flex: 1, paddingVertical: 11, fontSize: 14, color: Colors.textPrimary },
  inputDark: { color: Colors.darkText },
  error: { fontSize: 11, color: Colors.danger, marginTop: 4 },
});

export default Input;
