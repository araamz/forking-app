import express, { Request, Response } from 'npm:express@4.21.2'
import cors from 'npm:cors'

const app = express()
const host = Deno.args[0] || 'localhost'
const port = Deno.args[1] || 8000
const message = Deno.args[2] || 'Hello, Server!'

app.use(express.json())
app.use(cors())

app.listen(port, () => {
  console.log(`Server is running on ${host}:${port}`)
})

const echoMessage = {
  message: message,
  changed: new Date().toISOString()
}

app.get('/', (_: Request, res: Response) => {
  res.json(echoMessage)
  res.status(200)
})

app.post('/update', (req: Request, res: Response) => {
  console.log(req.body)
  const { message } = req.body
  echoMessage.message = message
  echoMessage.changed = new Date().toISOString()
  res.json(echoMessage)
  res.status(200)
})
