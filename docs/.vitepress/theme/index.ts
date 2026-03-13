import CopyOrDownloadAsMarkdownButtons from 'vitepress-plugin-llms/vitepress-components/CopyOrDownloadAsMarkdownButtons.vue'
import DefaultTheme from 'vitepress/theme'

import CatKitLayout from './CatKitLayout.vue'
import DemoContainer from './components/DemoContainer.vue'
import Mermaid from './components/Mermaid.vue'

import './styles/custom.css'

export default {
  extends: DefaultTheme,
  Layout: CatKitLayout,
  enhanceApp({ app }) {
    app.component('DemoContainer', DemoContainer)
    app.component('Mermaid', Mermaid)
    app.component('CopyOrDownloadAsMarkdownButtons', CopyOrDownloadAsMarkdownButtons)
  }
}
