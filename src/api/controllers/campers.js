const Camper = require('../models/Camper')
const User = require('../models/User')
const setError = require('../../utils/setError')
const Booking = require('../models/Booking')

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

    return res.status(201).json({
      message: 'New camper created and added to your profile! 🎉',
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

module.exports = { createCamper, getCampers }
