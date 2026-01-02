import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('three')) {
                            return 'three';
                        }
                        if (id.includes('gsap')) {
                            return 'gsap';
                        }
                        return 'vendor';
                    }
                }
            }
        }
    },
    server: {
        host: true
    }
});
