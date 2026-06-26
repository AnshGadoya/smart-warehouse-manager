// screens/Masters/LocationMasterScreen.js
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
import { Colors, BorderRadius, Shadow } from '../../styles/theme';

const EMPTY = { locationName: '', locationCode: '', storeId: '' };

const LocationMasterScreen = ({ navigation }) => {
  const { locations, stores, addLocation, updateLocation, deleteLocation, isDarkMode } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState('');

  const bg      = isDarkMode ? Colors.darkBackground : Colors.background;
  const cardBg  = isDarkMode ? Colors.darkCard       : Colors.white;
  const textCol = isDarkMode ? Colors.darkText       : Colors.textPrimary;
  const subCol  = isDarkMode ? Colors.darkTextSecondary : Colors.textSecondary;

  const storeItems = stores.map(s => ({ label: `${s.storeName} (${s.storeCode})`, value: s.id }));

  const filtered = locations.filter(l =>
    l.locationName.toLowerCase().includes(search.toLowerCase()) ||
    l.locationCode.toLowerCase().includes(search.toLowerCase())
  );

  const validate = () => {
    const e = {};
    if (!form.locationName.trim()) e.locationName = 'Location name is required';
    if (!form.locationCode.trim()) e.locationCode = 'Location code is required';
    if (!form.storeId)             e.storeId      = 'Please select a store';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const openAdd  = () => { setForm(EMPTY); setEditId(null); setErrors({}); setModalVisible(true); };
  const openEdit = (l) => {
    setForm({ locationName: l.locationName, locationCode: l.locationCode, storeId: l.storeId });
    setEditId(l.id); setErrors({}); setModalVisible(true);
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editId) updateLocation(editId, form);
    else addLocation(form);
    setModalVisible(false);
  };

  const handleDelete = (id, name) => {
    Alert.alert('Delete Location', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteLocation(id) },
    ]);
  };

  const set = (key) => (val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  const getStoreName = (storeId) => stores.find(s => s.id === storeId)?.storeName || '—';

  return (
    <View style={[styles.screen, { backgroundColor: bg }]}>
      <Header
        title="Location Master"
        subtitle={`${locations.length} locations`}
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
          placeholder="Search locations…"
          placeholderTextColor={Colors.grey400}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.grey400} />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 32 }}
        ListEmptyComponent={
          <EmptyState icon="location-outline" title="No Locations Found" subtitle="Tap + to add a new location" darkMode={isDarkMode} />
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <View style={styles.cardLeft}>
              <View style={styles.iconBox}>
                <Ionicons name="location" size={22} color={Colors.accent} />
              </View>
              <View style={styles.cardBody}>
                <Text style={[styles.name, { color: textCol }]}>{item.locationName}</Text>
                <Text style={[styles.code, { color: subCol }]}>Code: {item.locationCode}</Text>
                <View style={styles.storeChip}>
                  <Ionicons name="business-outline" size={11} color={Colors.primary} />
                  <Text style={styles.storeChipText}>{getStoreName(item.storeId)}</Text>
                </View>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                <Ionicons name="pencil-outline" size={18} color={Colors.info} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.delBtn} onPress={() => handleDelete(item.id, item.locationName)}>
                <Ionicons name="trash-outline" size={18} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Form Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white }]}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: textCol }]}>
                {editId ? 'Edit Location' : 'Add Location'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.grey600} />
              </TouchableOpacity>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Input
                label="Location Name" value={form.locationName}
                onChangeText={set('locationName')} placeholder="e.g. Zone A"
                error={errors.locationName} darkMode={isDarkMode} required
              />
              <Input
                label="Location Code" value={form.locationCode}
                onChangeText={set('locationCode')} placeholder="e.g. ZA01"
                error={errors.locationCode} darkMode={isDarkMode} required
                autoCapitalize="characters"
              />
              <PickerSelect
                label="Select Store" value={form.storeId}
                onValueChange={set('storeId')} items={storeItems}
                placeholder="Choose a store…" error={errors.storeId}
                darkMode={isDarkMode} required
              />
              <Button title={editId ? 'Update Location' : 'Add Location'} onPress={handleSave} style={{ marginTop: 8 }} />
              <Button title="Cancel" onPress={() => setModalVisible(false)} variant="outline" style={{ marginTop: 10 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen:     { flex: 1 },
  addBtn:     { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', margin: 16, marginBottom: 0, borderRadius: BorderRadius.md, paddingHorizontal: 14, paddingVertical: 10, ...Shadow.small },
  searchInput:{ flex: 1, fontSize: 14 },
  card:       { flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.md, padding: 14, ...Shadow.small },
  cardLeft:   { flex: 1, flexDirection: 'row', alignItems: 'center' },
  iconBox:    { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.accent + '18', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardBody:   { flex: 1 },
  name:       { fontSize: 15, fontWeight: '700' },
  code:       { fontSize: 12, marginTop: 2 },
  storeChip:  { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5, backgroundColor: Colors.primary + '12', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, alignSelf: 'flex-start' },
  storeChipText: { fontSize: 11, color: Colors.primary, fontWeight: '600' },
  actions:    { flexDirection: 'row', gap: 8 },
  editBtn:    { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.infoLight,   alignItems: 'center', justifyContent: 'center' },
  delBtn:     { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.dangerLight, alignItems: 'center', justifyContent: 'center' },
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet:      { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, ...Shadow.large, maxHeight: '85%' },
  sheetHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '800' },
});

export default LocationMasterScreen;
