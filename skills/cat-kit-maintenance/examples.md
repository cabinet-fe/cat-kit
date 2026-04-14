# @cat-kit/maintenance 示例

```ts
import { Monorepo } from '@cat-kit/maintenance'

const repo = new Monorepo('/path/to/your/monorepo')
const v = repo.validate()
if (!v.valid) {
  console.error(v.circularChains, v.inconsistentDeps)
}
```

```ts
import { buildLib } from '@cat-kit/maintenance'

await buildLib({ dir: '/abs/path/to/pkg', platform: 'node' })
```

详见 [`generated/index.d.ts`](generated/index.d.ts)。
