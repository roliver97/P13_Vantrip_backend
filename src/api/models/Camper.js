const mongoose = require('mongoose')

const camperSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    modelName: { type: String, required: true, trim: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    pricePerDay: { type: Number, required: true, min: 0 }, // Ex: 95€
    cleaningFee: { type: Number, default: 30, min: 0 },
    weeklyDiscount: { type: Number, default: 10, min: 0, max: 100 },
    seasonalPricing: [
      {
        seasonName: { type: String }, // Ex: Summer / August ...
        startDate: { type: Date },
        endDate: { type: Date },
        pricePerDay: { type: Number } // Ex: 130€ instead of 95€
      }
    ],
    capacity: { type: Number, required: true, min: 1 },
    description: { type: String, default: '' },
    images: {
      type: [String],
      required: [true, 'Images are required'],
      validate: {
        validator: function (arr) {
          return Array.isArray(arr) && arr.length > 0
        },
        message: 'At least one camper image is required'
      }
    },
    location: { type: String, required: true },
    available: { type: Boolean, default: true }
  },
  { timestamps: true, collection: 'campers' }
)

const Camper = mongoose.model('Camper', camperSchema, 'campers')
module.exports = Camper
