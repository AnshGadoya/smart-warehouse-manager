// screens/Masters/StoreMasterScreen.js
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
import EmptyState from '../../components/EmptyState';
import { Colors, BorderRadius, Shadow } from '../../styles/theme';

const EMPTY = { storeName: '', storeCode: '', description: '' };

const StoreMasterScreen = ({ navigation }) => {
  const { stores, addStore, updateStore, deleteStore, isDarkMode } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState('');

  const bg = isDarkMode ? Colors.darkBackground : Colors.background;
  const cardBg = isDarkMode ? Colors.darkCard : Colors.white;
  const textCol = isDarkMode ? Colors.darkText : Colors.textPrimary;
  const subCol  = isDarkMode ? Colors.darkTextSecondary : Colors.textSecondary;

  const filtered = stores.filter(s =>
    s.storeName.toLowerCase().includes(search.toLowerCase()) ||
    s.storeCode.toLowerCase().includes(search.toLowerCase())
  );

  const validate = () => {
    const e = {};
    if (!form.storeName.trim()) e.storeName = 'Store name is required';
    if (!form.storeCode.trim()) e.storeCode = 'Store code is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const openAdd = () => { setForm(EMPTY); setEditId(null); setErrors({}); setModalVisible(true); };
  const openEdit = (s) => { setForm({ storeName: s.storeName, storeCode: s.storeCode, description: s.description || '' }); setEditId(s.id); setErrors({}); setModalVisible(true); };

  const handleSave = () => {
    if (!validate()) return;
    if (editId) updateStore(editId, form);
    else addStore(form);
    setModalVisible(false);
  };

  const handleDelete = (id, name) => {
    Alert.alert('Delete Store', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteStore(id) },
    ]);
  };

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <View style={[styles.screen, { backgroundColor: bg }]}>
      <Header
        title="Store Master"
        subtitle={`${stores.length} stores`}
        onBack={() => navigation.goBack()}
        darkMode={isDarkMode}
        rightAction={
          <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
            <Ionicons name="add" size={22} color={Colors.white} />
          </TouchableOpacity>
        }
      />

      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white }]}>
        <Ionicons name="search-outline" size={18} color={Colors.grey500} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.searchInput, { color: textCol }]}
          placeholder="Search stores…"
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
        ListEmptyComponent={<EmptyState icon="business-outline" title="No Stores Found" subtitle="Tap + to add a new store" darkMode={isDarkMode} />}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <View style={styles.cardLeft}>
              <View style={styles.iconBox}>
                <Ionicons name="business" size={22} color={Colors.primary} />
              </View>
              <View style={styles.cardBody}>
                <Text style={[styles.name, { color: textCol }]}>{item.storeName}</Text>
                <Text style={[styles.code, { color: subCol }]}>Code: {item.storeCode}</Text>
                {item.description ? <Text style={[styles.desc, { color: subCol }]} numberOfLines={1}>{item.description}</Text> : null}
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                <Ionicons name="pencil-outline" size={18} color={Colors.info} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.delBtn} onPress={() => handleDelete(item.id, item.storeName)}>
                <Ionicons name="trash-outline" size={18} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Form Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textCol }]}>{editId ? 'Edit Store' : 'Add Store'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.grey600} />
              </TouchableOpacity>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Input label="Store Name" value={form.storeName} onChangeText={set('storeName')} placeholder="e.g. Main Warehouse" error={errors.storeName} darkMode={isDarkMode} required />
              <Input label="Store Code" value={form.storeCode} onChangeText={set('storeCode')} placeholder="e.g. MW01" error={errors.storeCode} darkMode={isDarkMode} required autoCapitalize="characters" />
              <Input label="Description" value={form.description} onChangeText={set('description')} placeholder="Optional description" multiline numberOfLines={3} darkMode={isDarkMode} />
              <Button title={editId ? 'Update Store' : 'Add Store'} onPress={handleSave} style={{ marginTop: 8 }} />
              <Button title="Cancel" onPress={() => setModalVisible(false)} variant="outline" style={{ marginTop: 10 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  addBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', margin: 16, marginBottom: 0, borderRadius: BorderRadius.md, paddingHorizontal: 14, paddingVertical: 10, ...Shadow.small },
  searchInput: { flex: 1, fontSize: 14 },
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.md, padding: 14, ...Shadow.small },
  cardLeft: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary + '18', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardBody: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700' },
  code: { fontSize: 12, marginTop: 2 },
  desc: { fontSize: 12, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8 },
  editBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.infoLight, alignItems: 'center', justifyContent: 'center' },
  delBtn:  { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.dangerLight, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, ...Shadow.large, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800' },
});

export default StoreMasterScreen;
