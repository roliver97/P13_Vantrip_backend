const { isAuth } = require('../../middlewares/auth')
const uploadFile = require('../../middlewares/uploadFile')
const { createCamper, getCampers } = require('../controllers/campers')

const campersRouter = require('express').Router()
require('../models/Camper')

campersRouter.post('/', [isAuth, uploadFile.array('images', 5)], createCamper)
campersRouter.get('/', getCampers)

module.exports = campersRouter
