const path = require('path')
const parseCSV = require('../../utils/parseCSV')
const User = require('../../api/models/User')

const seedUsers = async () => {
  try {
    console.log('👤 Seeding users...')
    const usersPath = path.join(__dirname, '../../../data/users.csv')
    const rawUsers = parseCSV(usersPath)
    console.log(`📄 Found ${rawUsers.length} users in CSV files`)

    const savedUsersMap = new Map() // Fast user lookup by email to avoid repeatedly scanning the array
    // Map().set expects a key and the value it should return (e.g., jordi.pujol@gmail.com, user (the whole Jordi Pujol user object))
    // Map().get expects the key (e.g., jordi.pujol@gmail.com) and returns its matching value (the whole Jordi Pujol user object)
    for (const rawUser of rawUsers) {
      const fullName = `${rawUser.firstName}+${rawUser.lastName}`
      const newUser = new User({
        firstName: rawUser.firstName,
        lastName: rawUser.lastName,
        email: rawUser.email.toLowerCase().trim(),
        username: rawUser.username.trim(),
        password: rawUser.password, // Mongoose will automatically hash this with pre('save')
        role: rawUser.role || 'user',
        avatar:
          rawUser.avatar ||
          `https://ui-avatars.com/api/?name=${fullName}&background=random`
      })
      const savedUser = await newUser.save()
      savedUsersMap.set(savedUser.email, savedUser)
    }
    console.log(`✅ ${savedUsersMap.size} Users successfully inserted`)
    return savedUsersMap
  } catch (error) {
    console.error('❌ Error executing users seed:', error)
    throw error
  }
}

module.exports = seedUsers
