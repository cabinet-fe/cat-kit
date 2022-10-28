import { Theme } from 'vitepress'
import defaultTheme from 'vitepress/dist/client/theme-default'

const theme: Theme = {
  ...(defaultTheme as Theme),
  enhanceApp(ctx) {}
}

export default theme
