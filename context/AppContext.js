// context/AppContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext(null);

// ─── Seed Data ────────────────────────────────────────────────────────────────
const SEED_STORES = [
  { id: 'S001', storeName: 'Main Warehouse',  storeCode: 'MW01', description: 'Primary storage facility' },
  { id: 'S002', storeName: 'Cold Storage',    storeCode: 'CS01', description: 'Temperature controlled' },
];

const SEED_LOCATIONS = [
  { id: 'L001', locationName: 'Zone A',      locationCode: 'ZA01', storeId: 'S001' },
  { id: 'L002', locationName: 'Zone B',      locationCode: 'ZB01', storeId: 'S001' },
  { id: 'L003', locationName: 'Cold Zone 1', locationCode: 'CZ01', storeId: 'S002' },
];

const SEED_RACKS = [
  { id: 'R001', rackName: 'Rack A1',    rackCode: 'RA01', storeId: 'S001', locationId: 'L001', level: 'TOP',    maxCapacity: 100, currentCapacity: 30,  status: 'Active', qrCode: 'QR-RA01-S001-L001-TOP' },
  { id: 'R002', rackName: 'Rack A2',    rackCode: 'RA02', storeId: 'S001', locationId: 'L001', level: 'MIDDLE', maxCapacity: 100, currentCapacity: 80,  status: 'Active', qrCode: 'QR-RA02-S001-L001-MIDDLE' },
  { id: 'R003', rackName: 'Rack A3',    rackCode: 'RA03', storeId: 'S001', locationId: 'L001', level: 'BOTTOM', maxCapacity: 100, currentCapacity: 100, status: 'Active', qrCode: 'QR-RA03-S001-L001-BOTTOM' },
  { id: 'R004', rackName: 'Rack B1',    rackCode: 'RB01', storeId: 'S001', locationId: 'L002', level: 'TOP',    maxCapacity: 150, currentCapacity: 0,   status: 'Active', qrCode: 'QR-RB01-S001-L002-TOP' },
  { id: 'R005', rackName: 'Rack B2',    rackCode: 'RB02', storeId: 'S001', locationId: 'L002', level: 'MIDDLE', maxCapacity: 150, currentCapacity: 60,  status: 'Active', qrCode: 'QR-RB02-S001-L002-MIDDLE' },
  { id: 'R006', rackName: 'Cold Rack 1',rackCode: 'CR01', storeId: 'S002', locationId: 'L003', level: 'TOP',    maxCapacity: 80,  currentCapacity: 20,  status: 'Active', qrCode: 'QR-CR01-S002-L003-TOP' },
  { id: 'R007', rackName: 'Cold Rack 2',rackCode: 'CR02', storeId: 'S002', locationId: 'L003', level: 'MIDDLE', maxCapacity: 80,  currentCapacity: 0,   status: 'Active', qrCode: 'QR-CR02-S002-L003-MIDDLE' },
  { id: 'R008', rackName: 'Cold Rack 3',rackCode: 'CR03', storeId: 'S002', locationId: 'L003', level: 'BOTTOM', maxCapacity: 80,  currentCapacity: 40,  status: 'Active', qrCode: 'QR-CR03-S002-L003-BOTTOM' },
];

const SEED_PARTS = [
  { id: 'P001', partName: 'Hydraulic Pump',  partNumber: 'HP-001', category: 'Mechanical',  manufacturer: 'Bosch',   unit: 'Nos', description: 'High pressure hydraulic pump' },
  { id: 'P002', partName: 'Control Board',   partNumber: 'CB-002', category: 'Electrical',  manufacturer: 'Siemens', unit: 'Nos', description: 'PLC control board' },
  { id: 'P003', partName: 'Bearing Set',     partNumber: 'BS-003', category: 'Mechanical',  manufacturer: 'SKF',     unit: 'Set', description: 'Ball bearing set 6205' },
  { id: 'P004', partName: 'Pressure Gauge',  partNumber: 'PG-004', category: 'Instruments', manufacturer: 'Wika',    unit: 'Nos', description: '0-100 bar pressure gauge' },
  { id: 'P005', partName: 'O-Ring Kit',      partNumber: 'OR-005', category: 'Seals',       manufacturer: 'Parker',  unit: 'Kit', description: 'Assorted O-ring kit' },
];

