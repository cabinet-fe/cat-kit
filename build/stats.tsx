import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderToString } from 'react-dom/server'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

interface Package {
  name: string
  description: string
  path: string
}

// 动态扫描 packages 目录
async function getPackages(): Promise<Package[]> {
  const packagesDir = path.join(rootDir, 'packages')

  const entries = await fs.readdir(packagesDir, { withFileTypes: true })
  const packages = await Promise.all(
    entries.map(async entry => {
      const packageJson = await import(
        path.join(packagesDir, entry.name, 'package.json')
      )
      return {
        name: packageJson.default.name,
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
            background-color: #f8f9fb;
            background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
            background-size: 24px 24px;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            color: #111827;
          }

          .container {
            max-width: 1000px;
            width: 100%;
            position: relative;
          }

          header {
            text-align: left;
            margin-bottom: 48px;
            padding-left: 4px;
          }

          h1 {
            font-size: 2.25rem;
            color: #111827;
            margin-bottom: 8px;
            font-weight: 700;
            letter-spacing: -0.025em;
            display: flex;
            align-items: center;
            gap: 12px;
          }

          h1::before {
            content: '';
            display: block;
            width: 8px;
            height: 32px;
            background: #2563eb;
            border-radius: 4px;
          }

          .subtitle {
            font-size: 1rem;
            color: #6b7280;
            font-weight: 400;
            padding-left: 20px;
          }

          .packages-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
            gap: 20px;
          }

          .package-item {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 24px;
            display: flex;
            flex-direction: column;
            text-decoration: none;
            color: inherit;
            transition: all 0.2s ease;
            height: 100%;
          }

          .package-item:hover {
            border-color: #2563eb;
            transform: translateY(-2px);
            box-shadow: 0 10px 30px -10px rgba(37, 99, 235, 0.15);
          }

          .package-info {
            width: 100%;
          }

          .package-name {
            font-size: 1rem;
            font-weight: 600;
            color: #111827;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .package-name::after {
            content: '→';
            font-size: 1.1rem;
            color: #9ca3af;
            transition: transform 0.2s ease, color 0.2s ease;
          }

          .package-item:hover .package-name::after {
            transform: translateX(4px);
            color: #2563eb;
          }

          .package-description {
            font-size: 0.875rem;
            color: #6b7280;
            line-height: 1.5;
          }

          footer {
            text-align: center;
            color: #9ca3af;
            margin-top: 60px;
            font-size: 0.875rem;
            border-top: 1px solid #e5e7eb;
            padding-top: 24px;
          }

          .empty-state {
            text-align: center;
            color: #6b7280;
            padding: 80px 20px;
            background: white;
            border: 1px dashed #e5e7eb;
            border-radius: 8px;
          }

          .empty-state h2 {
            font-size: 1.25rem;
            color: #374151;
            margin-bottom: 8px;
            font-weight: 600;
          }

          @media (max-width: 768px) {
            h1 {
              font-size: 1.75rem;
            }

            .subtitle {
              padding-left: 0;
            }

            .package-item {
              padding: 20px;
            }
          }
        `
          }}
        />
      </head>
      <body>
        <div className='container'>
          <header>
            <h1>Bundle Analysis</h1>
            <p className='subtitle'>构建产物与依赖可视化分析</p>
          </header>

          {packages.length > 0 ? (
            <>
              <div className='packages-list'>
                {packages.map(pkg => (
                  <a key={pkg.name} href={pkg.path} className='package-item'>
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
                <p>Generated by Cat-Kit Build Tools</p>
              </footer>
            </>
          ) : (
            <div className='empty-state'>
              <h2>No analysis reports found</h2>
              <p>Please run "bun run build" first to generate reports.</p>
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
