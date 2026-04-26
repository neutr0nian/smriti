import express from 'express'
import cors from 'cors'
import chatRouter from './routes/chat'
import titleRouter from './routes/title'
import { errorHandler } from './middleware/errorHandler'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api/chat', chatRouter)
app.use('/api/title', titleRouter)

app.use(errorHandler)

export default app
