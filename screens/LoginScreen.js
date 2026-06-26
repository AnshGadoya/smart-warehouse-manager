// screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert,
  KeyboardAvoidingView, Platform, TouchableOpacity, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import { Colors, BorderRadius, Shadow } from '../styles/theme';

const LoginScreen = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!username.trim()) e.username = 'Username is required';
    if (!password.trim()) e.password = 'Password is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(username, password, rememberMe);
    } catch (err) {
      Alert.alert('Login Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Top gradient banner */}
        <LinearGradient colors={[Colors.primaryDark, Colors.primary, Colors.primaryLight]} style={styles.banner}>
          <View style={styles.logoRing}>
            <Ionicons name="layers" size={52} color={Colors.white} />
          </View>
          <Text style={styles.appName}>Rack Monitoring System</Text>
          <Text style={styles.appSub}>Smart Warehouse Management</Text>
        </LinearGradient>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome Back 👋</Text>
          <Text style={styles.cardSub}>Sign in to your account</Text>

          <Input
            label="Username"
            value={username}
            onChangeText={t => { setUsername(t); setErrors(e => ({...e, username:''})); }}
            placeholder="Enter username"
            leftIcon="person-outline"
            error={errors.username}
            autoCapitalize="none"
            required
          />

          <Input
            label="Password"
            value={password}
            onChangeText={t => { setPassword(t); setErrors(e => ({...e, password:''})); }}
            placeholder="Enter password"
            leftIcon="lock-closed-outline"
            secureTextEntry
            error={errors.password}
            required
          />

          <TouchableOpacity style={styles.remRow} onPress={() => setRememberMe(r => !r)} activeOpacity={0.7}>
            <View style={[styles.cb, rememberMe && styles.cbOn]}>
              {rememberMe && <Ionicons name="checkmark" size={13} color="#fff" />}
            </View>
            <Text style={styles.remText}>Remember me</Text>
          </TouchableOpacity>

          <Button title="Sign In" onPress={handleLogin} loading={loading} size="lg" style={{ marginBottom: 16 }} />

          <View style={styles.hint}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.info} />
            <Text style={styles.hintText}>
              Demo credentials: <Text style={styles.hintBold}>admin / admin123</Text>
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>© 2024 Ansh TEch</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scroll:   { flexGrow: 1, backgroundColor: Colors.primary },
  banner:   { alignItems: 'center', paddingTop: 72, paddingBottom: 52 },
  logoRing: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 18, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
  },
  appName:  { fontSize: 24, fontWeight: '800', color: Colors.white, letterSpacing: 0.5 },
  appSub:   { fontSize: 13, color: 'rgba(255,255,255,0.72)', marginTop: 6 },
  card: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    marginTop: -4, flex: 1,
    padding: 28, paddingTop: 32,
    ...Shadow.large,
  },
  cardTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  cardSub:   { fontSize: 13, color: Colors.textMuted, marginBottom: 24 },
  remRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  cb: {
    width: 20, height: 20, borderRadius: 5,
    borderWidth: 2, borderColor: Colors.grey300,
    marginRight: 10, alignItems: 'center', justifyContent: 'center',
  },
  cbOn:     { backgroundColor: Colors.primary, borderColor: Colors.primary },
  remText:  { fontSize: 13, color: Colors.textSecondary },
  hint: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.infoLight, padding: 12,
    borderRadius: BorderRadius.sm, marginTop: 4,
  },
  hintText: { fontSize: 12, color: Colors.info, flex: 1 },
  hintBold: { fontWeight: '700' },
  footer:   { textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 11, padding: 16, backgroundColor: Colors.primary },
});

export default LoginScreen;
