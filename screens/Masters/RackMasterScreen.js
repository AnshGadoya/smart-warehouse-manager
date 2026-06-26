// screens/Masters/RackMasterScreen.js
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, Modal, ScrollView, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useApp } from '../../context/AppContext';
import Header from '../../components/Header';
import Input from '../../components/Input';
import Button from '../../components/Button';
import PickerSelect from '../../components/PickerSelect';
import EmptyState from '../../components/EmptyState';
import Badge from '../../components/Badge';
import { Colors, BorderRadius, Shadow } from '../../styles/theme';
import { getRackColor, getRackFillPercent, getLevelColor } from '../../utils/helpers';

const EMPTY = { rackName: '', rackCode: '', storeId: '', locationId: '', level: 'TOP', maxCapacity: '', status: 'Active' };
const LEVELS  = [{ label: 'TOP',    value: 'TOP' }, { label: 'MIDDLE', value: 'MIDDLE' }, { label: 'BOTTOM', value: 'BOTTOM' }];
const STATUSES = [{ label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }];

const RackMasterScreen = ({ navigation }) => {
  const { racks, stores, locations, getLocationsByStore, addRack, updateRack, deleteRack, isDarkMode } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [qrModal, setQrModal] = useState(false);
  const [selectedRack, setSelectedRack] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState('');

  const bg      = isDarkMode ? Colors.darkBackground : Colors.background;
  const cardBg  = isDarkMode ? Colors.darkCard       : Colors.white;
  const textCol = isDarkMode ? Colors.darkText       : Colors.textPrimary;
  const subCol  = isDarkMode ? Colors.darkTextSecondary : Colors.textSecondary;

  const storeItems    = stores.map(s => ({ label: `${s.storeName} (${s.storeCode})`, value: s.id }));
  const locationItems = form.storeId
    ? getLocationsByStore(form.storeId).map(l => ({ label: `${l.locationName} (${l.locationCode})`, value: l.id }))
    : [];

  const filtered = racks.filter(r =>
    r.rackName.toLowerCase().includes(search.toLowerCase()) ||
    r.rackCode.toLowerCase().includes(search.toLowerCase())
  );

  const validate = () => {
    const e = {};
    if (!form.rackName.trim())  e.rackName    = 'Rack name is required';
    if (!form.rackCode.trim())  e.rackCode    = 'Rack code is required';
    if (!form.storeId)          e.storeId     = 'Please select a store';
    if (!form.locationId)       e.locationId  = 'Please select a location';
    if (!form.maxCapacity || isNaN(Number(form.maxCapacity)) || Number(form.maxCapacity) <= 0)
      e.maxCapacity = 'Enter a valid capacity';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const openAdd = () => {
    setForm(EMPTY); setEditId(null); setErrors({}); setModalVisible(true);
  };
  const openEdit = (r) => {
    setForm({
      rackName: r.rackName, rackCode: r.rackCode,
      storeId: r.storeId, locationId: r.locationId,
      level: r.level, maxCapacity: String(r.maxCapacity), status: r.status,
    });
    setEditId(r.id); setErrors({}); setModalVisible(true);
  };
  const openQR = (r) => { setSelectedRack(r); setQrModal(true); };

  const handleSave = () => {
    if (!validate()) return;
    const payload = { ...form, maxCapacity: Number(form.maxCapacity) };
    if (editId) updateRack(editId, payload);
    else addRack(payload);
    setModalVisible(false);
  };

  const handleDelete = (id, name) => {
    Alert.alert('Delete Rack', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteRack(id) },
    ]);
  };

  const set = (key) => (val) => {
    setForm(f => {
      const next = { ...f, [key]: val };
      if (key === 'storeId') next.locationId = ''; // reset location when store changes
      return next;
    });
    setErrors(e => ({ ...e, [key]: '' }));
  };

  const getStoreName    = (id) => stores.find(s => s.id === id)?.storeName    || '—';
  const getLocationName = (id) => locations.find(l => l.id === id)?.locationName || '—';

  return (
    <View style={[styles.screen, { backgroundColor: bg }]}>
      <Header
        title="Rack Master"
        subtitle={`${racks.length} racks`}
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
          placeholder="Search racks…"
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
        ListEmptyComponent={<EmptyState icon="layers-outline" title="No Racks Found" subtitle="Tap + to add a new rack" darkMode={isDarkMode} />}
        renderItem={({ item }) => {
          const pct   = getRackFillPercent(item.currentCapacity, item.maxCapacity);
          const color = getRackColor(item.currentCapacity, item.maxCapacity);
          const lvlColor = getLevelColor(item.level);
          return (
            <View style={[styles.card, { backgroundColor: cardBg }]}>
              {/* Left colour indicator */}
              <View style={[styles.levelBar, { backgroundColor: lvlColor }]} />
              <View style={styles.cardContent}>
                <View style={styles.cardTop}>
                  <View style={styles.cardTitleRow}>
                    <Text style={[styles.name, { color: textCol }]}>{item.rackName}</Text>
                    <Badge label={item.level} color={lvlColor} size="sm" />
                  </View>
                  <Text style={[styles.code, { color: subCol }]}>Code: {item.rackCode}</Text>
                  <Text style={[styles.meta, { color: subCol }]}>
                    {getStoreName(item.storeId)} › {getLocationName(item.locationId)}
                  </Text>

                  {/* Capacity bar */}
                  <View style={styles.capRow}>
                    <View style={styles.capBarBg}>
                      <View style={[styles.capBarFill, { width: `${pct}%`, backgroundColor: color }]} />
                    </View>
                    <Text style={[styles.capText, { color }]}>{pct}%</Text>
                  </View>
                  <Text style={[styles.capDetail, { color: subCol }]}>
                    {item.currentCapacity} / {item.maxCapacity} units used
                  </Text>
                </View>

                {/* Actions */}
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.qrBtn} onPress={() => openQR(item)}>
                    <Ionicons name="qr-code-outline" size={16} color={Colors.primary} />
                    <Text style={styles.qrBtnText}>QR</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                    <Ionicons name="pencil-outline" size={16} color={Colors.info} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.delBtn} onPress={() => handleDelete(item.id, item.rackName)}>
                    <Ionicons name="trash-outline" size={16} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />

      {/* ── QR Modal ── */}
      <Modal visible={qrModal} animationType="fade" transparent onRequestClose={() => setQrModal(false)}>
        <View style={styles.overlay}>
          <View style={[styles.qrSheet, { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white }]}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: textCol }]}>Rack QR Code</Text>
              <TouchableOpacity onPress={() => setQrModal(false)}>
                <Ionicons name="close" size={24} color={Colors.grey600} />
              </TouchableOpacity>
            </View>
            {selectedRack && (
              <>
                <Text style={[styles.qrRackName, { color: textCol }]}>{selectedRack.rackName}</Text>
                <Text style={[styles.qrCode, { color: subCol }]}>Code: {selectedRack.rackCode}</Text>
                <View style={styles.qrBox}>
                  <QRCode
                    value={selectedRack.qrCode}
                    size={200}
                    color={isDarkMode ? '#fff' : '#000'}
                    backgroundColor={isDarkMode ? Colors.darkCard : '#fff'}
                  />
                </View>
                <Text style={[styles.qrValue, { color: subCol }]}>{selectedRack.qrCode}</Text>
                <View style={styles.qrMeta}>
                  <View style={styles.qrMetaItem}>
                    <Text style={styles.qrMetaLabel}>Level</Text>
                    <Text style={[styles.qrMetaValue, { color: getLevelColor(selectedRack.level) }]}>{selectedRack.level}</Text>
                  </View>
                  <View style={styles.qrMetaItem}>
                    <Text style={styles.qrMetaLabel}>Capacity</Text>
                    <Text style={[styles.qrMetaValue, { color: textCol }]}>{selectedRack.maxCapacity}</Text>
                  </View>
                  <View style={styles.qrMetaItem}>
                    <Text style={styles.qrMetaLabel}>Status</Text>
                    <Text style={[styles.qrMetaValue, { color: selectedRack.status === 'Active' ? Colors.success : Colors.danger }]}>{selectedRack.status}</Text>
                  </View>
                </View>
                <Text style={[styles.qrHint, { color: subCol }]}>
                  📋 Print this QR and attach it to the rack for scanning
                </Text>
                <Button title="Close" onPress={() => setQrModal(false)} variant="outline" style={{ marginTop: 4 }} />
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ── Form Modal ── */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white }]}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: textCol }]}>{editId ? 'Edit Rack' : 'Add Rack'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.grey600} />
              </TouchableOpacity>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Input label="Rack Name" value={form.rackName} onChangeText={set('rackName')} placeholder="e.g. Rack A1" error={errors.rackName} darkMode={isDarkMode} required />
              <Input label="Rack Code" value={form.rackCode} onChangeText={set('rackCode')} placeholder="e.g. RA01" error={errors.rackCode} darkMode={isDarkMode} required autoCapitalize="characters" />
              <PickerSelect label="Select Store" value={form.storeId} onValueChange={set('storeId')} items={storeItems} placeholder="Choose store…" error={errors.storeId} darkMode={isDarkMode} required />
              <PickerSelect label="Select Location" value={form.locationId} onValueChange={set('locationId')} items={locationItems} placeholder={form.storeId ? 'Choose location…' : 'Select store first'} error={errors.locationId} darkMode={isDarkMode} required disabled={!form.storeId} />
              <PickerSelect label="Rack Level" value={form.level} onValueChange={set('level')} items={LEVELS} darkMode={isDarkMode} />
              <Input label="Maximum Capacity" value={form.maxCapacity} onChangeText={set('maxCapacity')} placeholder="e.g. 100" keyboardType="numeric" error={errors.maxCapacity} darkMode={isDarkMode} required />
              <PickerSelect label="Status" value={form.status} onValueChange={set('status')} items={STATUSES} darkMode={isDarkMode} />

              {/* QR Preview */}
              {!editId && form.rackCode && form.storeId && form.locationId && (
                <View style={styles.qrPreview}>
                  <Text style={[styles.qrPreviewLabel, { color: subCol }]}>QR Code Preview</Text>
                  <QRCode value={`QR-${form.rackCode}-${form.storeId}-${form.locationId}-${form.level}`} size={100} />
                  <Text style={[styles.qrPreviewValue, { color: subCol }]}>
                    QR-{form.rackCode}-{form.storeId}-{form.locationId}-{form.level}
                  </Text>
                </View>
              )}

              <Button title={editId ? 'Update Rack' : 'Add Rack'} onPress={handleSave} style={{ marginTop: 12 }} />
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
  levelBar:    { width: 5 },
  cardContent: { flex: 1, padding: 14 },
  cardTop:     { marginBottom: 10 },
  cardTitleRow:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  name:        { fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8 },
  code:        { fontSize: 12, marginTop: 2 },
  meta:        { fontSize: 11, marginTop: 3 },
  capRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  capBarBg:    { flex: 1, height: 6, backgroundColor: Colors.grey200, borderRadius: 99, overflow: 'hidden' },
  capBarFill:  { height: '100%', borderRadius: 99 },
  capText:     { fontSize: 11, fontWeight: '700', minWidth: 30 },
  capDetail:   { fontSize: 11, marginTop: 3 },
  cardActions: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  qrBtn:       { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primary + '18', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99 },
  qrBtnText:   { fontSize: 12, color: Colors.primary, fontWeight: '700' },
  editBtn:     { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.infoLight,   alignItems: 'center', justifyContent: 'center' },
  delBtn:      { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.dangerLight, alignItems: 'center', justifyContent: 'center' },
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet:       { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, ...Shadow.large, maxHeight: '90%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sheetTitle:  { fontSize: 18, fontWeight: '800' },
  qrSheet:     { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, ...Shadow.large, alignItems: 'center' },
  qrRackName:  { fontSize: 18, fontWeight: '800', marginBottom: 4, textAlign: 'center' },
  qrCode:      { fontSize: 13, marginBottom: 20, textAlign: 'center' },
  qrBox:       { padding: 16, backgroundColor: '#fff', borderRadius: 16, ...Shadow.medium, marginBottom: 14 },
  qrValue:     { fontSize: 12, textAlign: 'center', marginBottom: 16, fontFamily: 'monospace' },
  qrMeta:      { flexDirection: 'row', gap: 24, marginBottom: 16 },
  qrMetaItem:  { alignItems: 'center' },
  qrMetaLabel: { fontSize: 11, color: Colors.textMuted },
  qrMetaValue: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  qrHint:      { fontSize: 12, textAlign: 'center', marginBottom: 20, paddingHorizontal: 16 },
  qrPreview:   { alignItems: 'center', padding: 16, backgroundColor: Colors.grey100, borderRadius: BorderRadius.md, marginBottom: 12 },
  qrPreviewLabel: { fontSize: 12, fontWeight: '600', marginBottom: 10 },
  qrPreviewValue: { fontSize: 10, marginTop: 8, fontFamily: 'monospace' },
});

export default RackMasterScreen;
