require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { connectDB } = require('./src/config/db')

const app = express()
const PORT = process.env.PORT || 3000

connectDB()
app.use(express.json())
app.use(cors())

app.use((req, res, next) => {
  return res.status(404).json('Route not found')
})

app.listen(PORT, () => {
  console.log(`The server is working on http://localhost:${PORT}`)
})
