require('dotenv').config()
const { connectDB, disconnectDB } = require('../config/db')

const User = require('../api/models/User')
const Camper = require('../api/models/Camper')
const Booking = require('../api/models/Booking')

const seedUsers = require('./users/seedUsers')
const seedCampers = require('./campers/seedCampers')
const seedBookings = require('./bookings/seedBookings')

const cleanCollections = async () => {
  try {
    console.log('🧹 Clearing existing collections...')
    await Booking.deleteMany()
    await Camper.deleteMany()
    await User.deleteMany()
    console.log('✨ Collections cleaned successfully')
  } catch (error) {
    console.error('❌ Error cleaning collections:', error)
    throw error
  }
}

const runSeed = async () => {
  try {
    console.log('🔄 Connecting to Database for seeding...')
    await connectDB()

    await cleanCollections()

    const usersMap = await seedUsers()
    const campersMap = await seedCampers(usersMap)
    await seedBookings(usersMap, campersMap)

    console.log('\n🎉 ALL DATA SEEDED SUCCESSFULLY!\n')
  } catch (error) {
    console.error('❌❌❌ Error executing global seed:', error)
    await disconnectDB()
    process.exit(1) // 👈 (1) === Exit with failure / error
  } finally {
    await disconnectDB()
    process.exit(0) // 👈 (0) === Clean / successful exit
    // NOTE: process.exit() immediately terminates the Node.js runtime.
    // It is ideal for one-off CLI scripts (seeds/migrations), but never use it in production web servers (Express) as it would crash the entire app.
  }
}

runSeed()
