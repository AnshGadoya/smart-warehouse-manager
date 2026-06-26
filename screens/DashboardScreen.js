// screens/DashboardScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Colors, BorderRadius, Shadow } from '../styles/theme';
import { formatDate, getRackFillPercent } from '../utils/helpers';

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color }) => {
  const { isDarkMode } = useApp();
  const cardBg = isDarkMode ? Colors.darkCard : Colors.white;
  const textCol = isDarkMode ? Colors.darkText : Colors.textPrimary;
  const subCol = isDarkMode ? Colors.darkTextSecondary : Colors.textSecondary;

  return (
    <View style={[styles.statCard, { backgroundColor: cardBg }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.statInfo}>
        <Text style={[styles.statValue, { color: textCol }]}>{value}</Text>
        <Text style={[styles.statLabel, { color: subCol }]}>{label}</Text>
      </View>
    </View>
  );
};

// ─── Quick Action ─────────────────────────────────────────────────────────────
const QuickAction = ({ icon, label, color, onPress }) => (
  <TouchableOpacity style={[styles.qa, { backgroundColor: color + '15' }]} onPress={onPress} activeOpacity={0.75}>
    <View style={[styles.qaIcon, { backgroundColor: color + '25' }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={[styles.qaLabel, { color }]}>{label}</Text>
  </TouchableOpacity>
);

// ─── Screen ───────────────────────────────────────────────────────────────────
const DashboardScreen = ({ navigation }) => {
  const { getDashboardStats, racks, inventory, parts, isDarkMode } = useApp();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const stats = getDashboardStats();
  const bg = isDarkMode ? Colors.darkBackground : Colors.background;
  const cardBg = isDarkMode ? Colors.darkCard : Colors.white;
  const textCol = isDarkMode ? Colors.darkText : Colors.textPrimary;
  const subCol = isDarkMode ? Colors.darkTextSecondary : Colors.textSecondary;

  // Overall capacity
  const totalMax = racks.reduce((s, r) => s + r.maxCapacity, 0);
  const totalUsed = racks.reduce((s, r) => s + r.currentCapacity, 0);
  const capPct = totalMax ? Math.round((totalUsed / totalMax) * 100) : 0;
  const capColor = capPct < 60 ? Colors.success : capPct < 85 ? Colors.warning : Colors.danger;

  // Recent 5 inventory entries
  const recent = [...inventory]
    .sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate))
    .slice(0, 5);

  const onRefresh = () => { setRefreshing(true); setTimeout(() => setRefreshing(false), 600); };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors.primaryDark }]} edges={['top']}>
      <ScrollView
        style={[styles.screen, { backgroundColor: bg }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      >
        {/* ── Banner ── */}
        <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.banner}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
            <Text style={styles.bannerDate}>{formatDate(new Date().toISOString())}</Text>
          </View>
          <View style={styles.roleChip}>
            <Ionicons name="shield-checkmark-outline" size={14} color={Colors.accentLight} />
            <Text style={styles.roleText}>{user?.role}</Text>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* ── Overview ── */}
          <Text style={[styles.section, { color: textCol }]}>📊 Overview</Text>
          <View style={styles.grid}>
            <StatCard icon="business-outline" label="Stores" value={stats.totalStores} color={Colors.primary} />
            <StatCard icon="location-outline" label="Locations" value={stats.totalLocations} color={Colors.accent} />
            <StatCard icon="layers-outline" label="Racks" value={stats.totalRacks} color="#8E24AA" />
            <StatCard icon="construct-outline" label="Parts" value={stats.totalParts} color={Colors.warning} />
          </View>

          {/* ── Rack Status ── */}
          <Text style={[styles.section, { color: textCol }]}>📦 Rack Status</Text>
          <View style={styles.grid}>
            <StatCard icon="checkmark-circle-outline" label="Occupied" value={stats.occupiedRacks} color={Colors.warning} />
            <StatCard icon="radio-button-off-outline" label="Empty" value={stats.emptyRacks} color={Colors.success} />
            <StatCard icon="alert-circle-outline" label="Full" value={stats.fullRacks} color={Colors.danger} />
            <StatCard icon="today-outline" label="Today Entries" value={stats.todayEntries} color={Colors.info} />
          </View>

          {/* ── Capacity Bar ── */}
          <View style={[styles.capCard, { backgroundColor: cardBg }]}>
            <View style={styles.capHeader}>
              <Text style={[styles.capTitle, { color: textCol }]}>Overall Warehouse Capacity</Text>
              <Text style={[styles.capPct, { color: capColor }]}>{capPct}%</Text>
            </View>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { width: `${capPct}%`, backgroundColor: capColor }]} />
            </View>
            <View style={styles.capRow}>
              <Text style={[styles.capSub, { color: subCol }]}>Used: {totalUsed}</Text>
              <Text style={[styles.capSub, { color: subCol }]}>Total: {totalMax}</Text>
            </View>
          </View>

          {/* ── Quick Actions ── */}
          <Text style={[styles.section, { color: textCol }]}>⚡ Quick Actions</Text>
          <View style={styles.qaRow}>
            <QuickAction icon="add-circle-outline" label="Add Inventory" color={Colors.primary} onPress={() => navigation.getParent()?.navigate('Inventory')} />
            <QuickAction icon="qr-code-outline" label="Scan QR" color="#8E24AA" onPress={() => navigation.getParent()?.navigate('Inventory')} />
            <QuickAction icon="grid-outline" label="Rack View" color={Colors.accent} onPress={() => navigation.getParent()?.navigate('RackView')} />
            <QuickAction icon="search-outline" label="Search" color={Colors.warning} onPress={() => navigation.getParent()?.navigate('Inventory')} />
          </View>

          {/* ── Recent Activity ── */}
          <Text style={[styles.section, { color: textCol }]}>🕐 Recent Activity</Text>
          {recent.length === 0
            ? <Text style={[styles.noData, { color: subCol }]}>No recent activity</Text>
            : recent.map(item => {
              const part = parts.find(p => p.id === item.partId);
              return (
                <View key={item.id} style={[styles.actItem, { backgroundColor: cardBg }]}>
                  <View style={styles.actIconBox}>
                    <Ionicons name="cube" size={18} color={Colors.primary} />
                  </View>
                  <View style={styles.actBody}>
                    <Text style={[styles.actTitle, { color: textCol }]} numberOfLines={1}>
                      {part?.partName || 'Unknown Part'}
                    </Text>
                    <Text style={[styles.actSub, { color: subCol }]}>
                      Qty: {item.quantity} • {formatDate(item.addedDate)}
                    </Text>
                  </View>
                  <View style={styles.actBadge}>
                    <Text style={styles.actBadgeText}>+{item.quantity}</Text>
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
  banner: { paddingTop: 16, paddingBottom: 28, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greeting: { fontSize: 20, fontWeight: '800', color: Colors.white },
  bannerDate: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 4 },
  roleChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99 },
  roleText: { fontSize: 12, color: Colors.white, fontWeight: '600' },

  body: { padding: 16 },
  section: { fontSize: 14, fontWeight: '800', marginTop: 12, marginBottom: 10 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 },
  statCard: {
    flex: 1,
    minWidth: '46%',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    padding: 12,
    ...Shadow.small,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statInfo: {
    marginLeft: 10,
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },

  capCard: { borderRadius: BorderRadius.md, padding: 16, marginBottom: 4, ...Shadow.small },
  capHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  capTitle: { fontSize: 13, fontWeight: '700' },
  capPct: { fontSize: 16, fontWeight: '800' },
  barBg: { height: 10, backgroundColor: Colors.grey200, borderRadius: 99, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 99 },
  capRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  capSub: { fontSize: 11 },

  qaRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  qa: { flex: 1, alignItems: 'center', padding: 12, borderRadius: BorderRadius.md, gap: 6 },
  qaIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  qaLabel: { fontSize: 9, fontWeight: '700', textAlign: 'center' },

  actItem: { flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.md, padding: 12, marginBottom: 8, ...Shadow.small },
  actIconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary + '18', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  actBody: { flex: 1 },
  actTitle: { fontSize: 13, fontWeight: '600' },
  actSub: { fontSize: 11, marginTop: 2 },
  actBadge: { backgroundColor: Colors.successLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  actBadgeText: { fontSize: 12, color: Colors.success, fontWeight: '700' },
  noData: { textAlign: 'center', padding: 20, fontSize: 13 },
});

export default DashboardScreen;
