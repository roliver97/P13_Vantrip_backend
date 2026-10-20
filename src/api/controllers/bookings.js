const setError = require('../../utils/setError')
const Booking = require('../models/Booking')
const Camper = require('../models/Camper')
const User = require('../models/User')

const createBooking = async (req, res, next) => {
  try {
    if (req.body.totalPrice)
      return next(
        setError(403, 'You are not authorized to modify the price! 🫷🏼')
      )

    const camper = await Camper.findById(req.body.camper)
    if (!camper) {
      return next(setError(404, 'Camper not found 🔍'))
    }
    const currentDate = new Date()
    const start = new Date(req.body.startDate)
    const end = new Date(req.body.endDate)

    if (start < currentDate)
      return next(setError(400, 'You cannot book on the past! ⏳'))
    if (end <= start)
      return next(setError(400, 'End date must be after start date! 📅'))

    // Checking existing reservations
    const conflictingBooking = await Booking.findOne({
      camper: req.body.camper,
      status: { $ne: 'cancelled' },
      startDate: { $lt: end }, // $lt === less than
      endDate: { $gt: start } // $gt === greater than
    })

    if (conflictingBooking) {
      return next(
        setError(400, 'This camper is already booked for these dates! 🚫🏕️')
      )
    }

    // Price calculation
    const bookingTime = Math.abs(end - start)
    const bookingCompleteDays = Math.ceil(bookingTime / (1000 * 60 * 60 * 24))

    const seasonalPricePerDay = camper.seasonalPricing?.seasonalPricePerDay
    const entitlementToWeeklyDiscount = bookingCompleteDays >= 7
    const discountRate = camper.weeklyDiscount / 100

    const basePrice = seasonalPricePerDay || camper.defaultPricePerDay
    const baseStayPrice = bookingCompleteDays * basePrice

    const discountAmount = entitlementToWeeklyDiscount
      ? baseStayPrice * discountRate
      : 0
    const totalPrice = baseStayPrice - discountAmount + camper.cleaningFee

    const newBooking = new Booking({
      user: req.user._id,
      camper: req.body.camper,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      totalPrice: totalPrice,
      status: 'pending'
    })

    await newBooking.save()

    return res
      .status(201)
      .json({ message: 'Booking created successfully! ✅', newBooking })
  } catch (error) {
    return next(error)
  }
}

const getBooking = async (req, res, next) => {
  try {
    const { id } = req.params
    const booking = await Booking.findById(id).populate('user camper') // In this case, 'populate(user)' only makes sense if the request is performed by an admin.

    if (!booking) return next(setError(404, 'Booking not found 🔍'))

    return res.status(200).json(booking)
  } catch (error) {
    return next(error)
  }
}

module.exports = { createBooking, getBooking }
