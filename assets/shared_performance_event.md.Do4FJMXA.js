import{_ as s,c as a,o as i,a6 as n}from"./chunks/framework.CRTY9GVS.js";const e=JSON.parse('{"title":"事件性能","description":"","frontmatter":{"title":"事件性能"},"headers":[],"relativePath":"shared/performance/event.md","filePath":"shared/performance/event.md","lastUpdated":1744265790000}'),l={name:"shared/performance/event.md"},p=[n('<h1 id="事件性能" tabindex="-1">事件性能 <a class="header-anchor" href="#事件性能" aria-label="Permalink to &quot;事件性能&quot;">​</a></h1><p>浏览器中存在大量的高频触发的事件, 如果我们在监听此事件时执行某些操作通常会进行密集的计算. 因此程序性能极有可能会变得非常低效. 那么有什么颁发能够优化此类性能呢?</p><h2 id="减少逻辑执行的密集度" tabindex="-1">减少逻辑执行的密集度 <a class="header-anchor" href="#减少逻辑执行的密集度" aria-label="Permalink to &quot;减少逻辑执行的密集度&quot;">​</a></h2><p>这是最广泛的性能优化手段之一, 通过防抖和节流等手段减少真实操作的频率.(对滚动和鼠标移动以及屏幕滚动来说很有用)</p><div class="language-ts vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 节流 滚动时200毫秒才会执行一次</span></span>\n<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">dom.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">addEventListener</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;scroll&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">throttle</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>\n<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // do sth...</span></span>\n<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">200</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">))</span></span>\n<span class="line"></span>\n<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 防抖 停止滚动200毫秒后才会执行一次</span></span>\n<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">dom.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">addEventListener</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;scroll&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">debounce</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>\n<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // do sth...</span></span>\n<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">200</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">))</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br></div></div><p>节流和防抖都属于闭包结构, 属于比较基础的内容, 可以自行了解.</p><h2 id="减少性能损耗的操作-比如触发重排的操作" tabindex="-1">减少性能损耗的操作, 比如触发重排的操作 <a class="header-anchor" href="#减少性能损耗的操作-比如触发重排的操作" aria-label="Permalink to &quot;减少性能损耗的操作, 比如触发重排的操作&quot;">​</a></h2><p>遇到必须需要触发重排的操作, 可以事先获取并缓存. 在动画时可能会经常遇到此类操作, 尤其需要注意.</p><h2 id="告诉监听器-你的操作不会阻止默认操作" tabindex="-1">告诉监听器, 你的操作不会阻止默认操作 <a class="header-anchor" href="#告诉监听器-你的操作不会阻止默认操作" aria-label="Permalink to &quot;告诉监听器, 你的操作不会阻止默认操作&quot;">​</a></h2><p>在事件监听处理器第三个选项中传入passive: true.</p><p>这样浏览器就不会去判断有没有可能会有阻止默认操作的可能.</p>',11)];const t=s(l,[["render",function(s,n,e,l,t,h){return i(),a("div",null,p)}]]);export{e as __pageData,t as default};
