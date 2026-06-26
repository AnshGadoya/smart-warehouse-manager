// screens/Inventory/InventoryTabScreen.js
// Hub screen shown on the "Inventory" bottom tab
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { Colors, BorderRadius, Shadow } from '../../styles/theme';

const ACTIONS = [
  {
    title: 'Add Inventory',
    subtitle: 'Store new parts with smart rack allocation',
    icon: 'add-circle',
    color: Colors.primary,
    screen: 'AddInventory',
  },
  {
    title: 'Remove Inventory',
    subtitle: 'Scan rack QR and remove parts',
    icon: 'remove-circle',
    color: Colors.danger,
    screen: 'RemoveInventory',
  },
  {
    title: 'Move Inventory',
    subtitle: 'Transfer items between racks with LED guide',
    icon: 'swap-horizontal',
    color: '#8E24AA',
    screen: 'MoveInventory',
  },
  {
    title: 'Search Inventory',
    subtitle: 'Find parts by name, number, rack, or QR',
    icon: 'search',
    color: Colors.warning,
    screen: 'SearchInventory',
  },
];

const InventoryTabScreen = ({ navigation }) => {
  const { inventory, parts, racks, isDarkMode } = useApp();

  const bg = isDarkMode ? Colors.darkBackground : Colors.background;
  const cardBg = isDarkMode ? Colors.darkCard : Colors.white;
  const textCol = isDarkMode ? Colors.darkText : Colors.textPrimary;
  const subCol = isDarkMode ? Colors.darkTextSecondary : Colors.textSecondary;

  const totalItems = inventory.reduce((s, i) => s + i.quantity, 0);
  const nearExpiry = inventory.filter(i => {
    const days = Math.ceil((new Date(i.useByDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days >= 0 && days < 60;
  }).length;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors.primaryDark }]} edges={['top']}>
      <ScrollView style={[styles.screen, { backgroundColor: bg }]} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.banner}>
          <Text style={styles.bannerTitle}>Inventory Management</Text>
          <Text style={styles.bannerSub}>Smart warehouse operations</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{inventory.length}</Text>
              <Text style={styles.statLabel}>Entries</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>{totalItems}</Text>
              <Text style={styles.statLabel}>Total Units</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={[styles.statNum, nearExpiry > 0 && { color: Colors.warning }]}>{nearExpiry}</Text>
              <Text style={styles.statLabel}>Near Expiry</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          <Text style={[styles.sectionTitle, { color: textCol }]}>What would you like to do?</Text>

          {ACTIONS.map(action => (
            <TouchableOpacity
              key={action.screen}
              style={[styles.actionCard, { backgroundColor: cardBg }]}
              onPress={() => navigation.navigate(action.screen)}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.color + '18' }]}>
                <Ionicons name={action.icon} size={28} color={action.color} />
              </View>
              <View style={styles.actionBody}>
                <Text style={[styles.actionTitle, { color: textCol }]}>{action.title}</Text>
                <Text style={[styles.actionSub, { color: subCol }]}>{action.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.grey400} />
            </TouchableOpacity>
          ))}

          {/* Recent inventory list */}
          <Text style={[styles.sectionTitle, { color: textCol, marginTop: 8 }]}>All Inventory</Text>
          {inventory.length === 0
            ? <View style={[styles.emptyCard, { backgroundColor: cardBg }]}>
              <Ionicons name="cube-outline" size={40} color={Colors.grey400} />
              <Text style={[styles.emptyText, { color: subCol }]}>No inventory yet. Add some!</Text>
            </View>
            : inventory.map(item => {
              const part = parts.find(p => p.id === item.partId);
              const rack = racks.find(r => r.id === item.rackId);
              const days = Math.ceil((new Date(item.useByDate) - new Date()) / (1000 * 60 * 60 * 24));
              const expColor = days < 0 ? Colors.danger : days < 60 ? Colors.warning : Colors.success;
              return (
                <View key={item.id} style={[styles.invRow, { backgroundColor: cardBg }]}>
                  <View style={[styles.invDot, { backgroundColor: expColor }]} />
                  <View style={styles.invBody}>
                    <Text style={[styles.invName, { color: textCol }]} numberOfLines={1}>
                      {part?.partName || 'Unknown'}
                    </Text>
                    <Text style={[styles.invMeta, { color: subCol }]}>
                      {rack?.rackName} • {rack?.level} • Qty: {item.quantity}
                    </Text>
                  </View>
                  <View style={[styles.expiryTag, { backgroundColor: expColor + '20' }]}>
                    <Text style={[styles.expiryTagText, { color: expColor }]}>
                      {days < 0 ? 'Expired' : `${days}d`}
                    </Text>
                  </View>
                </View>
              );
            })
          }
          <View style={{ height: 32 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  screen: { flex: 1 },
  banner: { padding: 20, paddingTop: 18, paddingBottom: 28 },
  bannerTitle: { fontSize: 22, fontWeight: '800', color: Colors.white },
  bannerSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 4, marginBottom: 16 },
  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: BorderRadius.md, padding: 14 },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '800', color: Colors.white },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 8 },

  body: { padding: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '800', marginBottom: 12 },

  actionCard: { flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.md, padding: 16, marginBottom: 10, ...Shadow.small },
  actionIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  actionBody: { flex: 1 },
  actionTitle: { fontSize: 15, fontWeight: '700' },
  actionSub: { fontSize: 12, marginTop: 3 },

  emptyCard: { borderRadius: BorderRadius.md, padding: 32, alignItems: 'center', ...Shadow.small },
  emptyText: { fontSize: 14, marginTop: 12, fontWeight: '600' },

  invRow: { flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.sm, padding: 12, marginBottom: 6, ...Shadow.small },
  invDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  invBody: { flex: 1 },
  invName: { fontSize: 13, fontWeight: '600' },
  invMeta: { fontSize: 11, marginTop: 2 },
  expiryTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 99 },
  expiryTagText: { fontSize: 11, fontWeight: '700' },
});

export default InventoryTabScreen;
