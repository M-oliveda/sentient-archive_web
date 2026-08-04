import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        tanstackRouter({
            target: "react",
            autoCodeSplitting: true,
        }),
        react(),
        tailwindcss(),
        process.env.ANALYZE === "true"
            ? visualizer({
                  filename: "dist/bundle-stats.html",
                  open: false,
                  gzipSize: true,
                  brotliSize: true,
              })
            : undefined,
    ].filter(Boolean),
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        host: "0.0.0.0", // Important for Docker
        port: 5173,
        strictPort: true,
        watch: {
            usePolling: true, // Important for Docker on some systems
        },
        proxy: {
            "/emulator-api": {
                target: "http://firebase-emulators:5001",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/emulator-api/, ""),
            },
        },
    },
    preview: {
        host: "0.0.0.0",
        port: 8080,
        strictPort: true,
    },
    build: {
        outDir: "dist",
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ["react", "react-dom"],
                    router: ["@tanstack/react-router"],
                    firebase: ["firebase/app", "firebase/auth", "firebase/firestore"],
                    charts: ["recharts"],
                },
            },
        },
    },
});
