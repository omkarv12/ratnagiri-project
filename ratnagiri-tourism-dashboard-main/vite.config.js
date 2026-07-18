import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dsv from "@rollup/plugin-dsv";

export default defineConfig({
  plugins: [react(), tailwindcss(), dsv()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },
});