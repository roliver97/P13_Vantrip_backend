const User = require('../api/models/User')
const { verifyToken } = require('../config/jwt')
const setError = require('../utils/setError')

const isAuth = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization

    if (!authorization) {
      return next(setError(401, 'You are not authorized ❌'))
    }
    const token = authorization.split(' ')[1]
    const { user_id } = verifyToken(token)
    const user = await User.findById(user_id)

    if (!user) {
      return next(setError(404, 'This user is not found in the DB 🚮'))
    }

    req.user = user
    next()
  } catch (error) {
    return next(error)
  }
}
