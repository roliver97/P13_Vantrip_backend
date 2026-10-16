const Camper = require('../models/Camper')
const User = require('../models/User')
const setError = require('../../utils/setError')
const Booking = require('../models/Booking')
const { deleteFile } = require('../../utils/deleteFile')

const createCamper = async (req, res, next) => {
  try {
    const userId = req.user._id
    const { title } = req.body

    const existingCamper = await Camper.findOne({
      owner: userId,
      title: title?.trim()
    })

    if (existingCamper) {
      return next(
        setError(409, 'You already have a camper posted with this title.')
      )
    }

    const newCamper = new Camper(req.body)
    newCamper.owner = userId

    if (req.files?.length > 0) {
      if (req.files?.length > 8)
        return next(
          setError(
            400,
            'A camper cannot have more than 8 images in total 🖼️... Try removing images to meet the limit.'
          )
        )

      newCamper.images = req.files.map((file) => file.path)
    }

    const savedCamper = await newCamper.save()
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          postedCampers: savedCamper._id
        }
      },
      { new: true, runValidators: true }
    ).select('-password')

    const postedCampersCount = updatedUser.postedCampers.length

    return res.status(201).json({
      message: `New camper created and added to your profile. Now you have ${postedCampersCount} posted campers! 🎉`,
      camper: savedCamper
    })
  } catch (error) {
    return next(error)
  }
}

const getCampers = async (req, res, next) => {
  try {
    // We extract both the search query and the filters that the frontend will add to `req.query` via the URL.
    const { query, location, capacity, startDate, endDate } = req.query
    let queryConditions = {}

    if (query) {
      const queryWords = query.trim().split(/\s+/)
      const wordRegexes = queryWords.map((word) => new RegExp(word, 'i')) // 'i' de insensitive === case insensitive
      const users = await User.find({
        $or: [
          { firstName: { $in: wordRegexes } }, // not { firstName: { $regex: queryWords, $options: 'i' } }, cause regex doesn't accept an array, only string. For MongoDB to read an array, we need $in, but previosuly we need to regex every single word before we put it inside $in
          { lastName: { $in: wordRegexes } },
          { username: { $in: wordRegexes } }
        ]
      }).select('_id')
      const userIds = users.map((user) => user._id)

      const searchConditions = wordRegexes.map((regexWord) => {
        //returns an object that meets ANY of these conditions ⬇️
        return {
          $or: [
            { title: regexWord },
            { brand: regexWord },
            { modelName: regexWord },
            { location: regexWord },
            { description: regexWord },
            { owner: { $in: userIds } }
          ]
        }
      })

      queryConditions.$and = searchConditions
      //? We create an object with a key named "$and" and, as its value, the array we just created, "searchConditions".
      // Subsequently, when we use the MongoDB method (`Camper.find(queryConditions)`), MongoDB will interpret the `$and` key as a condition: ALL conditions (`searchConditions`) must be met.
    }

    if (location) queryConditions.location = new RegExp(location, 'i')
    if (capacity) queryConditions.capacity = { $gte: Number(capacity) }
    if (startDate && endDate) {
      const conflictingBookings = await Booking.find({
        startDate: { $lte: new Date(endDate) },
        endDate: { $gte: new Date(startDate) }
      }).select('camper')

      const busyCamperIds = conflictingBookings.map((booking) => booking.camper)

      queryConditions._id = { $nin: busyCamperIds } // $nin === "not in"
      // Since the booking schema defines `camper` with the type `mongoose.Schema.Types.ObjectId`, `booking.camper` will return the ID directly, not the entire camper object. It would be different if we used `.populate` within the schema, but that is not the case here.
    }

    const campers = await Camper.find(queryConditions) // if queryConditions is {}, it will return all of them
    return res.status(200).json({
      message: '✅ The search for campers was successful',
      searchItems: campers.length,
      campers
    })
  } catch (error) {
    return next(error)
  }
}

const getCamper = async (req, res, next) => {
  const { id } = req.params

  try {
    const camper = await Camper.findById(id).populate(
      'owner',
      'firstName lastName avatar'
    )

    if (!camper) return next(setError(404, 'Camper not found 🔍'))

    return res.status(200).json(camper)
  } catch (error) {
    return next(error)
  }
}

