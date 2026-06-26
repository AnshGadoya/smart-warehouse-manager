// screens/MastersTabScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Colors, BorderRadius, Shadow } from '../styles/theme';

const MASTERS = [
  { title: 'Store Master', subtitle: 'Manage warehouse stores', icon: 'business', color: Colors.primary, screen: 'StoreMaster' },
  { title: 'Location Master', subtitle: 'Manage zones & locations', icon: 'location', color: Colors.accent, screen: 'LocationMaster' },
  { title: 'Rack Master', subtitle: 'Manage racks & generate QR codes', icon: 'layers', color: '#8E24AA', screen: 'RackMaster' },
  { title: 'Part Master', subtitle: 'Manage parts & spare inventory', icon: 'construct', color: Colors.warning, screen: 'PartMaster' },
];

const MastersTabScreen = ({ navigation }) => {
  const { stores, locations, racks, parts, isDarkMode } = useApp();

  const bg = isDarkMode ? Colors.darkBackground : Colors.background;
  const cardBg = isDarkMode ? Colors.darkCard : Colors.white;
  const textCol = isDarkMode ? Colors.darkText : Colors.textPrimary;
  const subCol = isDarkMode ? Colors.darkTextSecondary : Colors.textSecondary;

  const counts = [stores.length, locations.length, racks.length, parts.length];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors.primaryDark }]} edges={['top']}>
      <ScrollView style={[styles.screen, { backgroundColor: bg }]} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[Colors.primaryDark, Colors.primaryLight]} style={styles.banner}>
          <Text style={styles.bannerTitle}>Master Data</Text>
          <Text style={styles.bannerSub}>Configure stores, locations, racks & parts</Text>
        </LinearGradient>

        <View style={styles.body}>
          {MASTERS.map((item, idx) => (
            <TouchableOpacity
              key={item.screen}
              style={[styles.card, { backgroundColor: cardBg }]}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.8}
            >
              <View style={[styles.iconBox, { backgroundColor: item.color + '18' }]}>
                <Ionicons name={item.icon} size={28} color={item.color} />
              </View>
              <View style={styles.cardBody}>
                <Text style={[styles.cardTitle, { color: textCol }]}>{item.title}</Text>
                <Text style={[styles.cardSub, { color: subCol }]}>{item.subtitle}</Text>
              </View>
              <View style={styles.countBox}>
                <Text style={[styles.count, { color: item.color }]}>{counts[idx]}</Text>
                <Text style={[styles.countLabel, { color: subCol }]}>records</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.grey400} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          ))}
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
  bannerSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 4 },
  body: { padding: 16, gap: 10 },
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.md, padding: 16, ...Shadow.small },
  iconBox: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700' },
  cardSub: { fontSize: 12, marginTop: 3 },
  countBox: { alignItems: 'center', marginRight: 4 },
  count: { fontSize: 22, fontWeight: '800' },
  countLabel: { fontSize: 10, marginTop: 1 },
});

export default MastersTabScreen;
