const path = require('path')
const Booking = require('../../api/models/Booking')
const parseCSV = require('../../utils/parseCSV')

const seedBookings = async (usersMap, campersMap) => {
  try {
    console.log('📅 Seeding bookings...')
    const bookingsPath = path.join(__dirname, '../../../data/bookings.csv')
    const rawBookings = parseCSV(bookingsPath)

    const bookingsToInsert = []

    for (const rawBooking of rawBookings) {
      const renterUser = usersMap.get(rawBooking.userEmail.toLowerCase().trim())
      if (!renterUser) {
        throw new Error(`Renter with email ${rawBooking.userEmail} not found`)
      }

      const bookedCamper = campersMap.get(rawBooking.camperCode)
      if (!bookedCamper) {
        throw new Error(`Camper with code ${rawBooking.camperCode} not found`)
      }

      bookingsToInsert.push({
        user: renterUser._id,
        camper: bookedCamper._id,
        startDate: new Date(rawBooking.startDate),
        endDate: new Date(rawBooking.endDate),
        totalPrice: Number(rawBooking.totalPrice),
        status: rawBooking.status || 'pending'
      })
    }

    const insertedBookings = await Booking.insertMany(bookingsToInsert)
    console.log(`✅ ${insertedBookings.length} Bookings successfully inserted`)
    return insertedBookings
  } catch (error) {
    console.error('❌ Error executing bookings seed:', error)
    throw error
  }
}

module.exports = seedBookings
