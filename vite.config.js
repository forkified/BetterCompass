import { defineConfig } from "vite"
import { createVuePlugin } from "vite-plugin-vue2"
import { VuetifyResolver } from "unplugin-vue-components/resolvers"
import eslintPlugin from 'vite-plugin-eslint';
import Components from "unplugin-vue-components/vite"
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    createVuePlugin(),
    eslintPlugin(),
    Components({
      resolvers: [VuetifyResolver()]
    })
  ],
  resolve: {
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"],
    alias: {
      // eslint-disable-next-line no-undef
      "@": path.resolve(__dirname, "./src")
    }
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:23994",
        changeOrigin: true
      },
      "/Services": {
        target: "http://localhost:23994",
        changeOrigin: true
      },
      "/services": {
        target: "http://localhost:23994",
        changeOrigin: true
      },
      "/Asset*": {
        target: "http://localhost:23994",
        changeOrigin: true
      }
    }
  }
})
