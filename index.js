require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { connectDB } = require('./src/config/db')
const setError = require('./src/utils/setError')

const app = express()
const PORT = process.env.PORT || 3000

connectDB()
app.use(express.json())
app.use(cors())

app.use((req, res, next) => {
  return next(setError(404, 'Route not found'))
})

//! GLOBAL ERROR MANAGER
// This has to be the last middleware before starting the server.
app.use((err, req, res, next) => {
  //? Errors are now handled with `next(setError(...))` within each controller. However, for unexpected errors that we haven't handled, we use the default status code 500.
  const statusCode = err.status || 500
  const message = err.message || 'Internal server error'

  return res.status(statusCode).json({ status: statusCode, message: message })
})

app.listen(PORT, () => {
  console.log(`The server is working on http://localhost:${PORT}`)
})
