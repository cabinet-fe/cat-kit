import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import DemoContainer from './components/DemoContainer.vue'
import './styles/custom.css'


export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 注册 DemoContainer
    app.component('DemoContainer', DemoContainer)
  }
} satisfies Theme
