import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.amaar.app",
  appName: "Amaar",
  webDir: "dist",
  server: {
    androidScheme: "http",
    cleartext: true,
  },
};

export default config;
