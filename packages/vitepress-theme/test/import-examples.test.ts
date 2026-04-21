import { describe, expect, it } from 'vitest'

import { importExamples } from '../src/plugins/import-examples'

function getTransform() {
  const plugin = importExamples({ examplesDir: '/repo/docs/examples' })
  const transform =
    typeof plugin.transform === 'function' ? plugin.transform : plugin.transform?.handler

  expect(transform).toBeTypeOf('function')

  return transform!
}

describe('importExamples', () => {
  it('keeps frontmatter at the top when injecting demo imports', async () => {
    const transform = getTransform()

    const source = `---
title: Demo Page
description: page with frontmatter
---

# Demo

::: demo http/client-browser-debug.vue
:::
`

    const output = await transform.call({} as any, source, '/repo/docs/content/demo.md')

    expect(output).toContain(
      `import ClientBrowserDebug from '../examples/http/client-browser-debug.vue'`
    )
    expect(output).toMatch(
      /^---\ntitle: Demo Page\ndescription: page with frontmatter\n---\n<script setup>/
    )
    expect(output).toContain(`</script>\n\n# Demo`)
  })

  it('prepends the script when no frontmatter is present', async () => {
    const transform = getTransform()

    const source = `# Demo

::: demo http/plugin-browser-debug.vue
:::
`

    const output = await transform.call({} as any, source, '/repo/docs/content/demo.md')

    expect(output).toMatch(/^<script setup>/)
    expect(output).toContain(
      `import PluginBrowserDebug from '../examples/http/plugin-browser-debug.vue'`
    )
    expect(output).toContain(`</script>\n# Demo`)
  })
})
