// screens/Inventory/AddInventoryScreen.js
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert,
  TouchableOpacity, Modal, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useApp } from '../../context/AppContext';
import { ledApi } from '../../services/ledApi';
import Header from '../../components/Header';
import Input from '../../components/Input';
import Button from '../../components/Button';
import PickerSelect from '../../components/PickerSelect';
import LoadingOverlay from '../../components/LoadingOverlay';
import { Colors, BorderRadius, Shadow } from '../../styles/theme';
import { formatDate, daysUntil, getLevelColor } from '../../utils/helpers';

const STEPS = ['Fill Details', 'Suggested Rack', 'Scan QR'];

const AddInventoryScreen = ({ navigation }) => {
  const {
    stores, locations, parts, isDarkMode,
    getLocationsByStore, suggestRack, addInventory,
  } = useApp();

  const [permission, requestPermission] = useCameraPermissions();

  // Form state
  const [partId,     setPartId]     = useState('');
  const [quantity,   setQuantity]   = useState('');
  const [useByDate,  setUseByDate]  = useState('');
  const [storeId,    setStoreId]    = useState('');
  const [locationId, setLocationId] = useState('');
  const [errors,     setErrors]     = useState({});

  // Flow state
  const [step,        setStep]        = useState(0); // 0=form, 1=suggestion, 2=scan
  const [suggestion,  setSuggestion]  = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [loadingMsg,  setLoadingMsg]  = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanned,     setScanned]     = useState(false);
  const [ledOn,       setLedOn]       = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const bg     = isDarkMode ? Colors.darkBackground : Colors.background;
  const cardBg = isDarkMode ? Colors.darkCard       : Colors.white;
  const textCol = isDarkMode ? Colors.darkText      : Colors.textPrimary;
  const subCol  = isDarkMode ? Colors.darkTextSecondary : Colors.textSecondary;

  const partItems  = parts.map(p  => ({ label: `${p.partName} (${p.partNumber})`, value: p.id }));
  const storeItems = stores.map(s => ({ label: s.storeName, value: s.id }));
  const locItems   = getLocationsByStore(storeId).map(l => ({ label: l.locationName, value: l.id }));

  // ── LED pulse animation ──────────────────────────────────────────────────────
  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 600, useNativeDriver: true }),
      ])
    ).start();
  };

  // ── Validation ───────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!partId)           e.partId     = 'Select a part';
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0)
                           e.quantity   = 'Enter valid quantity';
    if (!useByDate)        e.useByDate  = 'Enter use-by date (YYYY-MM-DD)';
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(useByDate))
                           e.useByDate  = 'Format must be YYYY-MM-DD';
    if (!storeId)          e.storeId    = 'Select a store';
    if (!locationId)       e.locationId = 'Select a location';
    setErrors(e);
    return !Object.keys(e).length;
  };

  // ── Step 1 → Step 2: Find rack ───────────────────────────────────────────────
  const handleFindRack = async () => {
    if (!validate()) return;
    setLoading(true); setLoadingMsg('Finding best rack…');
    await new Promise(r => setTimeout(r, 600));
    const result = suggestRack(Number(quantity), useByDate, storeId, locationId);
    setLoading(false);
    if (!result) {
      Alert.alert('No Rack Available', 'No rack with sufficient capacity found for the selected store & location. Please try a different location or reduce quantity.');
      return;
    }
    setSuggestion(result);
    setStep(1);
  };

  // ── Step 2 → LED ON ──────────────────────────────────────────────────────────
  const handleConfirmSuggestion = async () => {
    setLoading(true); setLoadingMsg('Activating LED…');
    try {
      await ledApi.on(suggestion.rack.id, suggestion.rack.rackCode);
      setLedOn(true);
      startPulse();
      setStep(2);
    } catch (e) {
      Alert.alert('LED Error', 'Could not activate LED. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: QR Scan ──────────────────────────────────────────────────────────
  const handleOpenScanner = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) { Alert.alert('Camera Permission', 'Camera access is required to scan QR codes.'); return; }
    }
    setScanned(false);
    setScannerOpen(true);
  };

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned) return;
    setScanned(true);
    setScannerOpen(false);

    const expectedQR = suggestion?.rack?.qrCode;
    if (data === expectedQR) {
      // ✅ Correct rack
      setLoading(true); setLoadingMsg('Saving inventory…');
      try {
        await ledApi.off(suggestion.rack.id, suggestion.rack.rackCode);
        addInventory({
          partId,
          quantity:  Number(quantity),
          useByDate,
          storeId,
          locationId,
          rackId: suggestion.rack.id,
        });
        setLedOn(false);
        setLoading(false);
        Alert.alert(
          '✅ Inventory Stored Successfully',
          `Part stored in ${suggestion.rack.rackName}\nLED has been turned OFF.`,
          [{ text: 'Done', onPress: () => navigation.goBack() }]
        );
      } catch {
        setLoading(false);
        Alert.alert('Error', 'Failed to save inventory. Please try again.');
      }
    } else {
      // ❌ Wrong rack
      Alert.alert(
        '❌ Wrong Rack Scanned',
        `Please place the inventory in the suggested rack:\n\n${suggestion.rack.rackName} (${suggestion.rack.rackCode})\n\nTry scanning again.`,
        [{ text: 'Scan Again', onPress: () => { setScanned(false); setScannerOpen(true); } }, { text: 'Cancel' }]
      );
    }
  };

  // ── Step indicator ───────────────────────────────────────────────────────────
  const StepIndicator = () => (
    <View style={styles.stepRow}>
      {STEPS.map((label, i) => (
        <React.Fragment key={label}>
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, i <= step && styles.stepCircleActive, i < step && styles.stepCircleDone]}>
              {i < step
                ? <Ionicons name="checkmark" size={14} color={Colors.white} />
                : <Text style={[styles.stepNum, i <= step && { color: Colors.white }]}>{i + 1}</Text>
              }
            </View>
            <Text style={[styles.stepLabel, i === step && styles.stepLabelActive]}>{label}</Text>
          </View>
          {i < STEPS.length - 1 && <View style={[styles.stepLine, i < step && styles.stepLineDone]} />}
        </React.Fragment>
      ))}
    </View>
  );

  return (
    <View style={[styles.screen, { backgroundColor: bg }]}>
      <Header title="Add Inventory" onBack={() => navigation.goBack()} darkMode={isDarkMode} />
      {loading && <LoadingOverlay message={loadingMsg} />}

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <StepIndicator />

        {/* ── STEP 0: Form ── */}
        {step === 0 && (
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Text style={[styles.cardTitle, { color: textCol }]}>Inventory Details</Text>

            <PickerSelect label="Part" value={partId} onValueChange={setPartId}
              items={partItems} placeholder="Select part…" error={errors.partId} darkMode={isDarkMode} required />

            <Input label="Quantity" value={quantity} onChangeText={setQuantity}
              placeholder="Enter quantity" keyboardType="numeric"
              leftIcon="layers-outline" error={errors.quantity} darkMode={isDarkMode} required />

            <Input label="Use By Date" value={useByDate} onChangeText={setUseByDate}
              placeholder="YYYY-MM-DD" leftIcon="calendar-outline"
              error={errors.useByDate} darkMode={isDarkMode} required />

            <PickerSelect label="Store" value={storeId}
              onValueChange={v => { setStoreId(v); setLocationId(''); }}
              items={storeItems} placeholder="Select store…"
              error={errors.storeId} darkMode={isDarkMode} required />

            <PickerSelect label="Location" value={locationId} onValueChange={setLocationId}
              items={locItems} placeholder="Select location…"
              error={errors.locationId} darkMode={isDarkMode} required
              disabled={!storeId} />

            <View style={[styles.infoBox, { backgroundColor: Colors.infoLight }]}>
              <Ionicons name="information-circle-outline" size={18} color={Colors.info} />
              <Text style={styles.infoText}>The system will automatically suggest the best rack based on expiry date.</Text>
            </View>

            <Button title="Find Best Rack →" onPress={handleFindRack} style={{ marginTop: 12 }} size="lg" />
          </View>
        )}

        {/* ── STEP 1: Suggestion ── */}
        {step === 1 && suggestion && (
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <View style={styles.suggestionBanner}>
              <Ionicons name="bulb" size={28} color={Colors.warning} />
              <Text style={[styles.suggestionTitle, { color: textCol }]}>Rack Suggestion</Text>
            </View>

            {/* Expiry Info */}
            <View style={[styles.expiryBox, { backgroundColor: getLevelColor(suggestion.preferredLevel) + '18' }]}>
              <View style={styles.expiryRow}>
                <Ionicons name="calendar" size={16} color={getLevelColor(suggestion.preferredLevel)} />
                <Text style={[styles.expiryText, { color: getLevelColor(suggestion.preferredLevel) }]}>
                  {suggestion.daysToExpiry > 0 ? `Expires in ${suggestion.daysToExpiry} days` : 'Expired'}
                </Text>
              </View>
              <Text style={[styles.expiryLevel, { color: getLevelColor(suggestion.preferredLevel) }]}>
                {suggestion.daysToExpiry > 180 ? 'Far Expiry → TOP rack preferred' :
                 suggestion.daysToExpiry >= 60  ? 'Medium Expiry → MIDDLE rack preferred' :
                                                  'Near Expiry → BOTTOM rack preferred'}
              </Text>
            </View>

            {/* Rack Details */}
            {[
              { icon: 'layers',      label: 'Rack',     value: `${suggestion.rack.rackName} (${suggestion.rack.rackCode})`, color: Colors.primary },
              { icon: 'arrow-up',    label: 'Level',    value: suggestion.rack.level, color: getLevelColor(suggestion.rack.level) },
              { icon: 'location',    label: 'Location', value: suggestion.rack.locationId, color: Colors.accent },
              { icon: 'business',    label: 'Store',    value: suggestion.rack.storeId, color: '#8E24AA' },
              { icon: 'stats-chart', label: 'Available', value: `${suggestion.rack.maxCapacity - suggestion.rack.currentCapacity} / ${suggestion.rack.maxCapacity}`, color: Colors.success },
            ].map(row => (
              <View key={row.label} style={styles.detailRow}>
                <View style={[styles.detailIcon, { backgroundColor: row.color + '18' }]}>
                  <Ionicons name={row.icon} size={16} color={row.color} />
                </View>
                <Text style={[styles.detailLabel, { color: subCol }]}>{row.label}</Text>
                <Text style={[styles.detailValue, { color: textCol }]}>{row.value}</Text>
              </View>
            ))}

            <View style={[styles.infoBox, { backgroundColor: Colors.warningLight, marginTop: 12 }]}>
              <Ionicons name="flash" size={18} color={Colors.warning} />
              <Text style={[styles.infoText, { color: Colors.warning }]}>
                Tapping "Confirm" will turn ON the LED on the suggested rack.
              </Text>
            </View>

            <View style={styles.btnRow}>
              <Button title="← Back" onPress={() => setStep(0)} variant="outline" style={{ flex: 1 }} />
              <Button title="Confirm & Light LED 💡" onPress={handleConfirmSuggestion} style={{ flex: 2 }} />
            </View>
          </View>
        )}

        {/* ── STEP 2: QR Scan ── */}
        {step === 2 && (
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            {/* LED indicator */}
            <View style={styles.ledCenter}>
              <Animated.View style={[styles.ledRing, { transform: [{ scale: pulseAnim }] }]}>
                <View style={styles.ledDot} />
              </Animated.View>
              <Text style={styles.ledText}>LED is ON</Text>
              <Text style={[styles.ledSub, { color: subCol }]}>Rack {suggestion?.rack?.rackCode} is glowing</Text>
            </View>

            <View style={[styles.qrInstructions, { backgroundColor: Colors.primary + '12' }]}>
              <Ionicons name="qr-code-outline" size={32} color={Colors.primary} style={{ marginBottom: 8 }} />
              <Text style={[styles.qrInstrTitle, { color: textCol }]}>Scan Rack QR Code</Text>
              <Text style={[styles.qrInstrSub, { color: subCol }]}>
                Go to the rack indicated by the glowing LED and scan its QR code to confirm placement.
              </Text>
            </View>

            <View style={styles.rackConfirmBox}>
              <Text style={[styles.rackConfirmLabel, { color: subCol }]}>Expected Rack:</Text>
              <Text style={[styles.rackConfirmValue, { color: textCol }]}>{suggestion?.rack?.rackName}</Text>
              <Text style={[styles.rackConfirmCode, { color: Colors.primary }]}>{suggestion?.rack?.qrCode}</Text>
            </View>

            <Button
              title="📷 Scan Rack QR Code"
              onPress={handleOpenScanner}
              size="lg"
              style={{ marginBottom: 10 }}
            />
            <Button
              title="← Back"
              onPress={() => { setStep(1); setLedOn(false); pulseAnim.stopAnimation(); }}
              variant="outline"
            />
          </View>
        )}
      </ScrollView>

      {/* ── QR Scanner Modal ── */}
      <Modal visible={scannerOpen} animationType="slide" onRequestClose={() => setScannerOpen(false)}>
        <View style={styles.scannerScreen}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          />
          {/* Overlay frame */}
          <View style={styles.scanOverlay}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
            <Text style={styles.scanHint}>Align QR code within the frame</Text>
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
  screen:  { flex: 1 },
  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16, marginTop: 4 },
  stepItem: { alignItems: 'center', gap: 4 },
  stepCircle: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2, borderColor: Colors.grey300,
    backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
  stepCircleActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  stepCircleDone:   { backgroundColor: Colors.success, borderColor: Colors.success },
  stepNum:   { fontSize: 12, fontWeight: '700', color: Colors.grey500 },
  stepLabel: { fontSize: 10, color: Colors.grey500, fontWeight: '600' },
  stepLabelActive: { color: Colors.primary },
  stepLine: { flex: 1, height: 2, backgroundColor: Colors.grey300, marginHorizontal: 4, marginBottom: 16 },
  stepLineDone: { backgroundColor: Colors.success },

  card: { borderRadius: BorderRadius.lg, padding: 18, ...Shadow.medium, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 16 },

  infoBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 12, borderRadius: BorderRadius.sm },
  infoText: { flex: 1, fontSize: 12, color: Colors.info, lineHeight: 18 },

  suggestionBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  suggestionTitle:  { fontSize: 18, fontWeight: '800' },
  expiryBox:   { borderRadius: BorderRadius.sm, padding: 12, marginBottom: 14 },
  expiryRow:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  expiryText:  { fontSize: 13, fontWeight: '700' },
  expiryLevel: { fontSize: 11, fontWeight: '600' },

  detailRow:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: Colors.grey100 },
  detailIcon:  { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  detailLabel: { fontSize: 12, width: 72, fontWeight: '600' },
  detailValue: { flex: 1, fontSize: 13, fontWeight: '700', textAlign: 'right' },

  btnRow: { flexDirection: 'row', gap: 10, marginTop: 14 },

  ledCenter: { alignItems: 'center', marginVertical: 20 },
  ledRing: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.warning + '30', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  ledDot:  { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.warning },
  ledText: { fontSize: 16, fontWeight: '800', color: Colors.warning },
  ledSub:  { fontSize: 12, marginTop: 4 },

  qrInstructions: { borderRadius: BorderRadius.md, padding: 20, alignItems: 'center', marginBottom: 16 },
  qrInstrTitle:   { fontSize: 16, fontWeight: '800', marginBottom: 6 },
  qrInstrSub:     { fontSize: 13, textAlign: 'center', lineHeight: 20 },

  rackConfirmBox:  { borderRadius: BorderRadius.sm, borderWidth: 1.5, borderColor: Colors.primary + '40', padding: 14, alignItems: 'center', marginBottom: 16 },
  rackConfirmLabel:{ fontSize: 12, fontWeight: '600', marginBottom: 4 },
  rackConfirmValue:{ fontSize: 16, fontWeight: '800' },
  rackConfirmCode: { fontSize: 12, marginTop: 4, fontWeight: '600' },

  scannerScreen: { flex: 1, backgroundColor: '#000' },
  scanOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  scanFrame: {
    width: 240, height: 240,
    borderRadius: 16,
    position: 'relative',
  },
  corner: { position: 'absolute', width: 36, height: 36, borderColor: Colors.accent, borderWidth: 4 },
  cornerTL: { top: 0, left: 0,  borderBottomWidth: 0, borderRightWidth: 0,  borderTopLeftRadius: 12 },
  cornerTR: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0,   borderTopRightRadius: 12 },
  cornerBL: { bottom: 0, left: 0,  borderTopWidth: 0, borderRightWidth: 0,  borderBottomLeftRadius: 12 },
  cornerBR: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0,   borderBottomRightRadius: 12 },
  scanHint:  { color: Colors.white, fontSize: 13, marginTop: 24, textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 99 },
  scanClose: { position: 'absolute', top: 52, right: 20 },
});

export default AddInventoryScreen;
