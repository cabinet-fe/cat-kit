import { Theme } from 'vitepress'
import defaultTheme from 'vitepress/dist/client/theme-default/index'
import components from '../components'
import 'prismjs/themes/prism-tomorrow.min.css'
import './theme.css'

const theme: Theme = {
  ...(defaultTheme as Theme),
  enhanceApp({ app }) {
    components.forEach(component => {
      app.component(component.name, component)
    })
  }
}

export default theme


