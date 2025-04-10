import{_ as s,c as a,o as i,a6 as n}from"./chunks/framework.CRTY9GVS.js";const l=JSON.parse('{"title":"计算机基础术语","description":"","frontmatter":{},"headers":[],"relativePath":"shared/term/basic.md","filePath":"shared/term/basic.md","lastUpdated":1744265790000}'),e={name:"shared/term/basic.md"},p=[n('<h1 id="计算机基础术语" tabindex="-1">计算机基础术语 <a class="header-anchor" href="#计算机基础术语" aria-label="Permalink to &quot;计算机基础术语&quot;">​</a></h1><h2 id="cpu" tabindex="-1">CPU <a class="header-anchor" href="#cpu" aria-label="Permalink to &quot;CPU&quot;">​</a></h2><p>中央处理器</p><h2 id="内存" tabindex="-1">内存 <a class="header-anchor" href="#内存" aria-label="Permalink to &quot;内存&quot;">​</a></h2><p>内存是程序执行的空间所在</p><h2 id="硬盘" tabindex="-1">硬盘 <a class="header-anchor" href="#硬盘" aria-label="Permalink to &quot;硬盘&quot;">​</a></h2><p>硬盘是数据进行持久化的地方. 即使在断点的情况下也能够保存数据.</p><p>分为机械硬盘和固态硬盘.</p><h2 id="终端-或-shell" tabindex="-1">终端 或 shell <a class="header-anchor" href="#终端-或-shell" aria-label="Permalink to &quot;终端 或 shell&quot;">​</a></h2><p>终端是一个程序, 它封装了操作系统的接口, 使你能够使用它封装的命令和操作系统交互.</p><h2 id="i-o-输入输出" tabindex="-1">I/O 输入输出 <a class="header-anchor" href="#i-o-输入输出" aria-label="Permalink to &quot;I/O 输入输出&quot;">​</a></h2><p>拿工厂来距离, 进入工厂的的是原材料, 出来工厂的是制成品. 原材料进入工厂就是输入, 出来工厂就是输出. 负责输入的叫输入设备, 负责输出的叫输出设备.</p><h2 id="二进制" tabindex="-1">二进制 <a class="header-anchor" href="#二进制" aria-label="Permalink to &quot;二进制&quot;">​</a></h2><p>二进制每位数最高能够达到 1, 逢二进一.</p><p>而十进制则是逢十进一, 每位数最高能达到 9.</p><h3 id="机器数" tabindex="-1">机器数 <a class="header-anchor" href="#机器数" aria-label="Permalink to &quot;机器数&quot;">​</a></h3><p>存在计算机中的数据的二进制数字(0和1), 根据对二进制数的不同解析方式(视图)可以得出不同的值.</p><p>上面的解释通俗点讲就是: [00000001, 00000001]两个连续的单字节(8位), 如果按照1个字节去转化成10进制数字就是[1, 1], 如果按照2个字节去转化成10进制数就是[257]</p><h3 id="真值" tabindex="-1">真值 <a class="header-anchor" href="#真值" aria-label="Permalink to &quot;真值&quot;">​</a></h3><p>顾名思义,真值指机器数所表示的真正值.</p><p>如果学过一门强类型语言, 会发现他们的数字类型中会有Uint和Int之分, 实际上Uint表示无符号整形, Int表示有符号整形, 这里的符号就是正(+)和负(-), 用最高位来表示.</p><p>C语言示例:</p><div class="language-c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">#include</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &lt;stdio.h&gt;</span></span>\n<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> main</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>\n<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>\n<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  char</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> a </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> -</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>\n<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  printf</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">%d\\n</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, a);</span></span>\n<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 输出-5</span></span>\n<span class="line"></span>\n<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  unsigned</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> char</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> b </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> -</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">66</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>\n<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  printf</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">%d\\n</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, b);</span></span>\n<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 期望输出-66, 实际输出190</span></span>\n<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><p>Go语言示例:</p><div class="language-go vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">go</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">package</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> main</span></span>\n<span class="line"></span>\n<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fmt</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span></span>\n<span class="line"></span>\n<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> main</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>\n<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 有符号整形范围-128 ~ 127</span></span>\n<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">\tvar</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> n1 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int8</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 128</span></span>\n<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 有符号整形范围0 ~ 255</span></span>\n<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">\tvar</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> n2 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">uint8</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> -</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span></span>\n<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\tfmt.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Println</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(n1)</span></span>\n<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\tfmt.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Println</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(n2)</span></span>\n<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>\n<span class="line"></span>\n<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 编译器报以下错误</span></span>\n<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ./go.go:6:16: cannot use 128 (untyped int constant) as int8 value in variable declaration (overflows)</span></span>\n<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ./go.go:7:17: cannot use -1 (untyped int constant) as uint8 value in variable declaration (overflows)</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br></div></div><h3 id="原码" tabindex="-1">原码 <a class="header-anchor" href="#原码" aria-label="Permalink to &quot;原码&quot;">​</a></h3><h3 id="补码" tabindex="-1">补码 <a class="header-anchor" href="#补码" aria-label="Permalink to &quot;补码&quot;">​</a></h3><h3 id="反码" tabindex="-1">反码 <a class="header-anchor" href="#反码" aria-label="Permalink to &quot;反码&quot;">​</a></h3>',28)];const h=s(e,[["render",function(s,n,l,e,h,t){return i(),a("div",null,p)}]]);export{l as __pageData,h as default};
