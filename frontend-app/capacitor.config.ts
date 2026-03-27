import type { CapacitorConfig } from "@capacitor/cli";

const serverUrl = process.env.CAPACITOR_SERVER_URL?.trim();
const isCleartext = serverUrl?.startsWith("http://") ?? false;

const config: CapacitorConfig = {
  appId: "com.repforge.app",
  appName: "RepForge",
  webDir: "capacitor-web",
  server: serverUrl
    ? {
        url: serverUrl,
        cleartext: isCleartext,
        allowNavigation: ["localhost", "10.0.2.2", "192.168.*.*"],
      }
    : {
        androidScheme: "https",
      },
};

export default config;
