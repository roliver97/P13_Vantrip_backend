const { isAuth, isBookingOwnerOrAdmin } = require('../../middlewares/auth')
const { createBooking, getBooking } = require('../controllers/bookings')

const bookingsRouter = require('express').Router()
require('../models/Booking')

//STATIC ROUTES
bookingsRouter.post('/', [isAuth], createBooking)

//DYNAMIC ROUTES
bookingsRouter.get('/:id', [isAuth, isBookingOwnerOrAdmin], getBooking)
/* bookingsRouter.delete('/:id', [isAuth, isBookingOwnerOrAdmin]) */

module.exports = bookingsRouter
