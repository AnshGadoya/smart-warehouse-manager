// screens/Masters/PartMasterScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, Modal, ScrollView, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import Header from '../../components/Header';
import Input from '../../components/Input';
import Button from '../../components/Button';
import PickerSelect from '../../components/PickerSelect';
import EmptyState from '../../components/EmptyState';
import Badge from '../../components/Badge';
import { Colors, BorderRadius, Shadow } from '../../styles/theme';

const CATEGORIES = ['Mechanical', 'Electrical', 'Instruments', 'Hydraulics', 'Seals', 'Fasteners', 'Electronics', 'Other']
  .map(c => ({ label: c, value: c }));
const UNITS = ['Nos', 'Set', 'Kg', 'Ltr', 'Mtr', 'Box', 'Pack', 'Roll']
  .map(u => ({ label: u, value: u }));

const CATEGORY_COLORS = {
  Mechanical:   '#1E88E5',
  Electrical:   '#FB8C00',
  Instruments:  '#8E24AA',
  Hydraulics:   '#00897B',
  Seals:        '#E53935',
  Fasteners:    '#F4511E',
  Electronics:  '#3949AB',
  Other:        '#757575',
};

const EMPTY = { partName: '', partNumber: '', category: 'Mechanical', manufacturer: '', unit: 'Nos', description: '' };

const PartMasterScreen = ({ navigation }) => {
  const { parts, addPart, updatePart, deletePart, isDarkMode } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm]   = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState('');

  const bg      = isDarkMode ? Colors.darkBackground : Colors.background;
  const cardBg  = isDarkMode ? Colors.darkCard       : Colors.white;
  const textCol = isDarkMode ? Colors.darkText       : Colors.textPrimary;
  const subCol  = isDarkMode ? Colors.darkTextSecondary : Colors.textSecondary;

  const filtered = parts.filter(p =>
    p.partName.toLowerCase().includes(search.toLowerCase()) ||
    p.partNumber.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const validate = () => {
    const e = {};
    if (!form.partName.trim())   e.partName   = 'Part name is required';
    if (!form.partNumber.trim()) e.partNumber = 'Part number is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const openAdd = () => { setForm(EMPTY); setEditId(null); setErrors({}); setModalVisible(true); };
  const openEdit = (p) => {
    setForm({ partName: p.partName, partNumber: p.partNumber, category: p.category, manufacturer: p.manufacturer || '', unit: p.unit, description: p.description || '' });
    setEditId(p.id); setErrors({}); setModalVisible(true);
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editId) updatePart(editId, form);
    else addPart(form);
    setModalVisible(false);
  };

  const handleDelete = (id, name) => {
    Alert.alert('Delete Part', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deletePart(id) },
    ]);
  };

  const set = (key) => (val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  return (
    <View style={[styles.screen, { backgroundColor: bg }]}>
      <Header
        title="Part Master"
        subtitle={`${parts.length} parts`}
        onBack={() => navigation.goBack()}
        darkMode={isDarkMode}
        rightAction={
          <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
            <Ionicons name="add" size={22} color={Colors.white} />
          </TouchableOpacity>
        }
      />

      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: cardBg }]}>
        <Ionicons name="search-outline" size={18} color={Colors.grey500} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.searchInput, { color: textCol }]}
          placeholder="Search parts, numbers, categories…"
          placeholderTextColor={Colors.grey400}
          value={search}
          onChangeText={setSearch}
        />
        {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color={Colors.grey400} /></TouchableOpacity> : null}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 32 }}
        ListEmptyComponent={<EmptyState icon="construct-outline" title="No Parts Found" subtitle="Tap + to add a new part" darkMode={isDarkMode} />}
        renderItem={({ item }) => {
          const catColor = CATEGORY_COLORS[item.category] || Colors.grey500;
          return (
            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <View style={[styles.catDot, { backgroundColor: catColor }]} />
              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.name, { color: textCol }]}>{item.partName}</Text>
                    <Text style={[styles.partNum, { color: Colors.primary }]}>#{item.partNumber}</Text>
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                      <Ionicons name="pencil-outline" size={16} color={Colors.info} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.delBtn} onPress={() => handleDelete(item.id, item.partName)}>
                      <Ionicons name="trash-outline" size={16} color={Colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.chips}>
                  <Badge label={item.category} color={catColor} size="sm" />
                  <Badge label={item.unit} color={Colors.grey600} size="sm" />
                  {item.manufacturer ? <Badge label={item.manufacturer} color={Colors.accent} size="sm" /> : null}
                </View>
                {item.description ? <Text style={[styles.desc, { color: subCol }]} numberOfLines={2}>{item.description}</Text> : null}
              </View>
            </View>
          );
        }}
      />

      {/* Form Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white }]}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: textCol }]}>{editId ? 'Edit Part' : 'Add Part'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.grey600} />
              </TouchableOpacity>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Input label="Part Name"   value={form.partName}   onChangeText={set('partName')}   placeholder="e.g. Hydraulic Pump" error={errors.partName}   darkMode={isDarkMode} required />
              <Input label="Part Number" value={form.partNumber} onChangeText={set('partNumber')} placeholder="e.g. HP-001"          error={errors.partNumber} darkMode={isDarkMode} required autoCapitalize="characters" />
              <PickerSelect label="Category"     value={form.category}     onValueChange={set('category')}     items={CATEGORIES} darkMode={isDarkMode} />
              <Input label="Manufacturer" value={form.manufacturer} onChangeText={set('manufacturer')} placeholder="e.g. Bosch" darkMode={isDarkMode} />
              <PickerSelect label="Unit"         value={form.unit}         onValueChange={set('unit')}         items={UNITS}      darkMode={isDarkMode} />
              <Input label="Description" value={form.description} onChangeText={set('description')} placeholder="Optional description" multiline numberOfLines={3} darkMode={isDarkMode} />
              <Button title={editId ? 'Update Part' : 'Add Part'} onPress={handleSave} style={{ marginTop: 8 }} />
              <Button title="Cancel" onPress={() => setModalVisible(false)} variant="outline" style={{ marginTop: 10, marginBottom: 8 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen:      { flex: 1 },
  addBtn:      { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  searchWrap:  { flexDirection: 'row', alignItems: 'center', margin: 16, marginBottom: 0, borderRadius: BorderRadius.md, paddingHorizontal: 14, paddingVertical: 10, ...Shadow.small },
  searchInput: { flex: 1, fontSize: 14 },
  card:        { flexDirection: 'row', borderRadius: BorderRadius.md, overflow: 'hidden', ...Shadow.small },
  catDot:      { width: 5 },
  cardBody:    { flex: 1, padding: 14 },
  cardTop:     { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  name:        { fontSize: 15, fontWeight: '700' },
  partNum:     { fontSize: 12, fontWeight: '600', marginTop: 2 },
  chips:       { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  desc:        { fontSize: 12, marginTop: 4, lineHeight: 18 },
  actions:     { flexDirection: 'row', gap: 8 },
  editBtn:     { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.infoLight,   alignItems: 'center', justifyContent: 'center' },
  delBtn:      { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.dangerLight, alignItems: 'center', justifyContent: 'center' },
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet:       { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, ...Shadow.large, maxHeight: '90%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sheetTitle:  { fontSize: 18, fontWeight: '800' },
});

export default PartMasterScreen;
