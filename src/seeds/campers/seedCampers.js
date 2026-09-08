const path = require('path')
const parseCSV = require('../../utils/parseCSV')
const Camper = require('../../api/models/Camper')

const seedCampers = async (usersMap) => {
  try {
    console.log('🚐 Seeding campers...')
    const campersPath = path.join(__dirname, '../../../data/campers.csv')
    const rawCampers = parseCSV(campersPath)
    console.log(`📄 Found ${rawCampers.length} campers in CSV files`)

    const savedCampersMap = new Map()
    for (const rawCamper of rawCampers) {
      // Using 'for...of' instead of 'forEach' to properly handle sequential asynchronous operations with 'await'
      const ownerUser = usersMap.get(rawCamper.ownerEmail.toLowerCase().trim())
      if (!ownerUser) {
        throw new Error(
          `Owner with email ${rawCamper.ownerEmail} not found for camper ${rawCamper.camperCode}`
        )
      }

      const imagesArray = rawCamper.images
        ? rawCamper.images
            .split(';')
            .map((img) => img.trim())
            .filter(Boolean) // Only keep actual images, filtering out empty fields (falsy values)
        : []

      const newCamper = new Camper({
        title: rawCamper.title,
        brand: rawCamper.brand,
        modelName: rawCamper.modelName,
        owner: ownerUser._id,
        pricePerDay: Number(rawCamper.pricePerDay),
        cleaningFee: Number(rawCamper.cleaningFee) || 30,
        weeklyDiscount: Number(rawCamper.weeklyDiscount) || 10,
        capacity: Number(rawCamper.capacity),
        description: rawCamper.description || '',
        images: imagesArray,
        location: rawCamper.location,
        available: rawCamper.available
          ? rawCamper.available.toUpperCase() === 'TRUE'
          : true
      })

      const savedCamper = await newCamper.save()
      savedCampersMap.set(rawCamper.camperCode, savedCamper)

      ownerUser.postedCampers.push(savedCamper._id) // 'ownerUser' retrieved from Map() is an object reference, not a copy. So modifying it directly updates the original Mongoose document before saving
      await ownerUser.save()
    }
    console.log(`✅ ${savedCampersMap.size} Campers successfully inserted`)
    return savedCampersMap
  } catch (error) {
    console.error('❌ Error executing campers seed:', error)
    throw error
  }
}

module.exports = seedCampers
