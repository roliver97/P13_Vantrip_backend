const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL)
    console.log('Database connection successfully established 🤩')
  } catch (error) {
    console.error('Failed to connect to the database 😰', error)
    throw error
  }
}

const disconnectDB = async () => {
  try {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from Database succesfully')
  } catch (error) {
    console.error('Failed to disconnect from the database 😰', error)
    throw error
  }
}

module.exports = { connectDB, disconnectDB }
