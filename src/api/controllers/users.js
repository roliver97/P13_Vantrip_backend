const { generateToken } = require('../../config/jwt')
const setError = require('../../utils/setError')
const Camper = require('../models/Camper')
const User = require('../models/User')
const bcrypt = require('bcrypt')

const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, username, password } = req.body
    const formattedEmail = email?.toLowerCase().trim()
    const formattedUsername = username?.trim()
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
    //Model schema validators trigger here. If the password or any field fails schema constraints, Mongoose throws a ValidationError, forwarded to the global error middleware via catch(error).
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

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params
    const deletedUser = await User.findByIdAndDelete(id)

    if (!deletedUser) {
      return next(setError(404, 'User not found 🔍'))
    }

    return res.status(200).json({
      message: `${deletedUser.username} was successfully deleted from Database! 🗑️`
    })
  } catch (error) {
    return next(error)
  }
}

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params

    if (req.body.password) {
      return next(
        setError(400, 'The password must be updated via the specified path🫷🏼')
      )
    }

    const userToUpdate = await User.findById(id)
    if (!userToUpdate) {
      return next(setError(404, 'User not found 🔍'))
    }

    const itsMe = req.user._id.toString() === id

    if (!itsMe && req.body.email) {
      return next(
        setError(403, 'The email field can only be changed by the user.🙅🏼‍♂️')
      )
    }

    const { firstName, lastName, email, username, role } = req.body

    if (firstName) userToUpdate.firstName = firstName.trim()
    if (lastName) userToUpdate.lastName = lastName.trim()
    if (username) userToUpdate.username = username.trim()
    if (email) userToUpdate.email = email.toLowerCase().trim()

    if (role) {
      if (req.user.role === 'admin') {
        userToUpdate.role = role
      } else {
        return next(
          setError(403, 'You do not have permission to change the role.🙅🏼‍♂️')
        )
      }
    }

    const userUpdated = await userToUpdate.save() //

    const userResponse = userUpdated.toObject()
    delete userResponse.password

    return res.status(200).json({
      message: 'Profile updated successfully! ✨',
      user: userResponse
    })
  } catch (error) {
    return next(error)
  }
}

const updatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body

    if (!oldPassword || !newPassword) {
      return next(
        setError(400, 'Please provide both current and new password ⚠️')
      )
    }

    if (oldPassword === newPassword) {
      return next(
        setError(400, 'The new password must be different from the old one 🫷🏼')
      )
    }

    const currentUser = await User.findById(req.user._id).select('+password')

    if (!currentUser) {
      //safety net for deleted users who still have a valid token
      return next(setError(404, 'User Not Found 🔍'))
    }

    const isMatch = await bcrypt.compare(oldPassword, currentUser.password)
    if (!isMatch) {
      return next(setError(400, 'The current password is not correct ❌'))
    }

    currentUser.password = newPassword
    await currentUser.save()
    // The model schema validator will trigger here. If newPassword fails the regex standards, Mongoose will throw a ValidationError, caught by catch(error) and handled by the global error middleware.

    return res
      .status(200)
      .json({ message: 'Password updated succesfully 🔐✅' })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  register,
  getUser,
  getUsers,
  login,
  getMe,
  deleteUser,
  updateUser,
  updatePassword
}
