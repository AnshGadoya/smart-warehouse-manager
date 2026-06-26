// screens/Inventory/RemoveInventoryScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert,
  TouchableOpacity, Modal, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useApp } from '../../context/AppContext';
import Header from '../../components/Header';
import Input from '../../components/Input';
import Button from '../../components/Button';
import LoadingOverlay from '../../components/LoadingOverlay';
import EmptyState from '../../components/EmptyState';
import { Colors, BorderRadius, Shadow } from '../../styles/theme';
import { formatDate, getExpiryStatus } from '../../utils/helpers';

const RemoveInventoryScreen = ({ navigation }) => {
  const {
    racks, inventory, parts, locations, stores,
    removeInventoryQty, isDarkMode,
  } = useApp();

  const [permission, requestPermission] = useCameraPermissions();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanned,     setScanned]     = useState(false);
  const [scannedRack, setScannedRack] = useState(null);
  const [rackInventory, setRackInventory] = useState([]);
  const [selectedItem,  setSelectedItem]  = useState(null);
  const [removeQty, setRemoveQty] = useState('');
  const [loading,   setLoading]   = useState(false);

  const bg     = isDarkMode ? Colors.darkBackground : Colors.background;
  const cardBg = isDarkMode ? Colors.darkCard : Colors.white;
  const textCol = isDarkMode ? Colors.darkText : Colors.textPrimary;
  const subCol  = isDarkMode ? Colors.darkTextSecondary : Colors.textSecondary;

  const openScanner = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) { Alert.alert('Camera Permission', 'Camera access required.'); return; }
    }
    setScanned(false);
    setScannerOpen(true);
  };

  const handleBarCodeScanned = ({ data }) => {
    if (scanned) return;
    setScanned(true);
    setScannerOpen(false);

    const rack = racks.find(r => r.qrCode === data);
    if (!rack) {
      Alert.alert('Unknown QR', 'No rack found for this QR code.', [
        { text: 'Scan Again', onPress: () => { setScanned(false); setScannerOpen(true); } },
        { text: 'Cancel' },
      ]);
      return;
    }
    const items = inventory.filter(i => i.rackId === rack.id);
    setScannedRack(rack);
    setRackInventory(items);
    setSelectedItem(null);
    setRemoveQty('');
  };

  const handleRemove = async () => {
    const qty = Number(removeQty);
    if (!qty || qty <= 0) { Alert.alert('Error', 'Enter a valid quantity.'); return; }
    if (qty > selectedItem.quantity) {
      Alert.alert('Error', `Cannot remove more than available quantity (${selectedItem.quantity}).`);
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    removeInventoryQty(selectedItem.id, qty);
    setLoading(false);

    // Refresh rack inventory list
    const updated = inventory.filter(i => i.rackId === scannedRack.id && i.id !== selectedItem.id);
    if (qty < selectedItem.quantity) {
      updated.push({ ...selectedItem, quantity: selectedItem.quantity - qty });
    }
    setRackInventory(updated.sort((a,b) => new Date(a.useByDate) - new Date(b.useByDate)));
    setSelectedItem(null);
    setRemoveQty('');
    Alert.alert('✅ Done', `Removed ${qty} unit(s) successfully.`);
  };

  const reset = () => {
    setScannedRack(null); setRackInventory([]); setSelectedItem(null); setRemoveQty('');
  };

  return (
    <View style={[styles.screen, { backgroundColor: bg }]}>
      <Header title="Remove Inventory" onBack={() => navigation.goBack()} darkMode={isDarkMode} />
      {loading && <LoadingOverlay message="Removing inventory…" />}

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">

        {/* Scan button */}
        {!scannedRack ? (
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <View style={styles.scanIllustration}>
              <Ionicons name="qr-code-outline" size={80} color={Colors.primary + '60'} />
            </View>
            <Text style={[styles.scanTitle, { color: textCol }]}>Scan Rack QR Code</Text>
            <Text style={[styles.scanSub, { color: subCol }]}>
              Point your camera at the QR code printed on the rack to view its inventory.
            </Text>
            <Button title="📷 Open Scanner" onPress={openScanner} size="lg" style={{ marginTop: 20 }} />
          </View>
        ) : (
          <>
            {/* Rack Info */}
            <View style={[styles.rackCard, { backgroundColor: Colors.primary }]}>
              <View style={styles.rackCardRow}>
                <View>
                  <Text style={styles.rackCardName}>{scannedRack.rackName}</Text>
                  <Text style={styles.rackCardCode}>{scannedRack.rackCode} • {scannedRack.level}</Text>
                </View>
                <View style={styles.rackCardCap}>
                  <Text style={styles.rackCapNum}>{scannedRack.currentCapacity}</Text>
                  <Text style={styles.rackCapLabel}>/ {scannedRack.maxCapacity}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.rescanBtn} onPress={() => { reset(); openScanner(); }}>
                <Ionicons name="refresh" size={14} color={Colors.white} />
                <Text style={styles.rescanText}>Scan Different Rack</Text>
              </TouchableOpacity>
            </View>

            {/* Inventory List */}
            <Text style={[styles.sectionTitle, { color: textCol }]}>Items in this Rack</Text>
            {rackInventory.length === 0 ? (
              <View style={[styles.card, { backgroundColor: cardBg }]}>
                <EmptyState icon="cube-outline" title="No Inventory" subtitle="This rack is empty." darkMode={isDarkMode} />
              </View>
            ) : (
              rackInventory.map(item => {
                const part   = parts.find(p => p.id === item.partId);
                const expiry = getExpiryStatus(item.useByDate);
                const isSelected = selectedItem?.id === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.itemCard, { backgroundColor: cardBg }, isSelected && styles.itemCardSelected]}
                    onPress={() => { setSelectedItem(item); setRemoveQty(''); }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.itemRow}>
                      <View style={styles.itemBody}>
                        <Text style={[styles.itemName, { color: textCol }]}>{part?.partName || 'Unknown'}</Text>
                        <Text style={[styles.itemPn, { color: subCol }]}>PN: {part?.partNumber || 'N/A'}</Text>
                        <View style={styles.itemMeta}>
                          <View style={[styles.expiryBadge, { backgroundColor: expiry.color + '22' }]}>
                            <Text style={[styles.expiryBadgeText, { color: expiry.color }]}>{expiry.label}</Text>
                          </View>
                          <Text style={[styles.itemDate, { color: subCol }]}>{formatDate(item.useByDate)}</Text>
                        </View>
                      </View>
                      <View style={styles.itemQty}>
                        <Text style={[styles.itemQtyNum, { color: textCol }]}>{item.quantity}</Text>
                        <Text style={[styles.itemQtyLabel, { color: subCol }]}>units</Text>
                      </View>
                    </View>

                    {/* Remove form – shown only for selected item */}
                    {isSelected && (
                      <View style={styles.removeForm}>
                        <View style={styles.divider} />
                        <Text style={[styles.removeLabel, { color: textCol }]}>Quantity to Remove</Text>
                        <View style={styles.removeRow}>
                          <Input
                            value={removeQty}
                            onChangeText={setRemoveQty}
                            placeholder={`Max: ${item.quantity}`}
                            keyboardType="numeric"
                            style={{ flex: 1, marginBottom: 0, marginRight: 10 }}
                            darkMode={isDarkMode}
                          />
                          <Button title="Remove" onPress={handleRemove} variant="danger" size="md" />
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </>
        )}
      </ScrollView>

      {/* Scanner Modal */}
      <Modal visible={scannerOpen} animationType="slide" onRequestClose={() => setScannerOpen(false)}>
        <View style={styles.scannerScreen}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          />
          <View style={styles.scanOverlay}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
            <Text style={styles.scanHint}>Scan rack QR code</Text>
          </View>
          <TouchableOpacity style={styles.scanClose} onPress={() => setScannerOpen(false)}>
            <Ionicons name="close-circle" size={44} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  card: { borderRadius: BorderRadius.lg, padding: 20, ...Shadow.medium, marginBottom: 12, alignItems: 'center' },
  scanIllustration: { marginBottom: 16 },
  scanTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  scanSub:   { fontSize: 13, textAlign: 'center', lineHeight: 20 },

  rackCard: { borderRadius: BorderRadius.lg, padding: 16, marginBottom: 12, ...Shadow.medium },
  rackCardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  rackCardName: { fontSize: 18, fontWeight: '800', color: Colors.white },
  rackCardCode: { fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 4 },
  rackCardCap:  { alignItems: 'center' },
  rackCapNum:   { fontSize: 26, fontWeight: '800', color: Colors.white },
  rackCapLabel: { fontSize: 11, color: 'rgba(255,255,255,0.72)' },
  rescanBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99 },
  rescanText: { fontSize: 12, color: Colors.white, fontWeight: '600' },

  sectionTitle: { fontSize: 14, fontWeight: '800', marginBottom: 10 },

  itemCard: { borderRadius: BorderRadius.md, padding: 14, marginBottom: 8, ...Shadow.small },
  itemCardSelected: { borderWidth: 2, borderColor: Colors.primary },
  itemRow: { flexDirection: 'row', alignItems: 'flex-start' },
  itemBody: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '700' },
  itemPn:   { fontSize: 12, marginTop: 2 },
  itemMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  expiryBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  expiryBadgeText: { fontSize: 10, fontWeight: '700' },
  itemDate: { fontSize: 11 },
  itemQty:  { alignItems: 'center', marginLeft: 12 },
  itemQtyNum:   { fontSize: 22, fontWeight: '800', color: Colors.primary },
  itemQtyLabel: { fontSize: 11 },

  removeForm:  { marginTop: 10 },
  divider:     { height: 1, backgroundColor: Colors.grey200, marginBottom: 12 },
  removeLabel: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  removeRow:   { flexDirection: 'row', alignItems: 'flex-end' },

  scannerScreen: { flex: 1, backgroundColor: '#000' },
  scanOverlay:   { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  scanFrame:     { width: 240, height: 240, borderRadius: 16, position: 'relative' },
  corner:  { position: 'absolute', width: 36, height: 36, borderColor: Colors.accent, borderWidth: 4 },
  cornerTL: { top: 0, left: 0,   borderBottomWidth: 0, borderRightWidth: 0,  borderTopLeftRadius: 12 },
  cornerTR: { top: 0, right: 0,  borderBottomWidth: 0, borderLeftWidth: 0,   borderTopRightRadius: 12 },
  cornerBL: { bottom: 0, left: 0,  borderTopWidth: 0,  borderRightWidth: 0,  borderBottomLeftRadius: 12 },
  cornerBR: { bottom: 0, right: 0, borderTopWidth: 0,  borderLeftWidth: 0,   borderBottomRightRadius: 12 },
  scanHint:  { color: Colors.white, fontSize: 13, marginTop: 24, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 99 },
  scanClose: { position: 'absolute', top: 52, right: 20 },
});

export default RemoveInventoryScreen;
