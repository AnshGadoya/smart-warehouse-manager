// components/PickerSelect.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Shadow } from '../styles/theme';

const PickerSelect = ({
  label, value, onValueChange, items = [],
  placeholder = 'Select…', error, darkMode = false,
  required = false, disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const selected = items.find(i => i.value === value);

  return (
    <View style={{ marginBottom: 14 }}>
      {label && (
        <Text style={[styles.label, darkMode && styles.labelDark]}>
          {label}{required && <Text style={{ color: Colors.danger }}> *</Text>}
        </Text>
      )}
      <TouchableOpacity
        style={[styles.sel, error && styles.selError, disabled && styles.selDisabled, darkMode && styles.selDark]}
        onPress={() => !disabled && setOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.selText, !selected && styles.placeholder, darkMode && styles.selTextDark]}>
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={Colors.grey500} />
      </TouchableOpacity>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={[styles.sheet, darkMode && styles.sheetDark]}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, darkMode && styles.sheetTitleDark]}>{label || 'Select'}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Ionicons name="close" size={22} color={Colors.grey600} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={items}
              keyExtractor={i => String(i.value)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.opt, item.value === value && styles.optActive]}
                  onPress={() => { onValueChange(item.value); setOpen(false); }}
                >
                  <Text style={[styles.optText, item.value === value && styles.optTextActive, darkMode && styles.optTextDark]}>
                    {item.label}
                  </Text>
                  {item.value === value && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.sep} />}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6 },
  labelDark: { color: Colors.darkTextSecondary },
  sel: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.grey100, borderRadius: BorderRadius.sm,
    borderWidth: 1.5, borderColor: Colors.grey300, paddingHorizontal: 12, paddingVertical: 12,
  },
  selDark: { backgroundColor: Colors.darkSurface, borderColor: Colors.darkBorder },
  selError: { borderColor: Colors.danger },
  selDisabled: { opacity: 0.5 },
  selText: { fontSize: 14, color: Colors.textPrimary, flex: 1 },
  selTextDark: { color: Colors.darkText },
  placeholder: { color: Colors.grey400 },
  error: { fontSize: 11, color: Colors.danger, marginTop: 4 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    maxHeight: '65%', paddingBottom: 32, ...Shadow.large,
  },
  sheetDark: { backgroundColor: Colors.darkCard },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.grey200,
  },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  sheetTitleDark: { color: Colors.darkText },
  opt: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  optActive: { backgroundColor: '#EEF2FF' },
  optText: { fontSize: 15, color: Colors.textPrimary, flex: 1 },
  optTextActive: { color: Colors.primary, fontWeight: '700' },
  optTextDark: { color: Colors.darkText },
  sep: { height: 1, backgroundColor: Colors.grey100, marginHorizontal: 16 },
});

export default PickerSelect;
