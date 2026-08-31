const usersRouter = require('express').Router()
const { register } = require('../controllers/users')

usersRouter.post('/register', register)

module.exports = usersRouter
