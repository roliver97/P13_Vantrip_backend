const usersRouter = require('express').Router()
const { register, getUser, login } = require('../controllers/users')

//STATIC ROUTES
usersRouter.post('/register', register)
usersRouter.post('/login', login)

//DYNAMIC ROUTES
usersRouter.get('/:id', getUser)

module.exports = usersRouter
