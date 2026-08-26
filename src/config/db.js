const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL)
    console.log('Database connection successfully established 🤩')
  } catch (error) {
    console.log('Failed to connect to the database 😰', error)
  }
}

module.exports = { connectDB }
