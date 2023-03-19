# ChatGpt
chatgpt 是 openai 推出的聊天机器人产品, 基于他们的 gpt 模型.

GPT(Generative Pre-trained Transformer)，是一种基于互联网可用数据训练的文本生成深度学习模型。目前有 gpt-1, gpt-2, gpt-3, gpt-3.5 以及最新的 gpt-4.

它比搜索引擎强大的地方在于, 它能够给出搜索引擎中行不存在的内容, 这就是 gpt 中 g 的力量, 隐患是生成的东西因为肯能会不存在, 因此会有捏造混淆的风险, 尽管如此也仍然比搜索引擎的广告和眼花缭乱的信息要强大的多.

## 官方

- [chat-gpt](https://chat.openai.com)

- [官方 node.js 接口](https://github.com/openai/openai-node), 很多插件包括一些免费的国内网站使用的就是openai提供的接口, 以下是官方nodejs库的示例, 除此之外, 官方还提供了python的库, 其他语言的库在社区应该也可以找到

```ts
import { Configuration, OpenAIApi } from 'openai'

const apiKey = '你的apikey可以在你注册chatgpt账号后在个人中心apikey中找到'
const configuration = new Configuration({
  // 这是必须的
  apiKey
})
const openai = new OpenAIApi(configuration)

const completion = await openai.createCompletion(
  {
    // 这里的模型有多个, 常用的有gpt-3.5-turbo, gpt3, gpt4, 以及他们对应的快照版本
    // 有部分模型是收费的, 最新的gpt4费用还是很高的...
    // 你可以用你的apiKey来获取可用额模型
    model: 'text-davinci-003',
    // 提示语
    prompt: 'Hello world'
  },
  {
    timeout: 1000,
    headers: {
      'Example-Header': 'example'
    }
  }
)
console.log(completion.data.choices[0].text)
```

## 编程工具

- [vscode github copilot](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot), 早期内测时使用过, 其实也是使用的 openai 来帮忙实现的, 那个时候是免费的, 但是生成的代码质量堪忧, 现在收费后不知道什么情况了

- [cursor](https://www.cursor.so/)暂时免费, 功能强大, 之前基于 chat3.5turbo, 现在基于 gpt-4

## 第三方

::: warning 警告!!!
目前体验的第三方的gpt也都需要电话和邮箱注册, 这里可能存在信息泄露的风险
:::
- [poe](https://poe.com/), 各方面体验下来最好的工具, 而且有多个模型可以切换

- [chat8](https://chat8.io/), 没有生成动画, 所以你要稍作等待才会出结果

## 谷歌插件
- [chatGpt-for-google](https://chrome.google.com/webstore/detail/chatgpt-for-google/jgjaeacdkonaoafenlfkkkmbaopkbilf), 需要你自己配置apiKey

## GPT可以帮我们做什么?
gpt可以增加我们的效率, 激发我们的创造力, 想想我们可以将其用在何种场景?

### 识别图像
GPT4可以用图像作为输入, 可以给你描述这个图像上有什么, 那么我们肯定可以用GPT代替OCR识别, 做到远比OCR更加强大的地方

### AI绘画
这个目前已经成为生产力工具了, 可以提供创作灵感, 底稿, 甚至已经有人拿去面试了

### 写论文
...

### 游戏动态文案
目前的游戏文案, 哪怕是多分支的游戏, 文案也是人工设定好的, 通过gpt可以针对不同的上下文生成不同的文案, 利好游戏行业, 为游戏创新提供了强大的助力

### 代码编写辅助
帮忙实现一些重复性的代码

### 语音转文字
比如你做了一个管理软件, 用户每天打开它要做任务, 首先需要完成各种点击操作才能达到目标界面, 如果给你的系统添加一个语音入口, 然后通过语音识别输出的内容进行操作和跳转.

::: info
实际上, 语音入口无需这么麻烦, 我们可以利用现有的框架以及语音识别模型, 让ai使用系统独特的词汇进行训练, 那么其输出结果肯定比全领域语音识别更加准确
:::

### 数据分析
给它任意维度的数据, 要求它进行分析. 不过如果你的数据涉及到机密内容, 那么一定不要这么做.

```
# 做成本优化?
prompt: 给如下数据..., 分析近三年的xx业务的投入产出比

# 做公关, 做研发, 做市场调研
prompt: 给如下数据..., 分析汽车行业的的客户画像, 包括年龄, 性别, 学历, 是否第一辆车, 喜好. 并且生成一份用户的喜好排名报告
```

### 做学习计划
如果一个学习能力好的人, 我认为基本上可以完全脱离学校老师的教育了, 你甚至可以直接让他帮你做学习计划, 不会的地方你可以随时提问, 一对一教学诚不我欺

### ai女友
在b站上看过很多此类视频...坏了, 生育率还怎么上去啊

### 写小说
这个...

### 做旅游攻略
...

## 总结
从汽车工业的发展我们可以汲取一些经验, 德国大众的衰弱, 日系燃油车的衰弱, 中国新能源车的崛起来看, 连这些庞然大物都没办法抵挡时代潮流, 因为他们是旧时代的既得利益者, 牵一发而动全身, 我们作为个体实际上是更加容易做出转型的.

面对这些工具, 我们要勇于拥抱. AI不会替代你, 但是不会使用AI的人一定会被淘汰.

