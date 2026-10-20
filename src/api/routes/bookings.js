const {
  isAuth,
  isBookingOwnerOrAdmin,
  isAdmin
} = require('../../middlewares/auth')
const {
  createBooking,
  getBooking,
  getBookings,
  cancelBooking
} = require('../controllers/bookings')

const bookingsRouter = require('express').Router()
require('../models/Booking')

//STATIC ROUTES
bookingsRouter.post('/', [isAuth], createBooking)
bookingsRouter.get('/', [isAuth, isAdmin], getBookings)

//DYNAMIC ROUTES
bookingsRouter.get('/:id', [isAuth, isBookingOwnerOrAdmin], getBooking)
bookingsRouter.patch('/:id', [isAuth, isBookingOwnerOrAdmin], cancelBooking)

module.exports = bookingsRouter
