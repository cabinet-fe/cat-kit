---
layout: home

hero:
  name: 'CatKit'
  text: '喵喵工具箱'
  tagline: 为浏览器和 Node.js 打造的现代 TypeScript 工具库。简洁直观的 API、完整的类型推导、Tree-shaking 友好的架构设计，让开发更高效、代码更优雅。
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
  - icon: ✨
    title: 现代 API 设计
    details: 简洁直观的函数式 API，符合现代 JavaScript 开发习惯，学习成本低，上手即用。

  - icon: 💪
    title: 完整类型推导
    details: 从输入到输出的全链路类型安全，智能提示开箱即用，编译时捕获潜在错误。

  - icon: 🌳
    title: Tree-Shaking 友好
    details: 纯 ESM 模块，细粒度导出设计，只打包你使用的代码，保持应用体积最小。

  - icon: ⚡
    title: 轻量零依赖
    details: 核心包零外部依赖，减少供应链风险，更小的包体积，更快的安装速度。

  - icon: 🔄
    title: 全栈链路
    details: 统一的 API 设计，支持浏览器和 Node.js/Bun 环境各种工具。

  - icon: 🤖
    title: 完善文档
    details: 详尽易读的文档、完整的类型定义和 LLM 上下文支持，人机协作开发体验俱佳。
---

<style>
/* 首页动画效果 - 水墨风格 */

/* 英雄区域入场动画 - 缓慢晕染 */
.VPHero .name {
  animation: inkSpread 1.2s ease-out both;
}

.VPHero .text {
  animation: inkSpread 1.2s ease-out 0.2s both;
}

.VPHero .tagline {
  animation: inkSpread 1.2s ease-out 0.4s both;
}

.VPHero .actions {
  animation: inkSpread 1.2s ease-out 0.6s both;
}

/* 吉祥物图片动画 */
.VPHero .image-container {
  animation: inkFadeIn 1.5s ease-out 0.8s both;
}

/* 呼吸效果 - 极缓 */
.VPHero .image-container .image-bg {
  animation: mistPulse 6s ease-in-out infinite;
}

.VPHero .image-container .image-src {
  animation: gentleFloat 4s ease-in-out infinite;
}

.VPHero .image-container:hover .image-src {
  animation-play-state: paused;
}

/* 特性卡片交错入场 */
.VPFeatures .VPFeature {
  animation: inkUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  position: relative;
  overflow: hidden;
}

.VPFeatures .VPFeature:nth-child(1) { animation-delay: 0.6s; }
.VPFeatures .VPFeature:nth-child(2) { animation-delay: 0.7s; }
.VPFeatures .VPFeature:nth-child(3) { animation-delay: 0.8s; }
.VPFeatures .VPFeature:nth-child(4) { animation-delay: 0.9s; }
.VPFeatures .VPFeature:nth-child(5) { animation-delay: 1.0s; }
.VPFeatures .VPFeature:nth-child(6) { animation-delay: 1.1s; }

/* 移除流光效果，改为墨韵晕染 */
.VPFeatures .VPFeature::before {
  display: none;
}

/* 特性卡片图标动画 */
.VPFeatures .VPFeature .icon {
  transition: transform 0.4s ease;
}

.VPFeatures .VPFeature:hover .icon {
  transform: translateY(-2px);
}

/* 动画关键帧 - 水墨晕染 */
@keyframes inkSpread {
  from {
    opacity: 0;
    transform: scale(0.98) translateY(10px);
    filter: blur(4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
    filter: blur(0);
  }
}

@keyframes inkUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes inkFadeIn {
  from { opacity: 0; filter: blur(8px); }
  to { opacity: 1; filter: blur(0); }
}

@keyframes gentleFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

@keyframes mistPulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 0.9; transform: scale(1.02); }
}

/* 减少动画偏好的用户 */
@media (prefers-reduced-motion: reduce) {
  .VPHero .name,
  .VPHero .text,
  .VPHero .tagline,
  .VPHero .actions,
  .VPHero .image-container,
  .VPHero .image-container .image-bg,
  .VPHero .image-container .image-src,
  .VPFeatures .VPFeature {
    animation: none;
  }
}
</style>

