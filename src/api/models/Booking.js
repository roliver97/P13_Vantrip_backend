const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema(
  {
    camper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Camper',
      required: true
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },

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
