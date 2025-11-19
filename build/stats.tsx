import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderToString } from 'react-dom/server'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

interface Package {
  name: string
  icon: string
  description: string
  path: string
}

// 动态扫描 packages 目录
async function getPackages(): Promise<Package[]> {
  const packagesDir = path.join(rootDir, 'packages')

  const entries = await fs.readdir(packagesDir, { withFileTypes: true })
  const packages = Promise.all(
    entries.map(async entry => {
      const packageJson = await import(
        path.join(packagesDir, entry.name, 'package.json')
      )
      return {
        name: packageJson.default.name,
        icon: '📦',
        description: packageJson.default.description,
        path: `/packages/${entry.name}/dist/stats.html`
      }
    })
  )
  return packages
}

// React 组件
function HomePage({ packages }: { packages: Package[] }) {
  return (
    <html lang='zh-CN'>
      <head>
        <meta charSet='UTF-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <title>Cat-Kit Bundle 分析</title>
        <style
          dangerouslySetInnerHTML={{
            __html: `
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
              'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            color: #333;
          }

          .container {
            max-width: 1100px;
            width: 100%;
          }

          header {
            text-align: center;
            margin-bottom: 40px;
            animation: fadeInDown 0.6s ease-out;
          }

          h1 {
            font-size: 3rem;
            color: white;
            margin-bottom: 10px;
            font-weight: 700;
            text-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
          }

          .subtitle {
            font-size: 1.1rem;
            color: rgba(255, 255, 255, 0.9);
            font-weight: 300;
          }

          .emoji {
            display: inline-block;
            animation: bounce 2s infinite;
          }

          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }

          .packages-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 16px;
            animation: fadeInUp 0.6s ease-out;
          }

          .package-item {
            background: white;
            border-radius: 12px;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            text-decoration: none;
            color: inherit;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
          }

          .package-item::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            transform: scaleX(0);
            transition: transform 0.3s ease;
          }

          .package-item:hover::before {
            transform: scaleX(1);
          }

          .package-item:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
          }

          .package-icon {
            font-size: 2rem;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
            border-radius: 10px;
            margin-bottom: 12px;
            flex-shrink: 0;
          }

          .package-info {
            width: 100%;
          }

          .package-name {
            font-size: 1.05rem;
            font-weight: 600;
            color: #333;
            margin-bottom: 6px;
            word-break: break-word;
          }

          .package-description {
            font-size: 0.8rem;
            color: #888;
            line-height: 1.4;
          }

          footer {
            text-align: center;
            color: white;
            margin-top: 30px;
            font-size: 0.85rem;
            opacity: 0.8;
          }

          .empty-state {
            text-align: center;
            color: white;
            padding: 60px 20px;
            animation: fadeInUp 0.6s ease-out;
          }

          .empty-state h2 {
            font-size: 2rem;
            margin-bottom: 10px;
          }

          .empty-state p {
            font-size: 1.1rem;
            opacity: 0.9;
          }

          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translateY(-30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @media (max-width: 768px) {
            h1 {
              font-size: 2rem;
            }

            .subtitle {
              font-size: 1rem;
            }

            .packages-list {
              grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
              gap: 12px;
            }

            .package-item {
              padding: 16px;
            }

            .package-icon {
              font-size: 1.6rem;
              width: 40px;
              height: 40px;
              margin-bottom: 10px;
            }

            .package-name {
              font-size: 0.95rem;
            }

            .package-description {
              font-size: 0.75rem;
            }
          }
        `
          }}
        />
      </head>
      <body>
        <div className='container'>
          <header>
            <h1>
              <span className='emoji'>📊</span> Bundle 分析
            </h1>
            <p className='subtitle'>选择要查看的包</p>
          </header>

          {packages.length > 0 ? (
            <>
              <div className='packages-list'>
                {packages.map(pkg => (
                  <a key={pkg.name} href={pkg.path} className='package-item'>
                    <div className='package-icon'>{pkg.icon}</div>
                    <div className='package-info'>
                      <div className='package-name'>{pkg.name}</div>
                      <div className='package-description'>
                        {pkg.description}
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              <footer>
                <p>💡 点击任意包查看详细的 Bundle 分析报告</p>
              </footer>
            </>
          ) : (
            <div className='empty-state'>
              <h2>📦 暂无可用的分析报告</h2>
              <p>请先运行 bun run build 生成分析报告</p>
            </div>
          )}
        </div>
      </body>
    </html>
  )
}

// 缓存包列表
let cachedPackages: Package[] | null = null

async function getCachedPackages(): Promise<Package[]> {
  if (!cachedPackages) {
    cachedPackages = await getPackages()
  }
  return cachedPackages
}

// 启动服务
const server = Bun.serve({
  port: 3030,
  async fetch(req) {
    const url = new URL(req.url)

    // 首页
    if (url.pathname === '/') {
      const packages = await getCachedPackages()
      const html = renderToString(<HomePage packages={packages} />)

      return new Response('<!DOCTYPE html>' + html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      })
    }

    // 刷新包列表
    if (url.pathname === '/api/refresh') {
      cachedPackages = await getPackages()
      return new Response(
        JSON.stringify({ success: true, count: cachedPackages.length }),
        {
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // 静态文件服务
    if (url.pathname.startsWith('/packages/')) {
      const filePath = path.join(rootDir, url.pathname)

      try {
        const file = Bun.file(filePath)
        const exists = await file.exists()

        if (!exists) {
          return new Response('File not found', { status: 404 })
        }

        return new Response(file, {
          headers: {
            'Content-Type': file.type || 'text/html; charset=utf-8'
          }
        })
      } catch (error) {
        return new Response('Error reading file', { status: 500 })
      }
    }

    return new Response('404 Not Found', { status: 404 })
  }
})

console.log('\n📊 Bundle 分析服务已启动')
console.log(`🌐 访问地址: \x1b[36mhttp://localhost:${server.port}\x1b[0m`)
console.log(
  `🔄 刷新列表: \x1b[36mhttp://localhost:${server.port}/api/refresh\x1b[0m\n`
)
