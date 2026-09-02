const { generateToken } = require('../../config/jwt')
const setError = require('../../utils/setError')
const User = require('../models/User')
const bcrypt = require('bcrypt')

const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, username, password } = req.body
    const formattedEmail = email.toLowerCase().trim()
    const formattedUsername = username.trim()
    const userExists = await User.findOne({
      $or: [{ email: formattedEmail }, { username: formattedUsername }]
    })
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
      email: formattedEmail,
      username: formattedUsername,
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

const getUser = async (req, res, next) => {
  const { id } = req.params

  try {
    const user = await User.findById(id).populate('favorites postedCampers')
    if (!user) {
      return next(setError(404, 'User not found 🔍'))
    }
    return res.status(200).json(user)
  } catch (error) {
    return next(error)
  }
}

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find()
    return res.status(200).json(users)
  } catch (error) {
    return next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const formattedEmail = email.toLowerCase().trim()

    const user = await User.findOne({ email: formattedEmail }).select(
      '+password'
    ) //? The User model has select:false by default, so we need to import it manually
    if (!user) {
      return next(setError(400, 'Email or password are not correct ❌'))
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return next(setError(400, 'Email or password are not correct ❌'))
    }

    const token = generateToken(user._id)

    const userResponse = user.toObject()
    delete userResponse.password
    return res.status(200).json({
      message: `Welcome back, ${userResponse.firstName}!`,
      token,
      user: userResponse
    })
  } catch (error) {
    return next(error)
  }
}

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)

    if (!user) {
      return next(setError(404, 'User not found🔍'))
    }
    return res.status(200).json(user)
  } catch (error) {
    return next(error)
  }
}
//? Frontend: Check if the token exists and has not expired. Then switch to backend.
//? Backend: Use the `/users/me` endpoint when `App.jsx` starts to verify the user's identity and return the active profile.

module.exports = { register, getUser, getUsers, login, getMe }
