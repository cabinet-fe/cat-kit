# 设计模式

提供常用设计模式的实现，当前包含观察者模式。

## Observable - 观察者模式

`Observable` 类提供了响应式的状态管理，可以观察对象属性的变化。

### 基本概念

观察者模式允许你订阅对象的状态变化，当状态改变时自动执行回调函数。这在 Vue、React 等现代框架中被广泛使用。

### 创建可观察对象

```typescript
import { Observable } from '@cat-kit/core'

interface State {
  count: number
  name: string
  flag: boolean
}

const observable = new Observable<State, keyof State>({
  count: 0,
  name: 'Alice',
  flag: false
})
```

### 观察属性变化

```typescript
import { Observable } from '@cat-kit/core'

const observable = new Observable({ count: 0 })

// 观察单个属性
observable.observe(['count'], ([count]) => {
  console.log('count 变化了:', count)
})

// 修改属性会触发回调
observable.state.count = 5
// 输出: count 变化了: 5
```

### 观察多个属性

```typescript
import { Observable } from '@cat-kit/core'

interface User {
  name: string
  age: number
}

const observable = new Observable<User, keyof User>({
  name: 'Alice',
  age: 25
})

// 同时观察多个属性
observable.observe(['name', 'age'], ([name, age]) => {
  console.log(`用户信息: ${name}, ${age}岁`)
})

observable.state.name = 'Bob' // 触发
observable.state.age = 30 // 触发
```

### 观察选项

#### immediate - 立即执行

```typescript
// 创建时立即执行一次回调
observable.observe(
  ['count'],
  ([count]) => {
    console.log('当前 count:', count)
  },
  { immediate: true }
)
// 立即输出: 当前 count: 0
```

#### sync - 同步执行

```typescript
// 同步执行（默认是异步微任务）
observable.observe(
  ['count'],
  ([count]) => {
    console.log('count:', count)
  },
  { sync: true }
)

observable.state.count = 10
// 立即同步输出: count: 10
```

#### once - 只执行一次

```typescript
// 只触发一次后自动取消观察
observable.observe(
  ['count'],
  ([count]) => {
    console.log('只执行一次:', count)
  },
  { once: true }
)

observable.state.count = 1 // 触发
observable.state.count = 2 // 不触发
```

### 取消观察

```typescript
// observe 返回取消函数
const unobserve = observable.observe(['count'], ([count]) => {
  console.log('count:', count)
})

observable.state.count = 1 // 触发
unobserve() // 取消观察
observable.state.count = 2 // 不触发
```

### 手动触发

```typescript
// 手动触发属性的观察者
observable.trigger('count')
```

### 批量更新

```typescript
// 使用 setState 批量更新
observable.setState({
  count: 10,
  name: 'Charlie'
})
```

### 获取状态

```typescript
// 获取当前状态
const state = observable.getState()
console.log(state) // { count: 0, name: 'Alice', flag: false }
```

### 销毁观察者

```typescript
// 销毁所有观察者
observable.destroyAll()
```

## 实际应用

### 表单状态管理

```typescript
import { Observable } from '@cat-kit/core'

interface FormState {
  username: string
  email: string
  password: string
}

class FormManager {
  private observable: Observable<FormState, keyof FormState>

  constructor() {
    this.observable = new Observable<FormState, keyof FormState>({
      username: '',
      email: '',
      password: ''
    })

    this.setupValidation()
  }

  private setupValidation() {
    // 观察用户名变化
    this.observable.observe(['username'], ([username]) => {
      if (username.length < 3) {
        this.showError('username', '用户名至少3个字符')
      } else {
        this.clearError('username')
      }
    })

    // 观察邮箱变化
    this.observable.observe(['email'], ([email]) => {
      if (!email.includes('@')) {
        this.showError('email', '邮箱格式不正确')
      } else {
        this.clearError('email')
      }
    })
  }

  updateField(field: keyof FormState, value: string) {
    this.observable.state[field] = value
  }

  getFormData(): FormState {
    return this.observable.getState()
  }

  private showError(field: string, message: string) {
    console.error(`${field}: ${message}`)
  }

  private clearError(field: string) {
    console.log(`${field} 验证通过`)
  }
}
```

### 购物车管理

```typescript
import { Observable } from '@cat-kit/core'

interface CartState {
  items: Array<{ id: number; name: string; price: number; quantity: number }>
  total: number
  discount: number
}

class ShoppingCart {
  private observable: Observable<CartState, keyof CartState>

  constructor() {
    this.observable = new Observable<CartState, keyof CartState>({
      items: [],
      total: 0,
      discount: 0
    })

    this.setupAutoCalculation()
  }

  private setupAutoCalculation() {
    // 当商品或折扣变化时，自动重新计算总价
    this.observable.observe(['items', 'discount'], ([items, discount]) => {
      const subtotal = items.reduce((sum, item) => {
        return sum + item.price * item.quantity
      }, 0)

      const total = subtotal * (1 - discount)
      this.observable.state.total = total
    })

    // 观察总价变化，更新 UI
    this.observable.observe(['total'], ([total]) => {
      this.updateTotalDisplay(total)
    })
  }

  addItem(item: { id: number; name: string; price: number; quantity: number }) {
    const items = [...this.observable.state.items]
    const existing = items.find(i => i.id === item.id)

    if (existing) {
      existing.quantity += item.quantity
    } else {
      items.push(item)
    }

    this.observable.state.items = items
  }

  setDiscount(discount: number) {
    this.observable.state.discount = discount
  }

  private updateTotalDisplay(total: number) {
    console.log(`总价: ¥${total.toFixed(2)}`)
  }
}
```

