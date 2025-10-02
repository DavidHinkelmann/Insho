import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import tailwindcss from "@tailwindcss/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import fs from "fs";

// Detect if we're running inside a Docker container (common convention: /.dockerenv exists)
const inDocker = fs.existsSync("/.dockerenv");
// Allow override via env (useful for CI/dev): VITE_PROXY_TARGET
const proxyTarget = process.env.VITE_PROXY_TARGET || (inDocker ? "http://backend:8000" : "http://localhost:8000");

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), basicSsl()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,  // listen on all addresses so phones on LAN can reach it
    port: 3000,
    proxy: {
      // Proxy API calls to the backend to avoid mixed content and CORS during dev
      "/api": {
        target: proxyTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
  },
});
