/** 本地预览：静态文件服务器，按 GitHub Pages 的子路径方式也能访问。
 *  node build.mjs --serve  →  http://localhost:4173/
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
}

export function serve(root, port = 4173) {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
    let filePath = path.join(root, urlPath)
    if (!filePath.startsWith(root)) {
      res.writeHead(403).end('forbidden')
      return
    }
    try {
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html')
      }
      if (!fs.existsSync(filePath)) {
        const notFound = path.join(root, '404.html')
        res.writeHead(404, { 'content-type': MIME['.html'] })
        res.end(fs.existsSync(notFound) ? fs.readFileSync(notFound) : 'not found')
        return
      }
      const ext = path.extname(filePath).toLowerCase()
      res.writeHead(200, {
        'content-type': MIME[ext] || 'application/octet-stream',
        'cache-control': 'no-store',
      })
      fs.createReadStream(filePath).pipe(res)
    } catch (err) {
      res.writeHead(500).end(String(err))
    }
  })
  server.listen(port, () => {
    console.log(`\n预览： http://localhost:${port}/`)
  })
  return server
}
