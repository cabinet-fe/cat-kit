import chalk from 'chalk'

import { groups } from './groups'

console.log(chalk.bold(chalk.cyan('\n📦 开始全量构建...\n')))

await Promise.all(
  Object.entries(groups).map(async ([name, item]) => {
    if (item.build) {
      console.log(chalk.blue(`🛠️  正在构建组: ${chalk.bold(name)}...`))
      await item.build()
      console.log(chalk.green(`✅ 组 ${name} 构建完成`))
    }
  })
)

console.log(chalk.bold(chalk.green('\n✨ 所有组构建完成！\n')))
