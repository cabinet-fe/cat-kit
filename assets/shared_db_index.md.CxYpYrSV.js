import{_ as s,c as i,o as a,a6 as t}from"./chunks/framework.CRTY9GVS.js";const n=JSON.parse('{"title":"数据库 DataBase","description":"","frontmatter":{},"headers":[],"relativePath":"shared/db/index.md","filePath":"shared/db/index.md","lastUpdated":1744265790000}'),l={name:"shared/db/index.md"},e=[t('<h1 id="数据库-database" tabindex="-1">数据库 DataBase <a class="header-anchor" href="#数据库-database" aria-label="Permalink to &quot;数据库 DataBase&quot;">​</a></h1><p>数据库不是一个高深的概念. 包括现实中的档案室, 文件夹, 书籍. 任何实体的东西, 你都可以称之为数据库.</p><p>我们真正要研究的是数据库管理系统 DBMS(DataBase Manage System), 也就是我们经常说到的 mysql, redis, mongodb, sqlite 等等.</p><h2 id="数据库分类" tabindex="-1">数据库分类 <a class="header-anchor" href="#数据库分类" aria-label="Permalink to &quot;数据库分类&quot;">​</a></h2><table tabindex="0"><thead><tr><th style="text-align:right;"></th><th style="text-align:left;">SQL</th><th style="text-align:left;">NoSql</th></tr></thead><tbody><tr><td style="text-align:right;"><strong>数据结构</strong></td><td style="text-align:left;">结构化的</td><td style="text-align:left;">非结构化(非强制)</td></tr><tr><td style="text-align:right;"><strong>数据关联性</strong></td><td style="text-align:left;">关联的</td><td style="text-align:left;">非关联的(非强制)</td></tr><tr><td style="text-align:right;"><strong>操作</strong></td><td style="text-align:left;">SQL 语句</td><td style="text-align:left;">各自的语法</td></tr><tr><td style="text-align:right;"><strong>事务</strong></td><td style="text-align:left;">支持</td><td style="text-align:left;">部分支持</td></tr><tr><td style="text-align:right;"><strong>使用场景</strong></td><td style="text-align:left;">1. 数据结构固定 <br> 2. 安全性一致性高</td><td style="text-align:left;">1. 数据结构不固定(当然你可以在程序中约束固定) <br> 2. 高性能要求的 <br> 3. 无需支持事务的</td></tr></tbody></table><table tabindex="0"><thead><tr><th style="text-align:left;">SQL</th><th style="text-align:left;">NoSql</th></tr></thead><tbody><tr><td style="text-align:left;">1. oracle <br> 2. mysql <br> 3. sqlite</td><td style="text-align:left;">1. MongoDB <br> 2. Redis <br> 3. HBase</td></tr></tbody></table><h2 id="查询语言-sql" tabindex="-1">查询语言 SQL <a class="header-anchor" href="#查询语言-sql" aria-label="Permalink to &quot;查询语言 SQL&quot;">​</a></h2><p>SQL 是 Structured Query Language 的缩写, 意为结构化的查询语言. 在支持 SQL 的数据库中, 每一条 SQL 语句会被发送到数据库, 数据库程序会解析其含义并根据含义输出不同的结果到客户端(SQL 语句发起者).</p><h2 id="orm" tabindex="-1">ORM <a class="header-anchor" href="#orm" aria-label="Permalink to &quot;ORM&quot;">​</a></h2><p>ORM 是 Object Relation Map 的缩写, 意为对象关系映射.</p><p>ORM 实际上就是在 SQL 和程序发起者之间加了一层(起到适配器的作用), ORM 提供各种程序可以调用的 API(相比 SQL 来说, ORM 能够具备更好的代码提示, 补全, 可读性, 可维护性), ORM 再根据客户端的输入转化为对应的 SQL 语句或者其他数据库的查询系统.</p><h2 id="事务-transaction" tabindex="-1">事务 Transaction <a class="header-anchor" href="#事务-transaction" aria-label="Permalink to &quot;事务 Transaction&quot;">​</a></h2><p>事务表示一组操作. 当一组操作全部完成了, 事务即完成, 一组操作失败其中某一个操作, 事务失败.</p><p>尤其是在涉及到金钱和其他比较复杂的操作时, 需要使用到事务.</p><h2 id="acid-原则" tabindex="-1">ACID 原则 <a class="header-anchor" href="#acid-原则" aria-label="Permalink to &quot;ACID 原则&quot;">​</a></h2><p>事务的 4 个特性. 以下 4 个单词的缩写. 名词很专业, 其实很 nt.</p><ul><li>Atomicity 原子性 即事务的一组操作要成功全成功, 否则失败</li><li>Consistency 一致性 (...)</li><li>Isolation 隔离性 即事务之间不能相互影响, 多个事务不能同时操作相同数据.</li><li>Durability 持久性 (就算没有事务, 单单改变某一个数据也是持久化的, 持久化不是事务独有的.)</li></ul><h2 id="集群-cluster" tabindex="-1">集群 Cluster <a class="header-anchor" href="#集群-cluster" aria-label="Permalink to &quot;集群 Cluster&quot;">​</a></h2><p>集群是一种分布式概念， 指的是一群资源的组合。</p><p>数据库的集群方式分两种， 一种是主从集群， 一种是分片集群。</p><h3 id="主从集群" tabindex="-1">主从集群 <a class="header-anchor" href="#主从集群" aria-label="Permalink to &quot;主从集群&quot;">​</a></h3><p>主从集群是为了支持程序的高可用， 他保证你在任意一个节点服务不可用的情况下， 任意其他的节点能够迅速顶上。</p><p>从数据上来讲， 无论是主节点还是从节点，保存的数据都是一样的，因此任意节点在主节点不可用后才能够顶上。</p><p>读写分离就是一种主从集群模式，读和写是 2 个库，由于读和写不在同一个库中完成， 因此数据库不用同时承受读和写的并发压力。</p><p>主从集群能够有效提高数据库的读写并发能力，但不能够增加数据的存储量，同时当数据量过多时仍然会达到瓶颈。</p><h3 id="分片集群" tabindex="-1">分片集群 <a class="header-anchor" href="#分片集群" aria-label="Permalink to &quot;分片集群&quot;">​</a></h3><p>分片集群通过将数据分开放到不同的节点中，能够阻止数据达到单个数据库的性能瓶颈。</p><p>方式</p><ul><li>设置单个库的上限，上限到了之后继续创建下一个库 <ul><li>集群扩展性好</li><li>不同的节点压力会不一样</li><li>容易备份</li></ul></li><li>预设多个库， 均衡写入 <ul><li>扩展性不好，你一开始可能得搞上很多数据库。</li><li>不同节点压力一致</li></ul></li></ul><h2 id="sql-语句" tabindex="-1">SQL 语句 <a class="header-anchor" href="#sql-语句" aria-label="Permalink to &quot;SQL 语句&quot;">​</a></h2><p>总体遵循: 如何处理(增删改查)哪张表(表名)的哪些数据(查询条件)</p><div class="language-sql vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 查: select 查命令, * 全部字段, from Users 从Users这个表中</span></span>\n<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">select</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> from</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Users;</span></span>\n<span class="line"></span>\n<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 改</span></span>\n<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">update</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Users </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">set</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> name=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;xxx&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, school</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;xxx&#39;</span></span>\n<span class="line"></span>\n<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 删</span></span>\n<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">delete</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> from</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Users </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">where</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;xxx&#39;</span></span>\n<span class="line"></span>\n<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 增</span></span>\n<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">insert into</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Users (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, age, school) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">values</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;xxx&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">20</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;xx&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><h3 id="where-where-not-子句" tabindex="-1">where / where not 子句 <a class="header-anchor" href="#where-where-not-子句" aria-label="Permalink to &quot;where / where not 子句&quot;">​</a></h3><p>指定条件, 表示对操作命令范围的一个限定.</p><p>多个条件在每个条件中使用 and 拼接, 表示既满足...又满足..., 使用 or 拼接表示满足其中一个即可</p><p>where not表达的思想用编程语言表达为:</p><div class="language-ts vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> a </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>\n<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  b </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 2</span></span>\n<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> result1 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> a </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">===</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &amp;&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> b </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">===</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 2</span></span>\n<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> result2 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> !</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(a </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!==</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> ||</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> b </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!==</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br></div></div><p>运算符有以下几种</p><table tabindex="0"><thead><tr><th>运算符</th><th>描述</th></tr></thead><tbody><tr><td>=</td><td></td></tr><tr><td>&lt;&gt;</td><td>不等于</td></tr><tr><td>&gt;</td><td></td></tr><tr><td>&lt;</td><td></td></tr><tr><td>&gt;=</td><td></td></tr><tr><td>&lt;=</td><td></td></tr><tr><td>between</td><td></td></tr><tr><td>like</td><td>像, like %a% -&gt; babb满足, baa满足, abb不满足</td></tr><tr><td>in</td><td>field in (1,2,3) 就等于 field=1 or field=2 or field=3</td></tr></tbody></table><div class="language-sql vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 查找id为xxx的用户</span></span>\n<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">select</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> from</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Users </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">where</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;xxx&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>\n<span class="line"></span>\n<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 查找name为xxx且学校为xxx的用户</span></span>\n<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">select</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> from</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Users </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">where</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;xxx&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> and</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> school</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;xxx&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>\n<span class="line"></span>\n<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">--</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br></div></div><h3 id="join-关联查询" tabindex="-1">join 关联查询 <a class="header-anchor" href="#join-关联查询" aria-label="Permalink to &quot;join 关联查询&quot;">​</a></h3><h3 id="聚合" tabindex="-1">聚合 <a class="header-anchor" href="#聚合" aria-label="Permalink to &quot;聚合&quot;">​</a></h3>',42)];const h=s(l,[["render",function(s,t,n,l,h,p){return a(),i("div",null,e)}]]);export{n as __pageData,h as default};