### 应用状态管理

```typescript
import { Observable } from '@cat-kit/core'

interface AppState {
  user: { id: number; name: string } | null
  theme: 'light' | 'dark'
  language: 'zh-CN' | 'en-US'
  loading: boolean
}

class AppStore {
  private observable: Observable<AppState, keyof AppState>

  constructor() {
    this.observable = new Observable<AppState, keyof AppState>({
      user: null,
      theme: 'light',
      language: 'zh-CN',
      loading: false
    })

    this.setupWatchers()
  }

  private setupWatchers() {
    // 用户登录/登出时的处理
    this.observable.observe(['user'], ([user]) => {
      if (user) {
        console.log('用户已登录:', user.name)
        this.loadUserPreferences()
      } else {
        console.log('用户已登出')
        this.clearUserData()
      }
    })

    // 主题变化时更新 DOM
    this.observable.observe(['theme'], ([theme]) => {
      document.documentElement.setAttribute('data-theme', theme)
      localStorage.setItem('theme', theme)
    })

    // 语言变化时重新加载文案
    this.observable.observe(['language'], ([language]) => {
      this.loadI18n(language)
    })
  }

  login(user: { id: number; name: string }) {
    this.observable.state.user = user
  }

  logout() {
    this.observable.state.user = null
  }

  setTheme(theme: 'light' | 'dark') {
    this.observable.state.theme = theme
  }

  setLanguage(language: 'zh-CN' | 'en-US') {
    this.observable.state.language = language
  }

  showLoading() {
    this.observable.state.loading = true
  }

  hideLoading() {
    this.observable.state.loading = false
  }

  private loadUserPreferences() {
    // 加载用户偏好设置...
  }

  private clearUserData() {
    // 清除用户数据...
  }

  private loadI18n(language: string) {
    // 加载国际化文案...
  }
}
```

### Vue 3 集成示例

```typescript
import { Observable } from '@cat-kit/core'
import { ref, onUnmounted } from 'vue'

function useObservable<T extends object>(initialState: T) {
  const observable = new Observable(initialState)
  const state = ref(observable.getState())

  // 观察所有属性变化
  const keys = Object.keys(initialState) as Array<keyof T>
  const unobserve = observable.observe(keys, () => {
    state.value = { ...observable.getState() }
  })

  // 组件卸载时清理
  onUnmounted(() => {
    unobserve()
    observable.destroyAll()
  })

  return {
    state: observable.state,
    reactiveState: state
  }
}

// 使用
const { state, reactiveState } = useObservable({
  count: 0,
  name: 'test'
})
```

## 高级特性

### 条件观察

```typescript
let enabled = true

const unobserve = observable.observe(['count'], ([count]) => {
  if (!enabled) return
  console.log('count:', count)
})

// 暂时禁用
enabled = false
observable.state.count = 1 // 不输出

// 重新启用
enabled = true
observable.state.count = 2 // 输出
```

### 链式观察

```typescript
// 一个属性的变化触发另一个属性
observable.observe(['count'], ([count]) => {
  if (count > 10) {
    observable.state.flag = true
  }
})

observable.observe(['flag'], ([flag]) => {
  if (flag) {
    console.log('Flag is now true!')
  }
})
```

## API 参考

### Observable 构造函数

```typescript
new Observable<S extends object, K extends keyof S>(data: S)
```

### 方法

- `observe(props, callback, options?)` - 观察属性变化

  - `props`: 要观察的属性数组
  - `callback`: 回调函数
  - `options`: 观察选项
    - `immediate`: 立即执行
    - `sync`: 同步执行
    - `once`: 只执行一次
  - 返回: 取消观察的函数

- `getState()` - 获取当前状态
- `setState(state)` - 批量更新状态
- `trigger(prop)` - 手动触发属性的观察者
- `destroyAll()` - 销毁所有观察者

### 类型定义

```typescript
interface ObserveOptions {
  immediate?: boolean
  once?: boolean
  sync?: boolean
}
```

## 性能考虑

1. **避免过度观察**：只观察真正需要响应的属性
2. **及时取消观察**：组件销毁时记得取消观察
3. **批量更新**：使用 `setState` 批量更新多个属性
4. **同步执行谨慎使用**：同步执行可能阻塞主线程
5. **避免循环依赖**：注意观察者之间的依赖关系

## 最佳实践

1. **明确状态结构**：使用 TypeScript 定义清晰的状态接口
2. **单一职责**：每个观察者只处理一个关注点
3. **错误处理**：在回调中添加 try-catch
4. **生命周期管理**：在适当时机创建和销毁观察者
5. **测试**：为观察者编写单元测试
