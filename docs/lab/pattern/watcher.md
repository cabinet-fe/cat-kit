---
title: 观察者模式
---

# 观察者模式

观察者模式是前端工程中最常见的代码设计模式之一, 目前几乎所有的前端框架的核心就是观察者模式, 也就是所谓的状态驱动.

在 18 年前后, 前端的主流库还是 JQuery, JQuery 库帮助开发者封装 dom 操作, 比如选择器, 设置样式, 增加删除 dom 节点等等.

而最近几年前端框架爆发式增长, 他们用无需手动操作 dom 的方式碾压了 jquery, 旧的时代从此没落...

对比以下的代码:

```ts
// 一段TODOList的jquery代码

const list = []

const genItem = item => {
  return $(`<li>${item.index} - ${Math.n}</li>`)
}

~(function getData() {
  setTimeout(() => {
    list = Array.from({ length: 20 }).map((_, index) => ({
      index,
      n: Math.random()
    }))

    $('.container').append(list.map(genItem))
  }, 300)
})()

$('.btn').click(function () {
  $('.container').append(genItem({ index: list.length, n: Math.random() }))
})

// 同样功能的vue
const list = shallowRef([])

~(function getData() {
  setTimeout(() => {
    list.value = Array.from({ length: 20 }).map(() => ({ n: Math.random() }))
  }, 300)
})()

const handleClick = () => {
  list.value = [...list.value, { n: Math.random() }]
}
```

显而易见的是, vue 的代码会少很多, 主要是帮我们省去了 dom 操作, 并且直接改值, 不需要封装方法就能触发 dom 的更新, 这就是观察者模式的强大之处.

## 何时使用

一句话概括就是: 每当一个事物发生改变就做一些动作时都能使用观察者模式.

当有人犯罪时, 警察就逮捕.

当感染病毒时, 免疫系统就开始消灭病毒.

当一个人无聊时, 就想找乐子.

<span style="text-decoration: line-through">当一个人不吃法时, 就会饿...</span> :joy:

上面的三个例子都可以用程序来描述.

```ts
// GTA(侠盗列车手)中的经典场景是, 只要你伤害了路人, 你就会被通缉, 通缉星级越高, 警察出动的人数就越多, 装备就越离谱.
// 下面我们用普通思维和观察者模式来描述一下.

// 列出全部对象

/** 主角 */
class Leader {
  killed = 0

  /** 射击 */
  shot(person: SomeOne, part: 'header' | 'body' | 'limb') {
    if (person.hp <= 0) return

    // 爆头
    if (part === 'header') {
      person.hp -= 100
    }
    // 打中身体
    else if (part === 'body') {
      person.hp -= 50
    }
    // 打中四肢
    else if (part === 'limb') {
      person.hp -= 15
    }

    if (person.hp <= 0) {
      this.killed += 1
    }
  }
}

class SomeOne {
  hp = 100
}

class Police {
  target = null

  constructor(target: any) {
    this.target = target

    this.arrest()
  }

  // 抓捕
  arrest() {}
}

const createPolices = (target, num: number) => {
  return Array.form({ length: num }).map(() => new Police())
}

const you = new Leader()

// 路人A
const someOneA = new SomeOne()
// 路人B
const someOneB = new SomeOne()

// 线性的逻辑
you.shot(someOneA)
if (you.killed > 0) {
  if (you.killed > 0 && you.killed <= 1) {
    createPolice(you, 2)
  } else if (you.killed > 1 && you.killed <= 5) {
    createPolice(you, 10)
  } else if (you.killed > 5) {
    createPolice(you, 30)
  }
}

you.shot(someOneB)
if (you.killed > 0) {
  if (you.killed > 0 && you.killed <= 1) {
    createPolice(you, 2)
  } else if (you.killed > 1 && you.killed <= 5) {
    createPolice(you, 10)
  } else if (you.killed > 5) {
    createPolice(you, 30)
  }
}

// 观察者的逻辑
watch(you, you => {
  if (you.killed <= 0) return

  if (you.killed > 0 && you.killed <= 1) {
    createPolice(you, 2)
  } else if (you.killed > 1 && you.killed <= 5) {
    createPolice(you, 10)
  } else if (you.killed > 5) {
    createPolice(you, 30)
  }
})

you.shot(someOneA)
you.shot(someOneB)
// ...
```

## 实现要点

观察者模式的要点就是可被观测, 联想现实世界中的案例: 判断学生的学习成绩好坏, 就需要通过考试, 得出得分, 通过得分来评级.


```ts

const createState = <T extends  Record<string, ayn>>(state: T, cb: (state: T) => void) => {
  const setState = (_state: Record<string, ayn>) => {
    Object.assign(state, _state)

    cb(state)
  }

  return [
    state, setState
  ]
}

const [state, setState] = createState({
  len: 0
}, (state) => {
  if (state.len < 4.3) {
    console.log('小型车')
  }
  else if (state.len >= 4.3 && state.len < 4.8) {
    console.log('A级车')
  }

  else if (state.len >= 4.8 && state.len < 5) {
    console.log('B级车')
  }
  else if (state.len >= 5 && state.len < 5.1) {
    console.log('C级车')
  }
  else if (state.len >= 5.1) {
    console.log('D级车')
  }
})

setState({ len: 4.6 })
setState({ len: 5.2 })
setState({ len: 4 })
```