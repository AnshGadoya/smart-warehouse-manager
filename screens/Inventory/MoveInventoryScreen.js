// screens/Inventory/MoveInventoryScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert,
  TouchableOpacity, Modal, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useApp } from '../../context/AppContext';
import { ledApi } from '../../services/ledApi';
import Header from '../../components/Header';
import Button from '../../components/Button';
import PickerSelect from '../../components/PickerSelect';
import LoadingOverlay from '../../components/LoadingOverlay';
import EmptyState from '../../components/EmptyState';
import { Colors, BorderRadius, Shadow } from '../../styles/theme';
import { formatDate, getExpiryStatus, getRackColor, getRackFillPercent } from '../../utils/helpers';

const MoveInventoryScreen = ({ navigation }) => {
  const {
    inventory, parts, racks, locations, stores,
    isDarkMode, moveInventory,
  } = useApp();

  const [permission, requestPermission] = useCameraPermissions();
  const [selectedInv, setSelectedInv] = useState(null);
  const [destRackId,  setDestRackId]  = useState('');
  const [loading,     setLoading]     = useState(false);
  const [loadingMsg,  setLoadingMsg]  = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanned,     setScanned]     = useState(false);
  const [step, setStep] = useState(0); // 0=select item, 1=select dest, 2=scan dest

  const bg     = isDarkMode ? Colors.darkBackground : Colors.background;
  const cardBg = isDarkMode ? Colors.darkCard : Colors.white;
  const textCol = isDarkMode ? Colors.darkText : Colors.textPrimary;
  const subCol  = isDarkMode ? Colors.darkTextSecondary : Colors.textSecondary;

  const rackItems = racks
    .filter(r => r.status === 'Active' && r.id !== selectedInv?.rackId &&
                 (r.maxCapacity - r.currentCapacity) >= (selectedInv?.quantity || 0))
    .map(r => {
      const loc   = locations.find(l => l.id === r.locationId);
      const store = stores.find(s => s.id === r.storeId);
      return { label: `${r.rackName} | ${r.level} | ${loc?.locationName} | ${store?.storeName}`, value: r.id };
    });

  const handleSelectInv = (item) => { setSelectedInv(item); setDestRackId(''); setStep(1); };

  const handleProceed = async () => {
    if (!destRackId) { Alert.alert('Select Rack', 'Please select a destination rack.'); return; }
    const destRack = racks.find(r => r.id === destRackId);
    setLoading(true); setLoadingMsg('Activating LED on destination rack…');
    await ledApi.on(destRack.id, destRack.rackCode);
    setLoading(false);
    setStep(2);
  };

  const openScanner = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) { Alert.alert('Camera Permission', 'Camera access required.'); return; }
    }
    setScanned(false);
    setScannerOpen(true);
  };

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned) return;
    setScanned(true);
    setScannerOpen(false);
    const destRack = racks.find(r => r.id === destRackId);

    if (data !== destRack?.qrCode) {
      Alert.alert(
        '❌ Wrong Rack',
        `Please scan the destination rack QR code:\n${destRack?.rackName} (${destRack?.rackCode})`,
        [
          { text: 'Scan Again', onPress: () => { setScanned(false); setScannerOpen(true); } },
          { text: 'Cancel' },
        ]
      );
      return;
    }
    setLoading(true); setLoadingMsg('Moving inventory…');
    await new Promise(r => setTimeout(r, 500));
    moveInventory(selectedInv.id, destRackId);
    await ledApi.off(destRack.id, destRack.rackCode);
    setLoading(false);
    Alert.alert(
      '✅ Inventory Moved',
      `Successfully moved to ${destRack.rackName}.\nLED has been turned OFF.`,
      [{ text: 'Done', onPress: () => navigation.goBack() }]
    );
  };

  const srcRack = racks.find(r => r.id === selectedInv?.rackId);
  const destRack = racks.find(r => r.id === destRackId);

  return (
    <View style={[styles.screen, { backgroundColor: bg }]}>
      <Header title="Move Inventory" onBack={() => navigation.goBack()} darkMode={isDarkMode} />
      {loading && <LoadingOverlay message={loadingMsg} />}

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">

        {/* STEP 0: Pick inventory item */}
        {step === 0 && (
          <>
            <View style={[styles.infoBox, { backgroundColor: Colors.infoLight }]}>
              <Ionicons name="information-circle-outline" size={18} color={Colors.info} />
              <Text style={styles.infoText}>Select the inventory item you want to move to a different rack.</Text>
            </View>
            {inventory.length === 0
              ? <View style={[styles.card, { backgroundColor: cardBg }]}>
                  <EmptyState icon="cube-outline" title="No Inventory" subtitle="No inventory entries found." darkMode={isDarkMode} />
                </View>
              : inventory.map(item => {
                  const part   = parts.find(p => p.id === item.partId);
                  const rack   = racks.find(r => r.id === item.rackId);
                  const expiry = getExpiryStatus(item.useByDate);
                  return (
                    <TouchableOpacity key={item.id} style={[styles.invCard, { backgroundColor: cardBg }]} onPress={() => handleSelectInv(item)} activeOpacity={0.8}>
                      <View style={styles.invBody}>
                        <Text style={[styles.invName, { color: textCol }]}>{part?.partName || 'Unknown'}</Text>
                        <Text style={[styles.invMeta, { color: subCol }]}>
                          {rack?.rackName} • {rack?.level} • Qty: {item.quantity}
                        </Text>
                        <View style={styles.invRow}>
                          <View style={[styles.badge, { backgroundColor: expiry.color + '22' }]}>
                            <Text style={[styles.badgeText, { color: expiry.color }]}>{expiry.label}</Text>
                          </View>
                          <Text style={[styles.invDate, { color: subCol }]}>{formatDate(item.useByDate)}</Text>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={Colors.grey400} />
                    </TouchableOpacity>
                  );
                })
            }
          </>
        )}

        {/* STEP 1: Select destination */}
        {step === 1 && selectedInv && (
          <>
            {/* Selected item summary */}
            <View style={[styles.selectedCard, { backgroundColor: Colors.primary }]}>
              <Text style={styles.selectedLabel}>Moving:</Text>
              <Text style={styles.selectedName}>{parts.find(p=>p.id===selectedInv.partId)?.partName}</Text>
              <Text style={styles.selectedMeta}>
                From: {srcRack?.rackName} ({srcRack?.level}) • Qty: {selectedInv.quantity}
              </Text>
            </View>

            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <Text style={[styles.cardTitle, { color: textCol }]}>Select Destination Rack</Text>
              <Text style={[styles.cardSub, { color: subCol }]}>Only racks with sufficient capacity are shown.</Text>
              {rackItems.length === 0
                ? <Text style={[styles.noRack, { color: subCol }]}>No eligible racks available.</Text>
                : <PickerSelect
                    label="Destination Rack"
                    value={destRackId}
                    onValueChange={setDestRackId}
                    items={rackItems}
                    placeholder="Select destination rack…"
                    darkMode={isDarkMode}
                    required
                  />
              }

              {destRack && (
                <View style={[styles.destPreview, { backgroundColor: Colors.success + '15' }]}>
                  <Ionicons name="layers-outline" size={20} color={Colors.success} />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={[styles.destName, { color: textCol }]}>{destRack.rackName}</Text>
                    <Text style={[styles.destMeta, { color: subCol }]}>
                      {destRack.level} • Available: {destRack.maxCapacity - destRack.currentCapacity}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.btnRow}>
                <Button title="← Back" onPress={() => setStep(0)} variant="outline" style={{ flex: 1 }} />
                <Button title="Light LED & Continue →" onPress={handleProceed} style={{ flex: 2 }} disabled={!destRackId} />
              </View>
            </View>
          </>
        )}

        {/* STEP 2: Scan destination QR */}
        {step === 2 && destRack && (
          <>
            <View style={[styles.ledBox]}>
              <View style={styles.ledDotWrap}>
                <View style={styles.ledDot} />
              </View>
              <Text style={styles.ledText}>LED ON → {destRack.rackName}</Text>
            </View>

            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <View style={styles.scanCenter}>
                <Ionicons name="qr-code-outline" size={64} color={Colors.primary + '70'} />
              </View>
              <Text style={[styles.cardTitle, { color: textCol, textAlign: 'center' }]}>Confirm Destination</Text>
              <Text style={[styles.cardSub, { color: subCol, textAlign: 'center' }]}>
                Go to {destRack.rackName} (glowing LED) and scan its QR code.
              </Text>
              <View style={[styles.qrBox, { borderColor: Colors.primary + '40' }]}>
                <Text style={[styles.qrLabel, { color: subCol }]}>Expected QR:</Text>
                <Text style={[styles.qrCode, { color: Colors.primary }]}>{destRack.qrCode}</Text>
              </View>
              <Button title="📷 Scan Destination QR" onPress={openScanner} size="lg" style={{ marginBottom: 10 }} />
              <Button title="← Back" onPress={() => setStep(1)} variant="outline" />
            </View>
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
            <Text style={styles.scanHint}>Scan destination rack QR code</Text>
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
  card: { borderRadius: BorderRadius.lg, padding: 18, ...Shadow.medium, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 6 },
  cardSub:   { fontSize: 13, marginBottom: 14 },
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: BorderRadius.sm, marginBottom: 12 },
  infoText: { flex: 1, fontSize: 12, color: Colors.info },

  invCard: { flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.md, padding: 14, marginBottom: 8, ...Shadow.small },
  invBody: { flex: 1 },
  invName: { fontSize: 14, fontWeight: '700' },
  invMeta: { fontSize: 12, marginTop: 3 },
  invRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  badge:   { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  invDate: { fontSize: 11 },

  selectedCard: { borderRadius: BorderRadius.lg, padding: 16, marginBottom: 12, ...Shadow.medium },
  selectedLabel:{ fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '600' },
  selectedName: { fontSize: 18, fontWeight: '800', color: Colors.white, marginTop: 2 },
  selectedMeta: { fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 4 },

  noRack: { textAlign: 'center', padding: 20, fontSize: 13 },
  destPreview: { flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.sm, padding: 12, marginBottom: 16 },
  destName: { fontSize: 14, fontWeight: '700' },
  destMeta: { fontSize: 12, marginTop: 2 },
  btnRow: { flexDirection: 'row', gap: 10 },

  ledBox: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.warning + '22', borderRadius: BorderRadius.md, padding: 14, marginBottom: 12 },
  ledDotWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.warning + '40', alignItems: 'center', justifyContent: 'center' },
  ledDot: { width: 18, height: 18, borderRadius: 9, backgroundColor: Colors.warning },
  ledText: { fontSize: 14, fontWeight: '700', color: Colors.warning },

  scanCenter: { alignItems: 'center', marginBottom: 14 },
  qrBox: { borderWidth: 1.5, borderRadius: BorderRadius.sm, padding: 14, alignItems: 'center', marginBottom: 16 },
  qrLabel: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
  qrCode:  { fontSize: 12, fontWeight: '700' },

  scannerScreen: { flex: 1, backgroundColor: '#000' },
  scanOverlay:   { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  scanFrame:     { width: 240, height: 240, borderRadius: 16, position: 'relative' },
  corner:   { position: 'absolute', width: 36, height: 36, borderColor: Colors.accent, borderWidth: 4 },
  cornerTL: { top: 0, left: 0,    borderBottomWidth: 0, borderRightWidth: 0, borderTopLeftRadius: 12 },
  cornerTR: { top: 0, right: 0,   borderBottomWidth: 0, borderLeftWidth: 0,  borderTopRightRadius: 12 },
  cornerBL: { bottom: 0, left: 0,  borderTopWidth: 0,  borderRightWidth: 0,  borderBottomLeftRadius: 12 },
  cornerBR: { bottom: 0, right: 0, borderTopWidth: 0,  borderLeftWidth: 0,   borderBottomRightRadius: 12 },
  scanHint: { color: Colors.white, fontSize: 13, marginTop: 24, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 99 },
  scanClose:{ position: 'absolute', top: 52, right: 20 },
});

export default MoveInventoryScreen;
