// filepath: d:\my_recipes-main\ImageShare\image-share\vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    global: "window", // Define global as window
  },
});
