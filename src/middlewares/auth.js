const Booking = require('../api/models/Booking')
const Camper = require('../api/models/Camper')
const User = require('../api/models/User')
const { verifyToken } = require('../config/jwt')
const setError = require('../utils/setError')

const isAuth = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization

    if (!authorization) {
      return next(setError(401, 'You are not authorized ❌'))
    }
    const token = authorization.split(' ')[1]
    const { user_id } = verifyToken(token)
    const user = await User.findById(user_id)

    if (!user) {
      return next(setError(404, 'This user is not found in the DB 🚮'))
    }

    req.user = user
    next()
  } catch (error) {
    return next(error)
  }
}

const isAdmin = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      return next()
    }
    return next(setError(403, 'Forbidden: Admin access required ⛔'))
  } catch (error) {
    return next(error)
  }
}

const isSelfOrAdmin = async (req, res, next) => {
  try {
    const { id } = req.params

    if (req.user.role === 'admin' || req.user._id.toString() === id) {
      return next()
    }

    return next(
      setError(
        403,
        'Forbidden: You cannot modify other users unless you are an admin.⛔'
      )
    )
  } catch (error) {
    return next(error)
  }
}

const isCamperOwnerOrAdmin = async (req, res, next) => {
  try {
    const { id } = req.params
    const camper = await Camper.findById(id)

    if (!camper) return next(setError(404, 'Camper not found 🔍'))

    const isOwner = camper.owner.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'admin'

    if (!isAdmin && !isOwner)
      return next(
        setError(
          403,
          '⛔Forbidden: You can only modify your own campers unless you are an admin.'
        )
      )

    req.camper = camper
    return next()
  } catch (error) {
    return next(error)
  }
}

const isBookingOwnerOrAdmin = async (req, res, next) => {
  try {
    const { id } = req.params
    const booking = await Booking.findById(id)

    if (!booking) return next(setError(404, 'Booking not found 🔍'))

    const isOwner = booking.user.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'admin'

    if (!isAdmin && !isOwner)
      return next(
        setError(
          403,
          '⛔Forbidden: You can only modify your own bookings unless you are an admin.'
        )
      )

    req.booking = booking
    return next()
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  isAuth,
  isAdmin,
  isSelfOrAdmin,
  isCamperOwnerOrAdmin,
  isBookingOwnerOrAdmin
}
