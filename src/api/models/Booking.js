const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    camper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Camper',
      required: true
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending'
    }
  },
  {
    timestamps: true,
    collection: 'bookings'
  }
)

const Booking = mongoose.model('Booking', bookingSchema, 'bookings')
module.exports = Booking
