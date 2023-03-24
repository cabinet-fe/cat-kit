/*
 * @Author: whj
 * @Date: 2022-10-28 15:36:56
 * @LastEditors: whj
 * @LastEditTime: 2023-01-29 11:18:35
 * @FilePath: /cat-kit/docs/.vitepress/theme/index.ts
 *
 */
import { Theme } from 'vitepress'
import defaultTheme from 'vitepress/dist/client/theme-default/index'
import components from '../components'
import 'prismjs/themes/prism-tomorrow.min.css'
import './theme.css'
import './component.css'

const theme: Theme = {
  ...(defaultTheme as Theme),
  enhanceApp({ app }) {
    components.forEach(component => {
      app.component(component.name, component)
    })
  }
}

export default theme


