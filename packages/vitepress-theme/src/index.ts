import DefaultTheme from 'vitepress/theme'

import CatKitLayout from './components/CatKitLayout.vue'
import DemoContainer from './components/DemoContainer.vue'
import Mermaid from './components/Mermaid.vue'

import './styles/custom.css'

export default {
  extends: DefaultTheme,
  Layout: CatKitLayout,
  enhanceApp({ app }) {
    app.component('DemoContainer', DemoContainer)
    app.component('Mermaid', Mermaid)
  }
}

// 导出各模块供按需使用
export { default as CatKitLayout } from './components/CatKitLayout.vue'
export * from './composables'
export * from './markdown/demo-container'
export * from './markdown/mermaid'
export * from './plugins/import-examples'
