// context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

const DUMMY_USERS = [
  { username: 'admin', password: 'admin123', name: 'Administrator', role: 'Admin' },
  { username: 'user',  password: 'user123',  name: 'Warehouse User', role: 'User' },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('rms_user').then(val => {
      if (val) setUser(JSON.parse(val));
    }).finally(() => setIsLoading(false));
  }, []);

  const login = async (username, password, rememberMe) => {
    const found = DUMMY_USERS.find(
      u => u.username === username.trim() && u.password === password
    );
    if (!found) throw new Error('Invalid username or password');
    const session = { username: found.username, name: found.name, role: found.role };
    setUser(session);
    if (rememberMe) await AsyncStorage.setItem('rms_user', JSON.stringify(session));
    return session;
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('rms_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
