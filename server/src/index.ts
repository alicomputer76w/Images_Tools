import Fastify from 'fastify'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import multipart from '@fastify/multipart'
import { randomUUID } from 'uuid'
import { PDFDocument } from 'pdf-lib'
import fs from 'node:fs'
import path from 'node:path'

const app = Fastify({ logger: true })

await app.register(cors, { origin: true })
await app.register(rateLimit, { max: 60, timeWindow: '1 minute' })
await app.register(multipart, { limits: { fileSize: 25 * 1024 * 1024, files: 10 } })

const TMP = path.join(process.cwd(), 'tmp')
fs.mkdirSync(TMP, { recursive: true })

type Job = { id: string, filePath: string, filename: string }
const jobs = new Map<string, Job>()
type Token = { token: string, fileId: string, expiresAt: number }
const tokens = new Map<string, Token>()

app.post('/api/upload', async (req, reply) => {
  const mp = await req.file()
  if (!mp) return reply.status(400).send({ error: 'No file' })
  if (!mp.mimetype?.startsWith('image/')) return reply.status(400).send({ error: 'Invalid type' })
  const id = randomUUID()
  const filename = mp.filename || 'file'
  const filePath = path.join(TMP, id + '-' + filename)
  await fs.promises.writeFile(filePath, await mp.toBuffer())
  jobs.set(id, { id, filePath, filename })
  return { jobId: id, previewUrl: `/api/download/${id}` }
})

app.get('/api/status/:jobId', async (req, reply) => {
  const { jobId } = req.params as any
  if (!jobs.has(jobId)) return reply.status(404).send({ status: 'not_found' })
  return { status: 'uploaded' }
})

app.get('/api/download/:fileId', async (req, reply) => {
  const { fileId } = req.params as any
  const job = jobs.get(fileId)
  if (!job) return reply.status(404).send({ error: 'Not found' })
  const stream = fs.createReadStream(job.filePath)
  reply.header('Content-Disposition', `attachment; filename=${job.filename}`)
  return reply.send(stream)
})

app.post('/api/merge-to-pdf', async (req, reply) => {
  const parts = req.parts()
  const images: Buffer[] = []
  for await (const part of parts) {
    if (part.type === 'file') {
      images.push(await part.toBuffer())
    }
  }
  if (!images.length) return reply.status(400).send({ error: 'No images' })
  const pdf = await PDFDocument.create()
  for (const img of images) {
    try {
      const jpg = await pdf.embedJpg(img)
      const page = pdf.addPage([jpg.width, jpg.height])
      page.drawImage(jpg, { x: 0, y: 0, width: jpg.width, height: jpg.height })
      continue
    } catch {}
    try {
      const png = await pdf.embedPng(img)
      const page = pdf.addPage([png.width, png.height])
      page.drawImage(png, { x: 0, y: 0, width: png.width, height: png.height })
    } catch {}
  }
  const out = await pdf.save()
  const id = randomUUID()
  const filePath = path.join(TMP, id + '.pdf')
  await fs.promises.writeFile(filePath, out)
  jobs.set(id, { id, filePath, filename: 'merged.pdf' })
  return { fileId: id, downloadUrl: `/api/download/${id}` }
})

app.post('/api/share', async (req, reply) => {
  const body = req.body as any
  const fileId = body?.fileId
  if (!fileId || !jobs.has(fileId)) return reply.status(404).send({ error: 'Not found' })
  const token = randomUUID()
  const ttlMs = (process.env.SHARE_TTL_MINUTES ? parseInt(process.env.SHARE_TTL_MINUTES) : 60) * 60 * 1000
  const expiresAt = Date.now() + ttlMs
  tokens.set(token, { token, fileId, expiresAt })
  return { url: `/api/public/${fileId}?token=${token}`, expiresAt }
})

app.get('/api/public/:fileId', async (req, reply) => {
  const { fileId } = req.params as any
  const { token } = req.query as any
  const t = token && tokens.get(token)
  if (!t || t.fileId !== fileId || Date.now() > t.expiresAt) return reply.status(403).send({ error: 'Invalid token' })
  const job = jobs.get(fileId)
  if (!job) return reply.status(404).send({ error: 'Not found' })
  const stream = fs.createReadStream(job.filePath)
  reply.header('Content-Disposition', `attachment; filename=${job.filename}`)
  return reply.send(stream)
})

app.delete('/api/file/:fileId', async (req, reply) => {
  const { fileId } = req.params as any
  const job = jobs.get(fileId)
  if (!job) return reply.status(404).send({ error: 'Not found' })
  await fs.promises.unlink(job.filePath).catch(()=>{})
  jobs.delete(fileId)
  return { ok: true }
})

app.post('/api/process', async (req, reply) => {
  const body = req.body as any
  if (!body?.jobId || !body?.tool) return reply.status(400).send({ error: 'Invalid request' })
  const processingId = randomUUID()
  return { processingId, status: 'queued' }
})

const ttlMinutes = process.env.EPHEMERAL_TTL_MINUTES ? parseInt(process.env.EPHEMERAL_TTL_MINUTES) : 60
setInterval(async ()=>{
  const files = await fs.promises.readdir(TMP)
  const now = Date.now()
  await Promise.all(files.map(async f => {
    const p = path.join(TMP, f)
    const st = await fs.promises.stat(p)
    if (now - st.mtimeMs > ttlMinutes * 60 * 1000) {
      await fs.promises.unlink(p).catch(()=>{})
    }
  }))
}, 10 * 60 * 1000)

const port = process.env.PORT ? parseInt(process.env.PORT) : 3001
app.listen({ port, host: '0.0.0.0' }).then(()=>{
  console.log('Server listening on', port)
})
