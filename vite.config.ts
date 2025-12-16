// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  base: "/",            // ✅ subdomain ke root pe app

  server: {
    host: true,
    allowedHosts : ['user.infoaios.ai'],
    port: 3001,
        strictPort: true, // 👈 This line prevents Vite from switching to 8081

  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

