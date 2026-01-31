import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
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
                },
            },
        },
    },
});
