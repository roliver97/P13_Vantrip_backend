const { isAuth, isCamperOwnerOrAdmin } = require('../../middlewares/auth')
const uploadFile = require('../../middlewares/uploadFile')
const {
  createCamper,
  getCampers,
  getCamper,
  deleteCamper,
  updateCamper,
  deleteCamperImage
} = require('../controllers/campers')

const campersRouter = require('express').Router()
require('../models/Camper')

//STATIC ROUTES
campersRouter.post('/', [isAuth, uploadFile.array('images', 8)], createCamper)
campersRouter.get('/', getCampers)

//DYNAMIC ROUTES
campersRouter.get('/:id', getCamper)
campersRouter.delete('/:id', [isAuth, isCamperOwnerOrAdmin], deleteCamper)
campersRouter.put(
  '/:id',
  [isAuth, isCamperOwnerOrAdmin, uploadFile.array('images', 8)],
  updateCamper
)

campersRouter.delete(
  '/:id/images',
  [isAuth, isCamperOwnerOrAdmin],
  deleteCamperImage
)

module.exports = campersRouter
