---
layout: home
title: CatKit
hero:
  name: CatKit
  text: 基于JS的全环境开发工具包。
  tagline: 现代API，高性能，类型安全， 前后端一致。

  image:
    src: /images/logo.png
    alt: cat-kit

  actions:
    - text: 浏览工具
      link: /utils/fe/
      theme: brand

    - text: 实验室
      link: /lab/data-structure/
      theme: alt

features:
  - title: 统一
    icon: 🧰
    details: 为团队而生, 统一管理代码。
  - title: 易用
    icon: 😁
    details: 新人融入无所适从? 上手慢? 这里提供了工具库的完备中文文档!
  - title: 高效
    icon: 🚀
    details: 除了完全利用构建工具的tree-shaking机制，还使用更少的代码实现相同的功能。
  - title: 分享
    icon: 🤝
    details: 在实验室中发现别人的分享, 你也可以畅所欲言, 分享你的见解。
  - title: 广泛
    icon: 🔭
    details: 众所周知, 不会后端的前端不是好设计师, 所以我们涉及的内容很广泛，而不仅仅是前端。
  - title: 积累
    icon: 📖
    details: 这是一个积累的过程, 我们的内容会不断的完善，沉淀, 以此提升我们应对问题的能力和效率。
---

<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://www.github.com/cabinet-fe.png',
    name: '元智慧前端小分队',
    title: '开发成员',
    links: [
      { icon: 'github', link: 'https://github.com/cabinet-fe' }
    ]
  }
]
</script>

<br>

<hr style="border-color: #eee;" />

<br>

<VPTeamMembers class="members" size="small" :members="members" />
