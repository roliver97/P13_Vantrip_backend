require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { connectDB } = require('./src/config/db')
const setError = require('./src/utils/setError')

const usersRouter = require('./src/api/routes/users')
const campersRouter = require('./src/api/routes/campers')
const errorHandler = require('./src/middlewares/error')
const { connectCloudinary } = require('./src/config/cloudinary')

const app = express()
const PORT = process.env.PORT || 3000

connectDB()
connectCloudinary()
app.use(express.json())
app.use(cors())

app.use('/api/v1/users', usersRouter)
app.use('/api/v1/campers', campersRouter)

app.use((req, res, next) => {
  return next(setError(404, 'Route not found'))
})

//! GLOBAL ERROR MANAGER
// This has to be the last middleware before starting the server.
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`The server is working on http://localhost:${PORT}`)
})
