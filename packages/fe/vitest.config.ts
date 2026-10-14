import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    // 默认 node；需要 DOM 的测试文件在文件头加 // @vitest-environment happy-dom
    environment: 'node',
    // 编译缓存：模块编译结果落盘，跨测试运行复用
    experimental: { fsModuleCache: true }
  }
})
