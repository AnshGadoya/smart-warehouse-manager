// screens/RackViewScreen.js
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Modal, FlatList, Dimensions, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { useApp } from '../context/AppContext';
import { Colors, BorderRadius, Shadow } from '../styles/theme';
import { getRackColor, getRackFillPercent, formatDate, getExpiryStatus } from '../utils/helpers';

// ─── Single Rack Cell ──────────────────────────────────────────────────────────
const RackCell = ({ rack, isSelected, onPress, cellWidth, isDarkMode }) => {
  const pct = getRackFillPercent(rack.currentCapacity, rack.maxCapacity);
  const color = isSelected ? Colors.rackSelected : getRackColor(rack.currentCapacity, rack.maxCapacity);

  const cardBg = isSelected
    ? color + '18'
    : isDarkMode
      ? Colors.darkSurface
      : Colors.white;

  const border = isSelected ? color : isDarkMode ? Colors.darkBorder : Colors.grey200;
  const textCol = isSelected ? Colors.textPrimary : isDarkMode ? Colors.darkText : Colors.textPrimary;
  const subTextCol = isDarkMode ? Colors.darkTextSecondary : Colors.textSecondary;

  return (
    <TouchableOpacity
      style={[
        styles.rackCell,
        {
          width: cellWidth,
          backgroundColor: cardBg,
          borderColor: border,
          borderLeftWidth: 4,
          borderLeftColor: color,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.rackCellHeader}>
        <Text style={[styles.rackCellName, { color: isSelected ? color : textCol }]} numberOfLines={1}>
          {rack.rackCode}
        </Text>
        <Text style={[styles.rackCellLevel, { color: subTextCol }]}>
          Level {rack.level[0]}
        </Text>
      </View>

      <View style={styles.rackProgressContainer}>
        <View style={[styles.rackFillBg, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#E0E0E0' }]}>
          <View style={[styles.rackFillBar, { width: `${pct}%`, backgroundColor: color }]} />
        </View>
        <Text style={[styles.rackPct, { color: textCol }]}>{pct}%</Text>
      </View>
    </TouchableOpacity>
  );
};

// ─── Rack Detail Modal ─────────────────────────────────────────────────────────
const RackDetailModal = ({ rack, visible, onClose, isDarkMode, inventory, parts, locations, stores }) => {
  if (!rack) return null;
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const qrRef = useRef(null);

  const cardBg = isDarkMode ? Colors.darkCard : Colors.white;
  const textCol = isDarkMode ? Colors.darkText : Colors.textPrimary;
  const subCol = isDarkMode ? Colors.darkTextSecondary : Colors.textSecondary;
  const rackInv = inventory.filter(i => i.rackId === rack.id);
  const location = locations.find(l => l.id === rack.locationId);
  const store = stores.find(s => s.id === rack.storeId);
  const pct = getRackFillPercent(rack.currentCapacity, rack.maxCapacity);
  const color = getRackColor(rack.currentCapacity, rack.maxCapacity);

  const handleShareQR = () => {
    if (!qrRef.current) return;
    qrRef.current.toDataURL((dataURL) => {
      const filename = `${FileSystem.documentDirectory}qr_${rack.rackCode}.png`;
      FileSystem.writeAsStringAsync(filename, dataURL, {
        encoding: 'base64',
      }).then(() => {
        Sharing.shareAsync(filename);
      }).catch((err) => {
        Alert.alert('Error', 'Failed to share QR code image');
      });
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalSheet, { backgroundColor: cardBg }]}>
          {/* Header */}
          <View style={[styles.modalHead, { backgroundColor: color }]}>
            <View>
              <Text style={styles.modalRackName}>{rack.rackName}</Text>
              <Text style={styles.modalRackCode}>{rack.rackCode} • {rack.level}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.modalClose}>
              <Ionicons name="close" size={22} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: 16 }}>
            {/* Capacity */}
            <View style={styles.capSection}>
              <View style={styles.capRow}>
                <View style={styles.capItem}>
                  <Text style={[styles.capNum, { color: textCol }]}>{rack.maxCapacity}</Text>
                  <Text style={[styles.capLabel, { color: subCol }]}>Max Capacity</Text>
                </View>
                <View style={styles.capItem}>
                  <Text style={[styles.capNum, { color: color }]}>{rack.currentCapacity}</Text>
                  <Text style={[styles.capLabel, { color: subCol }]}>Used</Text>
                </View>
                <View style={styles.capItem}>
                  <Text style={[styles.capNum, { color: Colors.success }]}>{rack.maxCapacity - rack.currentCapacity}</Text>
                  <Text style={[styles.capLabel, { color: subCol }]}>Available</Text>
                </View>
              </View>
              <View style={styles.bigBarBg}>
                <View style={[styles.bigBarFill, { width: `${pct}%`, backgroundColor: color }]} />
              </View>
              <Text style={[styles.bigBarPct, { color }]}>{pct}% Occupied</Text>
            </View>

            {/* Location chain */}
            <View style={[styles.locationBox, { backgroundColor: isDarkMode ? Colors.darkSurface : Colors.grey100 }]}>
              <View style={styles.locRow}>
                <Ionicons name="business-outline" size={14} color={subCol} />
                <Text style={[styles.locText, { color: subCol }]}>{store?.storeName || 'N/A'}</Text>
              </View>
              <Ionicons name="arrow-down" size={12} color={Colors.grey400} style={{ marginLeft: 6 }} />
              <View style={styles.locRow}>
                <Ionicons name="location-outline" size={14} color={subCol} />
                <Text style={[styles.locText, { color: subCol }]}>{location?.locationName || 'N/A'}</Text>
              </View>
              <Ionicons name="arrow-down" size={12} color={Colors.grey400} style={{ marginLeft: 6 }} />
              <View style={styles.locRow}>
                <Ionicons name="layers-outline" size={14} color={Colors.primary} />
                <Text style={[styles.locText, { color: Colors.primary, fontWeight: '700' }]}>{rack.rackName}</Text>
              </View>
            </View>

            {/* QR Code text (clickable to view and share) */}
            <TouchableOpacity
              style={[styles.qrBox, { backgroundColor: isDarkMode ? Colors.darkSurface : Colors.grey100 }]}
              onPress={() => setQrModalVisible(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="qr-code-outline" size={16} color={Colors.primary} />
              <Text style={[styles.qrText, { color: textCol }]}>{rack.qrCode}</Text>
              <Ionicons name="share-social-outline" size={16} color={Colors.primary} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>

            {/* Parts stored */}
            <Text style={[styles.partsTitle, { color: textCol }]}>
              Parts Stored ({rackInv.length})
            </Text>
            {rackInv.length === 0
              ? <Text style={[styles.emptyParts, { color: subCol }]}>No parts currently stored in this rack.</Text>
              : rackInv.map(item => {
                const part = parts.find(p => p.id === item.partId);
                const expiry = getExpiryStatus(item.useByDate);
                return (
                  <View key={item.id} style={[styles.partRow, { borderBottomColor: isDarkMode ? Colors.darkBorder : Colors.grey200 }]}>
                    <View style={styles.partRowLeft}>
                      <Text style={[styles.partRowName, { color: textCol }]}>{part?.partName || 'Unknown'}</Text>
                      <Text style={[styles.partRowPn, { color: subCol }]}>{part?.partNumber}</Text>
                    </View>
                    <View style={styles.partRowRight}>
                      <Text style={[styles.partRowQty, { color: textCol }]}>{item.quantity}</Text>
                      <View style={[styles.expiryBadge, { backgroundColor: expiry.color + '22' }]}>
                        <Text style={[styles.expiryBadgeText, { color: expiry.color }]}>{expiry.label}</Text>
                      </View>
                    </View>
                  </View>
                );
              })
            }
            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>

      {/* QR Code Viewer Modal */}
      <Modal visible={qrModalVisible} transparent animationType="fade" onRequestClose={() => setQrModalVisible(false)}>
        <View style={styles.qrModalOverlay}>
          <View style={[styles.qrModalContent, { backgroundColor: cardBg }]}>
            <View style={styles.qrModalHeader}>
              <Text style={[styles.qrModalTitle, { color: textCol }]}>Rack QR Code</Text>
              <TouchableOpacity onPress={() => setQrModalVisible(false)}>
                <Ionicons name="close" size={22} color={subCol} />
              </TouchableOpacity>
            </View>

            <View style={styles.qrContainer}>
              <QRCode
                value={rack.qrCode}
                size={180}
                getRef={(c) => (qrRef.current = c)}
              />
            </View>

            <Text style={[styles.qrCodeText, { color: textCol, backgroundColor: isDarkMode ? Colors.darkSurface : Colors.grey100 }]}>
              {rack.qrCode}
            </Text>

            <TouchableOpacity style={styles.shareBtn} onPress={handleShareQR} activeOpacity={0.8}>
              <Ionicons name="share-social" size={18} color={Colors.white} />
              <Text style={styles.shareBtnText}>Share Code</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const RackViewScreen = () => {
  const { stores, locations, racks, inventory, parts, isDarkMode } = useApp();
  const [selectedStore, setSelectedStore] = useState(stores[0]?.id || null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedRack, setSelectedRack] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const bg = isDarkMode ? Colors.darkBackground : Colors.background;
  const cardBg = isDarkMode ? Colors.darkCard : Colors.white;
  const textCol = isDarkMode ? Colors.darkText : Colors.textPrimary;
  const subCol = isDarkMode ? Colors.darkTextSecondary : Colors.textSecondary;

  const filteredLocations = locations.filter(l => l.storeId === selectedStore);
  const totalFilterItems = filteredLocations.length + 1;
  const filteredRacks = racks.filter(r =>
    r.storeId === selectedStore &&
    (!selectedLocation || r.locationId === selectedLocation)
  );

  // Group racks by location, then by level
  const grouped = filteredRacks.reduce((acc, r) => {
    if (!acc[r.locationId]) acc[r.locationId] = { TOP: [], MIDDLE: [], BOTTOM: [] };
    acc[r.locationId][r.level].push(r);
    return acc;
  }, {});

  const handleRackPress = (rack) => {
    setSelectedRack(rack);
    setDetailVisible(true);
  };

  const { width: SCREEN_WIDTH } = Dimensions.get('window');
  const cellWidth = (SCREEN_WIDTH - 56 - 10) / 2;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors.primary }]} edges={['top']}>
      <View style={[styles.screen, { backgroundColor: bg }]}>
        <View style={styles.topBar}>
          <Text style={styles.topBarTitle}>2D Rack View</Text>
        </View>

        {/* Legend */}
        <View style={[styles.legend, { backgroundColor: cardBg }]}>
          {[
            { color: Colors.rackEmpty, label: 'Empty' },
            { color: Colors.rackPartial, label: 'Partial' },
            { color: Colors.rackFull, label: 'Full' },
            { color: Colors.rackSelected, label: 'Selected' },
          ].map(l => (
            <View key={l.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: l.color }]} />
              <Text style={[styles.legendText, { color: subCol }]}>{l.label}</Text>
            </View>
          ))}
        </View>

        {/* Store selector (Segmented style control) */}
        <View style={[styles.storeSelector, { backgroundColor: isDarkMode ? Colors.darkCard : '#E8EBF5' }]}>
          {stores.map(s => (
            <TouchableOpacity
              key={s.id}
              style={[
                styles.storeTab,
                selectedStore === s.id && (isDarkMode ? styles.storeTabActiveDark : styles.storeTabActiveLight)
              ]}
              onPress={() => { setSelectedStore(s.id); setSelectedLocation(null); }}
            >
              <Text style={[
                styles.storeTabText,
                selectedStore === s.id ? (isDarkMode ? styles.storeTabTextActiveDark : styles.storeTabTextActiveLight) : (isDarkMode ? styles.storeTabTextInactiveDark : styles.storeTabTextInactiveLight)
              ]}>
                {s.storeName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Location filter */}
        <View style={styles.locContainer}>
          <TouchableOpacity
            style={[
              styles.locChip,
              totalFilterItems <= 3 && { flex: 1 },
              !selectedLocation ? styles.locChipActive : { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white, borderColor: isDarkMode ? Colors.darkBorder : Colors.grey300 }
            ]}
            onPress={() => setSelectedLocation(null)}
            activeOpacity={0.75}
          >
            <Text style={[styles.locChipText, !selectedLocation ? styles.locChipTextActive : { color: isDarkMode ? Colors.darkText : Colors.textSecondary }]} numberOfLines={1}>All</Text>
          </TouchableOpacity>
          {filteredLocations.map(l => (
            <TouchableOpacity
              key={l.id}
              style={[
                styles.locChip,
                totalFilterItems <= 3 && { flex: 1 },
                selectedLocation === l.id ? styles.locChipActive : { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white, borderColor: isDarkMode ? Colors.darkBorder : Colors.grey300 }
              ]}
              onPress={() => setSelectedLocation(l.id)}
              activeOpacity={0.75}
            >
              <Text style={[styles.locChipText, selectedLocation === l.id ? styles.locChipTextActive : { color: isDarkMode ? Colors.darkText : Colors.textSecondary }]} numberOfLines={1}>{l.locationName}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          {Object.keys(grouped).length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: cardBg }]}>
              <Ionicons name="layers-outline" size={48} color={Colors.grey300} />
              <Text style={[styles.emptyText, { color: subCol }]}>No racks found</Text>
            </View>
          ) : (
            Object.entries(grouped).map(([locationId, levels]) => {
              const loc = locations.find(l => l.id === locationId);
              return (
                <View key={locationId} style={[styles.locationSection, { backgroundColor: cardBg }]}>
                  <View style={styles.locHeader}>
                    <Ionicons name="location" size={16} color={Colors.accent} />
                    <Text style={[styles.locTitle, { color: textCol }]}>{loc?.locationName || 'Unknown'}</Text>
                    <Text style={[styles.locCode, { color: subCol }]}>{loc?.locationCode}</Text>
                  </View>

                  {['TOP', 'MIDDLE', 'BOTTOM'].map(level => {
                    const levelRacks = levels[level];
                    if (!levelRacks?.length) return null;
                    const levelColors = { TOP: Colors.info, MIDDLE: Colors.warning, BOTTOM: Colors.success };
                    return (
                      <View key={level} style={styles.levelSection}>
                      <View style={[styles.levelLabel, { backgroundColor: levelColors[level] + '18' }]}>
                        <Text style={[styles.levelLabelText, { color: levelColors[level] }]}>{level}</Text>
                      </View>
                        <View style={styles.rackRow}>
                          {levelRacks.map(rack => (
                            <RackCell
                              key={rack.id}
                              rack={rack}
                              isSelected={selectedRack?.id === rack.id}
                              onPress={() => handleRackPress(rack)}
                              cellWidth={cellWidth}
                              isDarkMode={isDarkMode}
                            />
                          ))}
                        </View>
                      </View>
                    );
                  })}
                </View>
              );
            })
          )}
        </ScrollView>

        <RackDetailModal
          rack={selectedRack}
          visible={detailVisible}
          onClose={() => { setDetailVisible(false); setSelectedRack(null); }}
          isDarkMode={isDarkMode}
          inventory={inventory}
          parts={parts}
          locations={locations}
          stores={stores}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  screen: { flex: 1 },
  topBar: { backgroundColor: Colors.primary, padding: 16, paddingTop: 14 },
  topBarTitle: { fontSize: 18, fontWeight: '800', color: Colors.white },

  legend: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, gap: 16, justifyContent: 'center', ...Shadow.small },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 11, fontWeight: '600' },

  tabScroll: { maxHeight: 48, backgroundColor: Colors.primary },
  tabContent: { paddingHorizontal: 12, gap: 6, paddingVertical: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.15)' },
  tabActive: { backgroundColor: Colors.white },
  tabText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  tabTextActive: { color: Colors.primary },

  storeSelector: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 3,
    borderRadius: BorderRadius.md,
  },
  storeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.sm,
  },
  storeTabActiveDark: {
    backgroundColor: Colors.darkSurface,
    ...Shadow.small,
  },
  storeTabActiveLight: {
    backgroundColor: Colors.white,
    ...Shadow.small,
  },
  storeTabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  storeTabTextActiveDark: {
    color: Colors.white,
    fontWeight: '700',
  },
  storeTabTextActiveLight: {
    color: Colors.primary,
    fontWeight: '700',
  },
  storeTabTextInactiveDark: {
    color: Colors.darkTextSecondary,
  },
  storeTabTextInactiveLight: {
    color: Colors.textSecondary,
  },

  locContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
    marginVertical: 8,
  },
  locChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.small,
  },
  locChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  locChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  locChipTextActive: {
    color: Colors.white,
  },

  locationSection: { borderRadius: BorderRadius.lg, marginBottom: 12, overflow: 'hidden', ...Shadow.medium },
  locHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 14, paddingBottom: 8 },
  locTitle: { fontSize: 14, fontWeight: '800', flex: 1 },
  locCode: { fontSize: 11 },

  levelSection: { marginHorizontal: 12, marginBottom: 12 },
  levelLabel: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99, marginBottom: 8 },
  levelLabelText: { fontSize: 11, fontWeight: '800' },
  rackRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },

  // Rack Cell Redesign
  rackCell: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: 10,
    justifyContent: 'space-between',
    ...Shadow.small,
  },
  rackCellHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rackCellName: {
    fontSize: 13,
    fontWeight: '700',
  },
  rackCellLevel: {
    fontSize: 11,
    fontWeight: '600',
  },
  rackProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rackFillBg: {
    flex: 1,
    height: 6,
    borderRadius: 99,
    overflow: 'hidden',
  },
  rackFillBar: {
    height: '100%',
    borderRadius: 99,
  },
  rackPct: {
    fontSize: 11,
    fontWeight: '700',
    minWidth: 32,
    textAlign: 'right',
  },

  // Empty
  emptyCard: { borderRadius: BorderRadius.lg, padding: 48, alignItems: 'center', ...Shadow.small },
  emptyText: { fontSize: 14, fontWeight: '600', marginTop: 12 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', ...Shadow.large, overflow: 'hidden' },
  modalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 18, paddingTop: 20 },
  modalRackName: { fontSize: 20, fontWeight: '800', color: Colors.white },
  modalRackCode: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  modalClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },

  capSection: { marginBottom: 16 },
  capRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  capItem: { alignItems: 'center' },
  capNum: { fontSize: 24, fontWeight: '800' },
  capLabel: { fontSize: 11, marginTop: 2 },
  bigBarBg: { height: 12, backgroundColor: Colors.grey200, borderRadius: 99, overflow: 'hidden', marginBottom: 4 },
  bigBarFill: { height: '100%', borderRadius: 99 },
  bigBarPct: { fontSize: 12, fontWeight: '700', textAlign: 'right' },

  locationBox: { borderRadius: BorderRadius.sm, padding: 12, marginBottom: 12 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  locText: { fontSize: 13, fontWeight: '600' },

  qrBox: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: BorderRadius.xs, padding: 10, marginBottom: 16 },
  qrText: { fontSize: 12, fontFamily: 'monospace', flex: 1 },

  partsTitle: { fontSize: 14, fontWeight: '800', marginBottom: 10 },
  emptyParts: { fontSize: 13, textAlign: 'center', padding: 16 },
  partRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
  partRowLeft: { flex: 1 },
  partRowRight: { alignItems: 'flex-end', gap: 4 },
  partRowName: { fontSize: 13, fontWeight: '600' },
  partRowPn: { fontSize: 11, marginTop: 2 },
  partRowQty: { fontSize: 16, fontWeight: '800' },
  expiryBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  expiryBadgeText: { fontSize: 10, fontWeight: '700' },

  // QR Modal Styles
  qrModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrModalContent: {
    width: '85%',
    maxWidth: 320,
    borderRadius: BorderRadius.lg,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  qrModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  qrModalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  qrContainer: {
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    marginBottom: 16,
    ...Shadow.small,
  },
  qrCodeText: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.xs,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: BorderRadius.full,
    width: '100%',
    justifyContent: 'center',
    ...Shadow.small,
  },
  shareBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default RackViewScreen;
