import type { MarkdownRenderer } from 'vitepress'

export function mermaidPlugin(md: MarkdownRenderer) {
  const defaultFence = md.renderer.rules.fence!

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    if (token && token.info.trim() === 'mermaid') {
      const code = encodeURIComponent(token.content)
      return `<Mermaid code="${code}" />`
    }
    return defaultFence(tokens, idx, options, env, self)
  }
}
