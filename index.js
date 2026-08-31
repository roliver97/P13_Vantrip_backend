require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { connectDB } = require('./src/config/db')
const setError = require('./src/utils/setError')

const usersRouter = require('./src/api/routes/users')

const app = express()
const PORT = process.env.PORT || 3000

connectDB()
app.use(express.json())
app.use(cors())

app.use('/api/v1/users', usersRouter)

app.use((req, res, next) => {
  return next(setError(404, 'Route not found'))
})

//! GLOBAL ERROR MANAGER
// This has to be the last middleware before starting the server.
app.use((err, req, res, next) => {
  //? Errors are now handled with `next(setError(...))` within each controller. However, for unexpected errors that we haven't handled, we use the default status code 500.

  console.error('🔥 Server Error:', err) // For devs, with all the information

  // Native errors lack a status, so we explicitly default them to 500.
  // To prevent data leaks, we send a generic message on 500s; in contrast, our custom errors (e.g., 401, 409) are safe to expose to the frontend.
  const statusCode = err.status || 500
  const message = statusCode === 500 ? 'Internal server error' : err.message

  return res.status(statusCode).json({ status: statusCode, message })
})

app.listen(PORT, () => {
  console.log(`The server is working on http://localhost:${PORT}`)
})
