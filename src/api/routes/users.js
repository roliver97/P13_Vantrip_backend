const usersRouter = require('express').Router()
const {
  register,
  getUser,
  login,
  getMe,
  getUsers,
  deleteUser
} = require('../controllers/users')
const { isAuth, isAdmin, isSelfOrAdmin } = require('../../middlewares/auth')

//STATIC ROUTES
usersRouter.post('/register', register)
usersRouter.post('/login', login)
usersRouter.get('/', [isAuth, isAdmin], getUsers)
usersRouter.get('/me', [isAuth], getMe) //? To check/verify my session

//DYNAMIC ROUTES
usersRouter.get('/:id', getUser)
usersRouter.delete('/:id', [isAuth, isSelfOrAdmin], deleteUser)

module.exports = usersRouter
