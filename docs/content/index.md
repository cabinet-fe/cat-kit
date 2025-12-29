---
layout: home

hero:
  name: 'CatKit'
  text: '喵喵工具箱'
  tagline: 一站式 TypeScript 工具库，统一浏览器与 Node.js 开发体验，告别片段化依赖管理。
  image:
    src: /logo.png
    alt: CatKit
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started

    - theme: alt
      text: GitHub
      link: https://github.com/cabinet-fe/cat-kit

features:
  - title: 现代 API 设计
    details: 简洁直观的函数式 API，符合现代 JavaScript 开发习惯，学习成本低，上手即用。

  - title: 完整类型推导
    details: 从输入到输出的全链路类型安全，智能提示开箱即用，编译时捕获潜在错误。

  - title: Tree-Shaking 友好
    details: 纯 ESM 模块，细粒度导出设计，只打包你使用的代码，保持应用体积最小。

  - title: 轻量零依赖
    details: 核心包零外部依赖，减少供应链风险，更小的包体积，更快的安装速度。

  - title: 全栈链路
    details: 统一的 API 设计，支持浏览器和 Node.js/Bun 环境各种工具。

  - title: 完善文档
    details: 详尽易读的文档、完整的类型定义和 LLM 上下文支持，人机协作开发体验俱佳。
---

<style lang="css">
/* Hero 动画 */
.VPHero .image-container { animation: fadeIn .8s ease-out both; }
.VPHero .image-src { transition: transform .3s ease; }

/* Features 错落入场动画 */
.VPFeatures .item {
  animation: featureSlide .6s cubic-bezier(0.25, 0.8, 0.25, 1) both;
}

/* 奇数项从左侧滑入 */
.VPFeatures .item:nth-child(odd) {
  --slide-from: -30px;
}

/* 偶数项从右侧滑入 */
.VPFeatures .item:nth-child(even) {
  --slide-from: 30px;
}

/* 依次延迟 */
.VPFeatures .item:nth-child(1) { animation-delay: .2s; }
.VPFeatures .item:nth-child(2) { animation-delay: .35s; }
.VPFeatures .item:nth-child(3) { animation-delay: .5s; }
.VPFeatures .item:nth-child(4) { animation-delay: .65s; }
.VPFeatures .item:nth-child(5) { animation-delay: .8s; }
.VPFeatures .item:nth-child(6) { animation-delay: .95s; }

@keyframes fadeIn { from { opacity: 0; } }

@keyframes featureSlide {
  from {
    opacity: 0;
    transform: translateX(var(--slide-from, 0));
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .VPHero .image-container,
  .VPFeatures .item { animation: none; }
}
</style>
