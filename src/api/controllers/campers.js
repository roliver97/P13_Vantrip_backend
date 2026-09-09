const Camper = require('../models/Camper')
const User = require('../models/User')
const setError = require('../../utils/setError')

const createCamper = async (req, res, next) => {
  try {
    const userId = req.user._id
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
      camper: savedCamper,
      user: updatedUser
    })
  } catch (error) {
    return next(error)
  }
}

const getCampers = async (req, res, next) => {
  try {
    let queryConditions = {}

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
