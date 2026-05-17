import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root,
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true
  },
  server: {
    port: 5173
  }
});
