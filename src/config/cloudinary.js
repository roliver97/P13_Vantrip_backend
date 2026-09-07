const cloudinary = require('cloudinary').v2

const connectCloudinary = () => {
  try {
    const { CLOUD_NAME, API_KEY, API_SECRET } = process.env

    if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
      throw new Error('Missing Cloudinary environment variables in .env 🤔')
    }

    cloudinary.config({
      cloud_name: CLOUD_NAME,
      api_key: API_KEY,
      api_secret: API_SECRET
    })
    console.log('☁️ Connected to Cloudinary successfully')
  } catch (error) {
    console.error('❌ Failed to configure Cloudinary:', error.message)
  }
}

module.exports = { connectCloudinary }
