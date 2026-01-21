import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { bucketList as seedBucket, timeline as seedTimeline } from './src/data/memories.js'

const DB_PATH = path.join(process.cwd(), 'api', 'db.dev.json')
const DEFAULT_NOTE = '给未来的我们：记得在忙碌的每一天留一点空隙，看日落、喝热巧克力、分享梦。'

function loadDB() {
  if (fs.existsSync(DB_PATH)) {
    try {
      const raw = fs.readFileSync(DB_PATH, 'utf-8')
      return JSON.parse(raw)
    } catch (err) {
      console.error('Failed to read dev db, using seed', err)
    }
  }
  return { capsules: seedTimeline, bucket: seedBucket, note: DEFAULT_NOTE }
}

function saveDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
      if (data.length > 1e6) {
        req.connection.destroy()
        reject(new Error('Payload too large'))
      }
    })
    req.on('end', () => {
      if (!data) return resolve({})
      try {
        resolve(JSON.parse(data))
      } catch (err) {
        reject(err)
      }
    })
  })
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'local-api',
      configureServer(server) {
        let db = loadDB()
        server.middlewares.use(async (req, res, next) => {
          if (!req.url.startsWith('/api/')) return next()

          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS')
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
          if (req.method === 'OPTIONS') {
            res.statusCode = 204
            return res.end()
          }

          try {
            if (req.url === '/api/state' && req.method === 'GET') {
              res.setHeader('Content-Type', 'application/json')
              return res.end(JSON.stringify(db))
            }

            if (req.url === '/api/capsules' && req.method === 'POST') {
              const body = await readBody(req)
              const capsule = body?.capsule
              if (!capsule?.title) {
                res.statusCode = 400
                return res.end(JSON.stringify({ error: 'Invalid capsule' }))
              }
              const id = capsule.id || `capsule-${Date.now()}`
              const newCapsule = { ...capsule, id }
              db.capsules = [...db.capsules, newCapsule]
              saveDB(db)
              res.statusCode = 201
              res.setHeader('Content-Type', 'application/json')
              return res.end(JSON.stringify(newCapsule))
            }

            if (req.url.startsWith('/api/capsules/') && req.method === 'PUT') {
              const id = decodeURIComponent(req.url.split('/').pop())
              const body = await readBody(req)
              const next = db.capsules.map((c) => (c.id === id ? { ...c, ...body } : c))
              if (!next.find((c) => c.id === id)) {
                res.statusCode = 404
                return res.end(JSON.stringify({ error: 'Capsule not found' }))
              }
              db.capsules = next
              saveDB(db)
              res.setHeader('Content-Type', 'application/json')
              return res.end(JSON.stringify({ ok: true }))
            }

            if (req.url.startsWith('/api/bucket/') && req.method === 'PUT') {
              const id = decodeURIComponent(req.url.split('/').pop())
              const body = await readBody(req)
              const next = db.bucket.map((b) => (b.id === id ? { ...b, ...body } : b))
              if (!next.find((b) => b.id === id)) {
                res.statusCode = 404
                return res.end(JSON.stringify({ error: 'Bucket item not found' }))
              }
              db.bucket = next
              saveDB(db)
              res.setHeader('Content-Type', 'application/json')
              return res.end(JSON.stringify({ ok: true }))
            }

            if (req.url === '/api/note' && req.method === 'PUT') {
              const body = await readBody(req)
              if (typeof body.note !== 'string') {
                res.statusCode = 400
                return res.end(JSON.stringify({ error: 'Invalid note' }))
              }
              db.note = body.note
              saveDB(db)
              res.setHeader('Content-Type', 'application/json')
              return res.end(JSON.stringify({ ok: true }))
            }
          } catch (err) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            return res.end(JSON.stringify({ error: err.message }))
          }

          res.statusCode = 404
          res.setHeader('Content-Type', 'application/json')
          return res.end(JSON.stringify({ error: 'Not found' }))
        })
      },
    },
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'ovenlike-cristiano-nominalistic.ngrok-free.dev',
      /\.ngrok-free\.(dev|app)$/,
    ],
  },
})
