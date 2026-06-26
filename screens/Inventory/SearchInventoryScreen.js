// screens/Inventory/SearchInventoryScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TextInput, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import Header from '../../components/Header';
import EmptyState from '../../components/EmptyState';
import { Colors, BorderRadius, Shadow } from '../../styles/theme';
import { formatDate, getExpiryStatus, getRackFillPercent } from '../../utils/helpers';

const SearchInventoryScreen = ({ navigation }) => {
  const { searchInventory, parts, racks, locations, stores, isDarkMode } = useApp();
  const [query, setQuery] = useState('');
  const results = searchInventory(query);

  const bg     = isDarkMode ? Colors.darkBackground : Colors.background;
  const cardBg = isDarkMode ? Colors.darkCard : Colors.white;
  const textCol = isDarkMode ? Colors.darkText : Colors.textPrimary;
  const subCol  = isDarkMode ? Colors.darkTextSecondary : Colors.textSecondary;

  const renderItem = ({ item }) => {
    const part     = parts.find(p => p.id === item.partId);
    const rack     = racks.find(r => r.id === item.rackId);
    const location = locations.find(l => l.id === item.locationId);
    const store    = stores.find(s => s.id === item.storeId);
    const expiry   = getExpiryStatus(item.useByDate);

    return (
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        {/* Part Info */}
        <View style={styles.cardHeader}>
          <View style={styles.partIconBox}>
            <Ionicons name="construct" size={20} color={Colors.primary} />
          </View>
          <View style={styles.partInfo}>
            <Text style={[styles.partName, { color: textCol }]}>{part?.partName || 'Unknown Part'}</Text>
            <Text style={[styles.partNum, { color: subCol }]}>PN: {part?.partNumber || 'N/A'} • {part?.category}</Text>
          </View>
          <View style={styles.qtyBox}>
            <Text style={[styles.qty, { color: Colors.primary }]}>{item.quantity}</Text>
            <Text style={[styles.qtyLabel, { color: subCol }]}>{part?.unit || 'units'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Location Path */}
        <View style={styles.locationPath}>
          <View style={styles.pathItem}>
            <Ionicons name="business-outline" size={13} color={subCol} />
            <Text style={[styles.pathText, { color: subCol }]}>{store?.storeName || 'N/A'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={12} color={Colors.grey400} />
          <View style={styles.pathItem}>
            <Ionicons name="location-outline" size={13} color={subCol} />
            <Text style={[styles.pathText, { color: subCol }]}>{location?.locationName || 'N/A'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={12} color={Colors.grey400} />
          <View style={styles.pathItem}>
            <Ionicons name="layers-outline" size={13} color={subCol} />
            <Text style={[styles.pathText, { color: subCol }]}>{rack?.rackName || 'N/A'}</Text>
          </View>
        </View>

        {/* Level + Expiry */}
        <View style={styles.cardFooter}>
          <View style={[styles.levelBadge, { backgroundColor: Colors.primary + '18' }]}>
            <Text style={[styles.levelText, { color: Colors.primary }]}>{rack?.level || 'N/A'}</Text>
          </View>
          <View style={[styles.expiryBadge, { backgroundColor: expiry.color + '18' }]}>
            <Ionicons name="calendar-outline" size={12} color={expiry.color} />
            <Text style={[styles.expiryText, { color: expiry.color }]}>{expiry.label} • {formatDate(item.useByDate)}</Text>
          </View>
        </View>

        {/* QR Code text */}
        {rack?.qrCode && (
          <View style={[styles.qrRow, { backgroundColor: isDarkMode ? Colors.darkSurface : Colors.grey100 }]}>
            <Ionicons name="qr-code-outline" size={13} color={subCol} />
            <Text style={[styles.qrText, { color: subCol }]}>{rack.qrCode}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: bg }]}>
      <Header title="Search Inventory" onBack={() => navigation.goBack()} darkMode={isDarkMode} />

      {/* Search bar */}
      <View style={[styles.searchBar, { backgroundColor: cardBg }]}>
        <Ionicons name="search-outline" size={20} color={Colors.grey500} />
        <TextInput
          style={[styles.searchInput, { color: textCol }]}
          placeholder="Search by part, rack, location, QR…"
          placeholderTextColor={Colors.grey400}
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
        {query ? (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={20} color={Colors.grey400} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Result count */}
      {query.length > 0 && (
        <Text style={[styles.resultCount, { color: subCol }]}>
          {results.length} result{results.length !== 1 ? 's' : ''} found
        </Text>
      )}

      <FlatList
        data={query ? results : []}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 16, paddingTop: 8, paddingBottom: 32, gap: 10 }}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          query
            ? <EmptyState icon="search-outline" title="No Results" subtitle={`No inventory matches "${query}"`} darkMode={isDarkMode} />
            : (
              <View style={styles.startSearch}>
                <Ionicons name="search" size={60} color={Colors.grey300} />
                <Text style={[styles.startText, { color: subCol }]}>Start typing to search inventory</Text>
                <Text style={[styles.startHint, { color: Colors.grey400 }]}>Search by part name, part number, rack, location, store, or QR code</Text>
              </View>
            )
        }
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    margin: 16, marginBottom: 4,
    borderRadius: BorderRadius.md, paddingHorizontal: 14, paddingVertical: 12,
    ...Shadow.small,
  },
  searchInput: { flex: 1, fontSize: 15 },
  resultCount: { fontSize: 12, fontWeight: '600', marginHorizontal: 20, marginBottom: 4 },

  card: { borderRadius: BorderRadius.md, padding: 14, ...Shadow.small },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  partIconBox: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.primary + '18', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  partInfo: { flex: 1 },
  partName: { fontSize: 14, fontWeight: '700' },
  partNum:  { fontSize: 11, marginTop: 2 },
  qtyBox:   { alignItems: 'center' },
  qty:      { fontSize: 20, fontWeight: '800' },
  qtyLabel: { fontSize: 10 },

  divider: { height: 1, backgroundColor: Colors.grey100, marginBottom: 10 },

  locationPath: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginBottom: 10 },
  pathItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  pathText: { fontSize: 11, fontWeight: '600' },

  cardFooter: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  levelBadge:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  levelText:   { fontSize: 11, fontWeight: '700' },
  expiryBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  expiryText:  { fontSize: 11, fontWeight: '600' },

  qrRow: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8, borderRadius: BorderRadius.xs },
  qrText: { fontSize: 11, fontFamily: 'monospace' },

  startSearch: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  startText:   { fontSize: 16, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  startHint:   { fontSize: 13, textAlign: 'center', lineHeight: 20 },
});

export default SearchInventoryScreen;
