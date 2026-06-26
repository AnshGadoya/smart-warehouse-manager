// navigation/AppNavigator.js
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Colors } from '../styles/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ── Screens ──────────────────────────────────────────────────────────────────
import LoginScreen         from '../screens/LoginScreen';
import DashboardScreen     from '../screens/DashboardScreen';
import MastersTabScreen    from '../screens/MastersTabScreen';
import InventoryTabScreen  from '../screens/Inventory/InventoryTabScreen';
import RackViewScreen      from '../screens/RackViewScreen';
import SettingsScreen      from '../screens/SettingsScreen';

// Masters
import StoreMasterScreen    from '../screens/Masters/StoreMasterScreen';
import LocationMasterScreen from '../screens/Masters/LocationMasterScreen';
import RackMasterScreen     from '../screens/Masters/RackMasterScreen';
import PartMasterScreen     from '../screens/Masters/PartMasterScreen';

// Inventory
import AddInventoryScreen    from '../screens/Inventory/AddInventoryScreen';
import RemoveInventoryScreen from '../screens/Inventory/RemoveInventoryScreen';
import MoveInventoryScreen   from '../screens/Inventory/MoveInventoryScreen';
import SearchInventoryScreen from '../screens/Inventory/SearchInventoryScreen';

const Stack  = createNativeStackNavigator();
const Tab    = createBottomTabNavigator();

// ── Masters Stack ─────────────────────────────────────────────────────────────
const MastersStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MastersTab"      component={MastersTabScreen} />
    <Stack.Screen name="StoreMaster"     component={StoreMasterScreen} />
    <Stack.Screen name="LocationMaster"  component={LocationMasterScreen} />
    <Stack.Screen name="RackMaster"      component={RackMasterScreen} />
    <Stack.Screen name="PartMaster"      component={PartMasterScreen} />
  </Stack.Navigator>
);

// ── Inventory Stack ───────────────────────────────────────────────────────────
const InventoryStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="InventoryTab"     component={InventoryTabScreen} />
    <Stack.Screen name="AddInventory"     component={AddInventoryScreen} />
    <Stack.Screen name="RemoveInventory"  component={RemoveInventoryScreen} />
    <Stack.Screen name="MoveInventory"    component={MoveInventoryScreen} />
    <Stack.Screen name="SearchInventory"  component={SearchInventoryScreen} />
  </Stack.Navigator>
);

// ── Dashboard Stack (to allow navigation.navigate from dashboard) ─────────────
const DashboardStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DashboardMain" component={DashboardScreen} />
  </Stack.Navigator>
);

// ── Bottom Tabs ───────────────────────────────────────────────────────────────
const MainTabs = () => {
  const { isDarkMode } = useApp();
  const insets = useSafeAreaInsets();
  const tabBg    = isDarkMode ? Colors.darkCard       : Colors.white;
  const inactiveC = isDarkMode ? Colors.darkTextSecondary : Colors.grey500;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: tabBg,
          borderTopColor: isDarkMode ? Colors.darkBorder : Colors.grey200,
          height: 62 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 6,
        },
        tabBarActiveTintColor:   Colors.primary,
        tabBarInactiveTintColor: inactiveC,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
        tabBarIcon: ({ color, size, focused }) => {
          const icons = {
            Dashboard: focused ? 'grid'       : 'grid-outline',
            Masters:   focused ? 'library'    : 'library-outline',
            Inventory: focused ? 'cube'        : 'cube-outline',
            RackView:  focused ? 'layers'      : 'layers-outline',
            Settings:  focused ? 'settings'    : 'settings-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack}  />
      <Tab.Screen name="Masters"   component={MastersStack}    />
      <Tab.Screen name="Inventory" component={InventoryStack}  />
      <Tab.Screen name="RackView"  component={RackViewScreen}  options={{ title: 'Rack View' }} />
      <Tab.Screen name="Settings"  component={SettingsScreen}  />
    </Tab.Navigator>
  );
};

// ── Root ──────────────────────────────────────────────────────────────────────
const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user
          ? <Stack.Screen name="Main"  component={MainTabs} />
          : <Stack.Screen name="Login" component={LoginScreen} />
        }
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
});

export default AppNavigator;