const deleteCamper = async (req, res, next) => {
  try {
    const deletedCamper = req.camper
    if (!deletedCamper) return next(setError(404, 'Camper not found 🔍'))
    await deletedCamper.deleteOne()

    const imagesToDelete = deletedCamper.images

    if (imagesToDelete && deletedCamper.images.length > 0) {
      for (const image of imagesToDelete) {
        if (image.includes('cloudinary')) {
          await deleteFile(image)
        }
      }
    }

    await User.findByIdAndUpdate(deletedCamper.owner, {
      $pull: { postedCampers: deletedCamper._id }
    })

    return res.status(200).json({
      message: `${deletedCamper.title} was successfully deleted from Database! 🗑️`
    })
  } catch (error) {
    return next(error)
  }
}

const updateCamper = async (req, res, next) => {
  try {
    const camperToUpdate = req.camper
    if (!camperToUpdate) {
      return next(setError(404, 'Camper not found 🔍'))
    }

    const {
      title,
      brand,
      modelName,
      pricePerDay,
      cleaningFee,
      weeklyDiscount,
      seasonalPricing,
      capacity,
      description,
      location,
      available
    } = req.body

    if (title) camperToUpdate.title = title.trim()
    if (brand) camperToUpdate.brand = brand.trim()
    if (modelName) camperToUpdate.modelName = modelName.trim()
    if (description !== undefined)
      camperToUpdate.description = description.trim()
    if (location) camperToUpdate.location = location.trim()

    if (pricePerDay !== undefined)
      camperToUpdate.pricePerDay = Number(pricePerDay)
    if (cleaningFee !== undefined)
      camperToUpdate.cleaningFee = Number(cleaningFee)
    if (weeklyDiscount !== undefined)
      camperToUpdate.weeklyDiscount = Number(weeklyDiscount)
    if (capacity !== undefined) camperToUpdate.capacity = Number(capacity)

    if (available !== undefined) camperToUpdate.available = Boolean(available)

    if (seasonalPricing) {
      // In the frontend, the native browser FormData API only accepts binary files or plain text (strings), forcing us to send arrays/objects serialized with JSON.stringify(). Multer parses these fields on the backend as raw strings rather than JavaScript objects. That would break the fields of the model that are arrays or objects, like seasonalPricing.
      try {
        camperToUpdate.seasonalPricing =
          typeof seasonalPricing === 'string'
            ? JSON.parse(seasonalPricing)
            : seasonalPricing
      } catch (error) {
        return next(setError(400, 'Invalid format for seasonalPricing ⚠️'))
      }
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => file.path)

      if (camperToUpdate.images.length + newImages.length > 8)
        return next(
          setError(
            400,
            'A camper cannot have more than 8 images in total 🖼️... Try removing images to meet the limit.'
          )
        )

      camperToUpdate.images = [...camperToUpdate.images, ...newImages]
    }

    const updatedCamper = await camperToUpdate.save()

    return res.status(200).json({
      message: 'Camper updated succesfully! ✨',
      camper: updatedCamper
    })
  } catch (error) {
    return next(error)
  }
}

const deleteCamperImage = async (req, res, next) => {
  try {
    const camper = req.camper
    const { imageUrl } = req.body
    if (!imageUrl) {
      return next(setError(400, 'Image URL is required 🖼️'))
    }

    if (camper.images.length <= 1) {
      return next(
        setError(400, 'A camper must have at least one image remaining ⚠️')
      )
    }

    if (!camper.images.includes(imageUrl))
      return next(setError(400, 'Image not found in this camper 🔍'))

    if (imageUrl.includes('cloudinary')) await deleteFile(imageUrl)

    camper.images = camper.images.filter((img) => img !== imageUrl)
    await camper.save()

    return res.status(200).json({
      message: 'Image removed succesfully! 🗑️',
      images: camper.images
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  createCamper,
  getCampers,
  getCamper,
  deleteCamper,
  updateCamper,
  deleteCamperImage
}
