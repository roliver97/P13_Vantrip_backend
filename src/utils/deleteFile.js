const cloudinary = require('cloudinary').v2

const deleteFile = async (imgUrl) => {
  // From imgUrl (e.g. https://res.cloudinary.com/demo/image/upload/v12345/Vantrip_P13_RTC/users/foto123.jpg) we need to extract Vantrip_P13_RTC/users/foto123 without extension (.jpg)
  if (!imgUrl || !imgUrl.includes('cloudinary')) {
    return
  }

  try {
    const splittedUrlArray = imgUrl.split('/')

    const folderIndex = splittedUrlArray.findIndex(
      (part) => part === 'Vantrip_P13_RTC'
    )

    const publicPath = splittedUrlArray.slice(folderIndex).join('/')
    // "join" piece together the parts of the array starting from slice(folderIndex) using '/' .

    const public_id = publicPath.split('.')[0]
    // e.g. "Vantrip_P13_RTC/users/foto123"

    console.log(`⌛ Deleting from Cloudinary: ${public_id}`)
    const result = await cloudinary.uploader.destroy(public_id)
    console.log(`✅ File deleted from Cloudinary successfully:`, result)
    return result
  } catch (error) {
    console.error('❌ Error deleting from Cloudinary:', error.message)
  }
}

module.exports = { deleteFile }
