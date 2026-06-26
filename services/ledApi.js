// services/ledApi.js
// Mock API — replace BASE_URL with real server when available.

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

export const ledApi = {
  on: async (rackId, rackCode) => {
    await delay(300);
    console.log(`[LED] POST /led/on  → ${rackCode}`);
    return { success: true, rackId, rackCode, status: 'ON' };
  },
  off: async (rackId, rackCode) => {
    await delay(300);
    console.log(`[LED] POST /led/off → ${rackCode}`);
    return { success: true, rackId, rackCode, status: 'OFF' };
  },
};
