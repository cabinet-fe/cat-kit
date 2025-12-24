import DefaultTheme from 'vitepress/theme'
import CopyOrDownloadAsMarkdownButtons from 'vitepress-plugin-llms/vitepress-components/CopyOrDownloadAsMarkdownButtons.vue'
import DemoContainer from './components/DemoContainer.vue'
import CatKitLayout from './CatKitLayout.vue'
import './styles/custom.css'

export default {
  extends: DefaultTheme,
  Layout: CatKitLayout,
  enhanceApp({ app }) {
    app.component('DemoContainer', DemoContainer)
    app.component(
      'CopyOrDownloadAsMarkdownButtons',
      CopyOrDownloadAsMarkdownButtons
    )
  }
}