const today = new Date().toISOString().split('T')[0];
const SEED_INVENTORY = [
  { id: 'INV001', partId: 'P001', quantity: 10, useByDate: '2026-12-31', storeId: 'S001', locationId: 'L001', rackId: 'R001', addedDate: today },
  { id: 'INV002', partId: 'P002', quantity: 25, useByDate: '2025-08-30', storeId: 'S001', locationId: 'L001', rackId: 'R002', addedDate: today },
  { id: 'INV003', partId: 'P003', quantity: 80, useByDate: '2025-03-15', storeId: 'S001', locationId: 'L001', rackId: 'R003', addedDate: today },
  { id: 'INV004', partId: 'P004', quantity: 60, useByDate: '2025-07-01', storeId: 'S001', locationId: 'L002', rackId: 'R005', addedDate: today },
  { id: 'INV005', partId: 'P005', quantity: 20, useByDate: '2026-06-30', storeId: 'S002', locationId: 'L003', rackId: 'R006', addedDate: today },
];

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AppProvider = ({ children }) => {
  const [stores,    setStores]    = useState(SEED_STORES);
  const [locations, setLocations] = useState(SEED_LOCATIONS);
  const [racks,     setRacks]     = useState(SEED_RACKS);
  const [parts,     setParts]     = useState(SEED_PARTS);
  const [inventory, setInventory] = useState(SEED_INVENTORY);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('rms_dark').then(v => {
      if (v !== null) setIsDarkMode(v === 'true');
    });
  }, []);

  const toggleDarkMode = async () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    await AsyncStorage.setItem('rms_dark', String(next));
  };

  // ── Store CRUD ──────────────────────────────────────────────────────────────
  const addStore    = (d) => { const n = { ...d, id: `S${Date.now()}` }; setStores(p => [...p, n]); return n; };
  const updateStore = (id, d) => setStores(p => p.map(s => s.id === id ? { ...s, ...d } : s));
  const deleteStore = (id)    => setStores(p => p.filter(s => s.id !== id));

  // ── Location CRUD ───────────────────────────────────────────────────────────
  const addLocation    = (d) => { const n = { ...d, id: `L${Date.now()}` }; setLocations(p => [...p, n]); return n; };
  const updateLocation = (id, d) => setLocations(p => p.map(l => l.id === id ? { ...l, ...d } : l));
  const deleteLocation = (id)    => setLocations(p => p.filter(l => l.id !== id));

  // ── Rack CRUD ───────────────────────────────────────────────────────────────
  const addRack = (d) => {
    const id = `R${Date.now()}`;
    const qrCode = `QR-${d.rackCode}-${d.storeId}-${d.locationId}-${d.level}`;
    const n = { ...d, id, qrCode, currentCapacity: 0 };
    setRacks(p => [...p, n]);
    return n;
  };
  const updateRack = (id, d) => setRacks(p => p.map(r => r.id === id ? { ...r, ...d } : r));
  const deleteRack = (id)    => setRacks(p => p.filter(r => r.id !== id));

  // ── Part CRUD ───────────────────────────────────────────────────────────────
  const addPart    = (d) => { const n = { ...d, id: `P${Date.now()}` }; setParts(p => [...p, n]); return n; };
  const updatePart = (id, d) => setParts(p => p.map(x => x.id === id ? { ...x, ...d } : x));
  const deletePart = (id)    => setParts(p => p.filter(x => x.id !== id));

  // ── Smart Rack Allocation ────────────────────────────────────────────────────
  // Far expiry (>180 days)  → TOP
  // Medium expiry (60-180)  → MIDDLE
  // Near expiry  (<60 days) → BOTTOM
  // Falls back to any level if preferred is full.
  const suggestRack = (quantity, useByDate, storeId, locationId) => {
    const days = Math.ceil(
      (new Date(useByDate) - new Date()) / (1000 * 60 * 60 * 24)
    );
    const preferredLevel = days > 180 ? 'TOP' : days >= 60 ? 'MIDDLE' : 'BOTTOM';

    const eligible = racks.filter(r =>
      r.storeId === storeId &&
      r.locationId === locationId &&
      r.status === 'Active' &&
      (r.maxCapacity - r.currentCapacity) >= quantity
    );
    if (!eligible.length) return null;

    const levelOrder = [preferredLevel, ...['TOP','MIDDLE','BOTTOM'].filter(l => l !== preferredLevel)];
    for (const level of levelOrder) {
      const cands = eligible.filter(r => r.level === level);
      if (cands.length) {
        cands.sort((a,b) => (b.maxCapacity - b.currentCapacity) - (a.maxCapacity - a.currentCapacity));
        return { rack: cands[0], preferredLevel, daysToExpiry: days };
      }
    }
    eligible.sort((a,b) => (b.maxCapacity - b.currentCapacity) - (a.maxCapacity - a.currentCapacity));
    return { rack: eligible[0], preferredLevel, daysToExpiry: days };
  };

  // ── Inventory Operations ─────────────────────────────────────────────────────
  const addInventory = (item) => {
    const n = { ...item, id: `INV${Date.now()}`, addedDate: new Date().toISOString().split('T')[0] };
    setInventory(p => [...p, n]);
    setRacks(p => p.map(r => r.id === item.rackId
      ? { ...r, currentCapacity: r.currentCapacity + item.quantity }
      : r
    ));
    return n;
  };

  const removeInventoryQty = (inventoryId, qty) => {
    const item = inventory.find(i => i.id === inventoryId);
    if (!item) return;
    const removed = Math.min(qty, item.quantity);
    if (qty >= item.quantity) {
      setInventory(p => p.filter(i => i.id !== inventoryId));
    } else {
      setInventory(p => p.map(i => i.id === inventoryId ? { ...i, quantity: i.quantity - qty } : i));
    }
    setRacks(p => p.map(r => r.id === item.rackId
      ? { ...r, currentCapacity: Math.max(0, r.currentCapacity - removed) }
      : r
    ));
  };

  const moveInventory = (inventoryId, newRackId) => {
    const item = inventory.find(i => i.id === inventoryId);
    if (!item) return;
    const newRack = racks.find(r => r.id === newRackId);
    // Adjust capacities
    setRacks(p => p.map(r => {
      if (r.id === item.rackId) return { ...r, currentCapacity: Math.max(0, r.currentCapacity - item.quantity) };
      if (r.id === newRackId)   return { ...r, currentCapacity: r.currentCapacity + item.quantity };
      return r;
    }));
    setInventory(p => p.map(i => i.id === inventoryId
      ? { ...i, rackId: newRackId, locationId: newRack?.locationId || i.locationId, storeId: newRack?.storeId || i.storeId }
      : i
    ));
  };

  // ── Dashboard Stats ──────────────────────────────────────────────────────────
  const getDashboardStats = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    return {
      totalStores:    stores.length,
      totalLocations: locations.length,
      totalRacks:     racks.length,
      totalParts:     parts.length,
      occupiedRacks:  racks.filter(r => r.currentCapacity > 0).length,
      emptyRacks:     racks.filter(r => r.currentCapacity === 0).length,
      fullRacks:      racks.filter(r => r.currentCapacity >= r.maxCapacity).length,
      todayEntries:   inventory.filter(i => i.addedDate === todayStr).length,
      totalInventory: inventory.reduce((s, i) => s + i.quantity, 0),
    };
  };

  // ── Search ───────────────────────────────────────────────────────────────────
  const searchInventory = (query) => {
    if (!query.trim()) return inventory;
    const q = query.toLowerCase();
    return inventory.filter(item => {
      const part     = parts.find(p => p.id === item.partId);
      const rack     = racks.find(r => r.id === item.rackId);
      const location = locations.find(l => l.id === item.locationId);
      const store    = stores.find(s => s.id === item.storeId);
      return (
        part?.partName.toLowerCase().includes(q)      ||
        part?.partNumber.toLowerCase().includes(q)    ||
        rack?.rackName.toLowerCase().includes(q)      ||
        rack?.rackCode.toLowerCase().includes(q)      ||
        rack?.qrCode.toLowerCase().includes(q)        ||
        location?.locationName.toLowerCase().includes(q) ||
        store?.storeName.toLowerCase().includes(q)
      );
    });
  };

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const getStoreById        = (id) => stores.find(s => s.id === id);
  const getLocationById     = (id) => locations.find(l => l.id === id);
  const getRackById         = (id) => racks.find(r => r.id === id);
  const getPartById         = (id) => parts.find(p => p.id === id);
  const getLocationsByStore = (sid) => locations.filter(l => l.storeId === sid);
  const getRacksByLocation  = (lid) => racks.filter(r => r.locationId === lid);
  const getInventoryByRack  = (rid) => inventory.filter(i => i.rackId === rid);

  return (
    <AppContext.Provider value={{
      stores, locations, racks, parts, inventory, isDarkMode,
      addStore, updateStore, deleteStore,
      addLocation, updateLocation, deleteLocation,
      addRack, updateRack, deleteRack,
      addPart, updatePart, deletePart,
      addInventory, removeInventoryQty, moveInventory,
      suggestRack,
      getDashboardStats,
      searchInventory,
      getStoreById, getLocationById, getRackById, getPartById,
      getLocationsByStore, getRacksByLocation, getInventoryByRack,
      toggleDarkMode,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};
