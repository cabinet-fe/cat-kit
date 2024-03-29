/*
 * @Author: whj
 * @Date: 2022-10-28 15:36:56
 * @LastEditors: whj
 * @LastEditTime: 2023-01-29 11:18:35
 * @FilePath: /cat-kit/docs/.vitepress/theme/index.ts
 *
 */
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import components from '../components'
import './theme.css'
import './component.css'

const theme: Theme = {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    components.forEach(component => {
      app.component(component.name, component)
    })
    app.config.globalProperties.c = console
  }
}

export default theme
