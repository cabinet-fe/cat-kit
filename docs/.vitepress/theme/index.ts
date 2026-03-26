import theme from '@cat-kit/vitepress-theme'
import CopyOrDownloadAsMarkdownButtons from 'vitepress-plugin-llms/vitepress-components/CopyOrDownloadAsMarkdownButtons.vue'

import '@cat-kit/vitepress-theme/style.css'

export default {
  ...theme,
  enhanceApp({ app }) {
    theme.enhanceApp({ app })
    app.component('CopyOrDownloadAsMarkdownButtons', CopyOrDownloadAsMarkdownButtons)
  }
}
