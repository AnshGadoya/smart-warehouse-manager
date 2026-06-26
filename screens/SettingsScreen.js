// screens/SettingsScreen.js
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Colors, BorderRadius, Shadow } from '../styles/theme';

const SettingRow = ({ icon, label, value, onPress, rightElement, color, bg, textCol, subCol }) => (
  <TouchableOpacity
    style={[styles.row, { backgroundColor: bg }]}
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View style={[styles.rowIcon, { backgroundColor: (color || Colors.primary) + '18' }]}>
      <Ionicons name={icon} size={20} color={color || Colors.primary} />
    </View>
    <View style={styles.rowBody}>
      <Text style={[styles.rowLabel, { color: textCol }]}>{label}</Text>
      {value ? <Text style={[styles.rowValue, { color: subCol }]}>{value}</Text> : null}
    </View>
    {rightElement || (onPress ? <Ionicons name="chevron-forward" size={18} color={Colors.grey400} /> : null)}
  </TouchableOpacity>
);

const SectionHeader = ({ title, textCol }) => (
  <Text style={[styles.sectionHeader, { color: textCol }]}>{title}</Text>
);

const SettingsScreen = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode, getDashboardStats } = useApp();

  const bg = isDarkMode ? Colors.darkBackground : Colors.background;
  const cardBg = isDarkMode ? Colors.darkCard : Colors.white;
  const textCol = isDarkMode ? Colors.darkText : Colors.textPrimary;
  const subCol = isDarkMode ? Colors.darkTextSecondary : Colors.textSecondary;

  const stats = getDashboardStats();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors.primaryDark }]} edges={['top']}>
      <ScrollView style={[styles.screen, { backgroundColor: bg }]} showsVerticalScrollIndicator={false}>
        {/* Profile Banner */}
        <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.profileBanner}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userRole}>{user?.role} • @{user?.username}</Text>

          {/* Mini stats */}
          <View style={styles.miniStats}>
            {[
              { label: 'Racks', value: stats.totalRacks },
              { label: 'Parts', value: stats.totalParts },
              { label: 'Stores', value: stats.totalStores },
            ].map(s => (
              <View key={s.label} style={styles.miniStat}>
                <Text style={styles.miniStatNum}>{s.value}</Text>
                <Text style={styles.miniStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Appearance */}
          <SectionHeader title="APPEARANCE" textCol={subCol} />
          <View style={[styles.section, { backgroundColor: cardBg }]}>
            <SettingRow
              icon={isDarkMode ? 'moon' : 'sunny'}
              label="Dark Mode"
              value={isDarkMode ? 'On' : 'Off'}
              color={isDarkMode ? '#8E24AA' : Colors.warning}
              bg={cardBg} textCol={textCol} subCol={subCol}
              rightElement={
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleDarkMode}
                  trackColor={{ false: Colors.grey300, true: Colors.primary + '80' }}
                  thumbColor={isDarkMode ? Colors.primary : Colors.grey400}
                />
              }
            />
          </View>

          {/* System Info */}
          <SectionHeader title="SYSTEM INFO" textCol={subCol} />
          <View style={[styles.section, { backgroundColor: cardBg }]}>
            <SettingRow icon="layers-outline" label="Total Racks" value={`${stats.totalRacks}`} bg={cardBg} textCol={textCol} subCol={subCol} color={Colors.primary} />
            <View style={styles.divider} />
            <SettingRow icon="cube-outline" label="Total Inventory" value={`${stats.totalInventory || 0} units`} bg={cardBg} textCol={textCol} subCol={subCol} color={Colors.accent} />
            <View style={styles.divider} />
            <SettingRow icon="checkmark-circle-outline" label="Occupied Racks" value={`${stats.occupiedRacks}`} bg={cardBg} textCol={textCol} subCol={subCol} color={Colors.warning} />
            <View style={styles.divider} />
            <SettingRow icon="alert-circle-outline" label="Full Racks" value={`${stats.fullRacks}`} bg={cardBg} textCol={textCol} subCol={subCol} color={Colors.danger} />
          </View>

          {/* App Info */}
          <SectionHeader title="ABOUT" textCol={subCol} />
          <View style={[styles.section, { backgroundColor: cardBg }]}>
            <SettingRow icon="information-circle-outline" label="App Version" value="1.0.0" bg={cardBg} textCol={textCol} subCol={subCol} color={Colors.info} />
            <View style={styles.divider} />
            <SettingRow icon="business-outline" label="Company" value="Ansh TEch" bg={cardBg} textCol={textCol} subCol={subCol} color={Colors.primary} />
            <View style={styles.divider} />
            <SettingRow icon="code-slash-outline" label="Platform" value="Expo SDK 54" bg={cardBg} textCol={textCol} subCol={subCol} color="#8E24AA" />
          </View>

          {/* Logout */}
          <SectionHeader title="ACCOUNT" textCol={subCol} />
          <View style={[styles.section, { backgroundColor: cardBg }]}>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
              <Ionicons name="log-out-outline" size={22} color={Colors.danger} />
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.footerText, { color: subCol }]}>
            © 2024 Ansh TEch{'\n'}Rack Monitoring System v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  screen: { flex: 1 },
  profileBanner: { padding: 24, alignItems: 'center', paddingTop: 20, paddingBottom: 28 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarLetter: { fontSize: 34, fontWeight: '800', color: Colors.white },
  userName: { fontSize: 20, fontWeight: '800', color: Colors.white },
  userRole: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4, marginBottom: 16 },
  miniStats: { flexDirection: 'row', gap: 24 },
  miniStat: { alignItems: 'center' },
  miniStatNum: { fontSize: 20, fontWeight: '800', color: Colors.white },
  miniStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2 },

  body: { padding: 16 },
  sectionHeader: { fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 6, marginTop: 8, marginLeft: 4 },
  section: { borderRadius: BorderRadius.md, marginBottom: 8, overflow: 'hidden', ...Shadow.small },
  divider: { height: 1, backgroundColor: Colors.grey100, marginHorizontal: 16 },

  row: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  rowIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowBody: { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: '600' },
  rowValue: { fontSize: 12, marginTop: 2 },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, justifyContent: 'center' },
  logoutText: { fontSize: 16, fontWeight: '700', color: Colors.danger },

  footerText: { textAlign: 'center', fontSize: 12, lineHeight: 20, marginTop: 24, marginBottom: 40 },
});

export default SettingsScreen;
