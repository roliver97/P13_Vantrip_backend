const usersRouter = require('express').Router()
const uploadFile = require('../../middlewares/uploadFile')
const {
  register,
  getUser,
  login,
  getMe,
  getUsers,
  deleteUser,
  updateUser,
  updatePassword,
  changeRole
} = require('../controllers/users')
const { isAuth, isAdmin, isSelfOrAdmin } = require('../../middlewares/auth')

//STATIC ROUTES
usersRouter.post('/register', uploadFile.single('avatar'), register) //? `.single('avatar')` tells Multer to accept exactly one file from the 'avatar' field in multipart/form-data and exposes it as `req.file`.
usersRouter.post('/login', login)
usersRouter.get('/', [isAuth, isAdmin], getUsers)
usersRouter.get('/me', [isAuth], getMe) //? To check/verify my session
usersRouter.patch('/update-password', [isAuth], updatePassword)

//DYNAMIC ROUTES
usersRouter.get('/:id', getUser)
usersRouter.delete('/:id', [isAuth, isSelfOrAdmin], deleteUser)
usersRouter.put(
  '/:id',
  [isAuth, isSelfOrAdmin],
  uploadFile.single('avatar'),
  updateUser
)
usersRouter.patch('/:id/role', [isAuth, isAdmin], changeRole)

module.exports = usersRouter
