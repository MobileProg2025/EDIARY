// API Configuration
// Instructions: Change the ACTIVE_IP_INDEX to switch between IPs

const API_CONFIGS = [
  "http://192.168.1.8:3000/api",   // Index 0 - Ken IP
  "http://10.0.0.34:3000/api",     // Index 1 - Dennis IP
  "http://10.0.2.2:3000/api",      // Index 2 - Android Emulator
  "http://localhost:3000/api",     // Index 3 - iOS Simulator
];

// Change this index to switch between IPs (0, 1, 2, 3, or 4)
const ACTIVE_IP_INDEX = 0;


export const API_BASE_URL = API_CONFIGS[ACTIVE_IP_INDEX];
