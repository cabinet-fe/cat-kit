import { defineConfig, type UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const config: UserConfig = defineConfig({
  plugins: [vue()],
  server: {
    port: 3333
  }
})

export default config
