const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')

const locationRoutes = require('./src/routes/locationRoutes')
const eventRoutes = require('./src/routes/eventRoutes')
const authRoutes = require('./src/routes/authRoutes')
const auth = require('./src/middleware/auth')

dotenv.config()

const app = express()
app.use(express.json())

app.use(
  cors({
    origin: ['http://localhost:3000', 'https://huit-client.vercel.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
)

app.options('*', cors())

const port = process.env.PORT || 8080

mongoose
  .connect(process.env.DB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Could not connect to MongoDB...', err))

app.use(auth)

app.use('/api/v1', locationRoutes)
app.use('/api/v1', eventRoutes)
app.use('/api/v1', authRoutes)

app.listen(port, () => {
  console.log(`Server is running on port ${port} with cors enable`)
})
