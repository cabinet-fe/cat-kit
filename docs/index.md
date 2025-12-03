---
layout: home

hero:
  name: 'CatKit'
  text: '喵喵工具箱'
  tagline: 面向浏览器和 Node.js 的 TypeScript 工具库集合。涵盖数据处理、存储、HTTP、文件系统、Excel 等常用功能，提供统一的 API 设计和完整的类型支持。
  image:
    src: /banner.png
    alt: CatKit
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started

    - theme: alt
      text: GitHub
      link: https://github.com/cabinet-fe/cat-kit

features:
  - icon: 🎯
    title: 全环境支持
    details: 同时支持浏览器和 Node.js/Bun 环境，一套 API 适配前后端开发场景。

  - icon: 📦
    title: 模块化设计
    details: 5 个独立包（Core、FE、BE、HTTP、Excel），按需引入，灵活组合。

  - icon: 💪
    title: 类型安全
    details: 完整的 TypeScript 类型定义，提供智能提示和编译时类型检查。

  - icon: 🌳
    title: Tree-Shaking 友好
    details: 只打包你使用的功能，保持应用体积最小，充分利用构建工具优化。

  - icon: ⚡
    title: 零依赖核心
    details: Core 包零外部依赖，减少安全风险和包体积，提升加载速度。

  - icon: 🗄️
    title: 存储解决方案
    details: 统一封装 LocalStorage、SessionStorage、Cookie、IndexedDB，简化存储操作。

  - icon: 📡
    title: HTTP 客户端
    details: 跨平台 HTTP 请求库，支持插件系统和请求拦截，类型安全的 API 设计。

  - icon: 📊
    title: Excel 处理
    details: 流式读写 Excel 文件，支持大文件处理和样式保留，不可变数据结构设计。

  - icon: 📖
    title: 完善文档
    details: 提供完整的中文文档和交互式示例，降低学习成本，快速上手。
---

<style>
/* 首页动画效果 */

/* 英雄区域入场动画 */
.VPHero .name {
  animation: fadeInUp 0.8s ease-out both;
}

.VPHero .text {
  animation: fadeInUp 0.8s ease-out 0.1s both;
}

.VPHero .tagline {
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.VPHero .actions {
  animation: fadeInUp 0.8s ease-out 0.3s both;
}

/* 吉祥物图片动画 - 只在容器上添加动画，避免覆盖子元素的 transform 定位 */
.VPHero .image-container {
  animation: imageContainerIn 1s ease-out 0.4s both;
}

/* 使用 filter 实现光晕脉动效果，不影响 transform */
.VPHero .image-container .image-bg {
  animation: bgPulse 4s ease-in-out infinite;
}

/* 图片容器整体浮动效果 */
.VPHero .image-container .image-src {
  animation: gentleFloat 3s ease-in-out infinite;
}

.VPHero .image-container:hover .image-src {
  animation-play-state: paused;
}

/* 特性卡片交错入场 */
.VPFeatures .VPFeature {
  animation: fadeInUp 0.6s ease-out both;
}

.VPFeatures .VPFeature:nth-child(1) { animation-delay: 0.5s; }
.VPFeatures .VPFeature:nth-child(2) { animation-delay: 0.6s; }
.VPFeatures .VPFeature:nth-child(3) { animation-delay: 0.7s; }
.VPFeatures .VPFeature:nth-child(4) { animation-delay: 0.8s; }
.VPFeatures .VPFeature:nth-child(5) { animation-delay: 0.9s; }
.VPFeatures .VPFeature:nth-child(6) { animation-delay: 1.0s; }
.VPFeatures .VPFeature:nth-child(7) { animation-delay: 1.1s; }
.VPFeatures .VPFeature:nth-child(8) { animation-delay: 1.2s; }
.VPFeatures .VPFeature:nth-child(9) { animation-delay: 1.3s; }

/* 特性卡片图标动画 */
.VPFeature .icon {
  transition: transform 0.3s ease;
}

.VPFeature:hover .icon {
  transform: scale(1.2) rotate(-5deg);
}

/* 动画关键帧 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 图片容器入场动画 - 只用 opacity，不用 transform */
@keyframes imageContainerIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 浮动动画 - 使用 margin 而非 transform，避免覆盖定位 */
@keyframes gentleFloat {
  0%, 100% {
    margin-top: 4px;
  }
  50% {
    margin-top: -4px;
  }
}

/* 背景光晕脉动 - 只用 opacity */
@keyframes bgPulse {
  0%, 100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
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
