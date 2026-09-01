const usersRouter = require('express').Router()
const { register, getUser } = require('../controllers/users')

//STATIC ROUTES
usersRouter.post('/register', register)

//DYNAMIC ROUTES
usersRouter.get('/:id', getUser)

module.exports = usersRouter
