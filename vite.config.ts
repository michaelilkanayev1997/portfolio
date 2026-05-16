import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "build",
    target: "es2020",
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (id.includes("react-router") || id.includes("@remix-run"))
            return "router";

          if (id.includes("/react/") || id.includes("/react-dom/"))
            return "react";

          if (id.includes("/gsap/")) return "gsap";
          if (id.includes("@tsparticles")) return "particles";
          if (id.includes("/swiper/")) return "swiper";
          if (id.includes("@mui") || id.includes("@emotion")) return "mui";
          if (id.includes("sweetalert2")) return "swal";
          if (id.includes("@emailjs")) return "emailjs";
          if (id.includes("react-toastify")) return "toastify";
          if (id.includes("react-icons")) return "icons";
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
});
