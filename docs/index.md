---
layout: home

hero:
  name: 'CatKit'
  text: '喵喵工具箱'
  tagline: 基于 TS 的全环境开发工具包。现代 API，高性能，类型安全，前后端一致。
  image:
    src: /logo.svg
    alt: CatKit
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 浏览工具
      link: /core/data/array
    - theme: alt
      text: GitHub
      link: https://github.com/cabinet-fe/cat-kit

features:
  - icon: 🧰
    title: 统一
    details: 为团队而生，前端基础设施的最前线。提供统一的 API 设计，降低学习成本。

  - icon: 😁
    title: 易用
    details: 新人融入无所适从？上手慢？这里提供了工具库的完备中文文档和丰富示例！

  - icon: 🚀
    title: 高效
    details: 完全利用构建工具的 tree-shaking 机制，使用更少的代码实现相同的功能。

  - icon: 🤝
    title: 分享
    details: 在实验室中发现别人的分享，你也可以在本仓库发起贡献，分享你的见解。

  - icon: 🔭
    title: 广泛
    details: 众所周知，不会后端的前端不是好设计师，所以我们涉及的内容很广泛。

  - icon: 📖
    title: 积累
    details: 随着内容不断完善和沉淀，最终将提升我们解决问题的效率。

  - icon: 💪
    title: 类型安全
    details: 使用 TypeScript 编写，提供完整的类型定义和智能提示。

  - icon: 🌳
    title: Tree Shakable
    details: 只打包你使用的功能，保持应用体积最小。

  - icon: ⚡
    title: 零依赖
    details: 核心模块零外部依赖，减少安全风险和包体积。
---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: linear-gradient(135deg, #5f67ee 0%, #7c84f5 50%, #989ef8 100%);
}

.VPFeature {
  transition: all 0.3s ease;
}

.VPFeature:hover {
  transform: translateY(-4px);
}
</style>
