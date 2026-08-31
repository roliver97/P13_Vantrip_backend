const { generateToken } = require('../../config/jwt')
const setError = require('../../utils/setError')
const User = require('../models/User')

const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, username, password } = req.body
    const userExists = await User.findOne({ $or: [{ email }, { username }] })
    if (userExists) {
      return next(setError(409, 'This email or username is already in use ⚠️'))
    }

    const fullName = `${firstName} ${lastName}`
    const avatar = req.file
      ? req.file.path
      : `https://ui-avatars.com/api/?name=${fullName.replace(/ /g, '+')}&background=random`

    const newUser = new User({
      firstName,
      lastName,
      email,
      username,
      password,
      avatar
    })

    const userSaved = await newUser.save()
    const token = generateToken(userSaved._id)
    const userResponse = userSaved.toObject()
    delete userResponse.password
    return res.status(201).json({
      message: 'User registered successfully! 🎉',
      token: token,
      user: userResponse
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = { register }
