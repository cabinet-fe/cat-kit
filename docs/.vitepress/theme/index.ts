import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import CopyOrDownloadAsMarkdownButtons from 'vitepress-plugin-llms/vitepress-components/CopyOrDownloadAsMarkdownButtons.vue'
import DemoContainer from './components/DemoContainer.vue'
import Layout from './Layout.vue'
import './styles/custom.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('DemoContainer', DemoContainer)
    app.component(
      'CopyOrDownloadAsMarkdownButtons',
      CopyOrDownloadAsMarkdownButtons
    )
  }
} satisfies Theme
