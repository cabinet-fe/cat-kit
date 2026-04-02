# http — 插件系统

插件按数组顺序执行：beforeRequest → 请求 → afterRespond。

## 插件接口

```typescript
interface ClientPlugin {
  beforeRequest?(url, config): Promise<{ url?, config? } | void> | { url?, config? } | void
  afterRespond?(response, url, config): Promise<HTTPResponse | void> | HTTPResponse | void
  onError?(error, { url, config }): Promise<void> | void
}
```

## 内置插件

### TokenPlugin

```typescript
import { TokenPlugin } from '@cat-kit/http'

TokenPlugin({
  getter: () => localStorage.getItem('token'),
  headerName?: string,     // 默认 'Authorization'
  authType?: 'Bearer' | 'Basic' | 'Custom',
  formatter?: (token) => string  // authType='Custom' 时
})
```

### MethodOverridePlugin

```typescript
import { MethodOverridePlugin } from '@cat-kit/http'

MethodOverridePlugin({
  methods?: RequestMethod[],       // 默认 ['DELETE','PUT','PATCH']
  overrideMethod?: RequestMethod,  // 默认 'POST'
  headerName?: string              // 默认 'X-HTTP-Method-Override'
})
```

## 自定义插件

```typescript
function MyPlugin(): ClientPlugin {
  return {
    beforeRequest(url, config) {
      // 返回新对象修改请求，避免直接修改 config
      return { config: { ...config, query: { ...config.query, _t: Date.now() } } }
    },
    afterRespond(response) {
      return response
    }
  }
}
```
