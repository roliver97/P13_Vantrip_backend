const multer = require('multer')
const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folderName = 'Vantrip_P13_RTC/default'

    if (req.originalUrl.includes('users')) {
      // req.originalUrl is the route automatically saved by Express in req that the frontend calls (e.g., /api/v1/users/64f1a...)
      folderName = 'Vantrip_P13_RTC/users'
    } else if (req.originalUrl.includes('campers')) {
      folderName = 'Vantrip_P13_RTC/campers'
    }

    return {
      folder: folderName,
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
    }
  }
})

const fileFilter = (req, file, cb) => {
  if (
    ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(
      file.mimetype
    )
  ) {
    cb(null, true) // ✅ "Ok Multer, upload this picture!"
  } else {
    cb(new Error('Invalid format. Only JPG, PNG, or WEBP allowed'), false) // ❌
  }
}

const uploadFile = multer({ storage, fileFilter })

module.exports = uploadFile
