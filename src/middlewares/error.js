//! GLOBAL ERROR MANAGER

const errorHandler = (err, req, res, next) => {
  //? Errors are now handled with `next(setError(...))` within each controller. However, for unexpected errors that we haven't handled, we use the default status code 500.
  console.error('🔥 Server Error:', err.message) // For devs, with all the information

  // Native errors lack a status, so we explicitly default them to 500.
  // To prevent data leaks, we send a generic message on 500s; in contrast, our custom errors (e.g., 401, 409) are safe to expose to the frontend.
  let statusCode = err.status || 500
  let message = err.message || 'Internal server error'

  if (err.name === 'ValidationError') {
    // for Mongoose Schema Validation Errors (e.g., regex constraints for passwords, required fields)
    statusCode = 400
    message = Object.values(err.errors)[0].message
  }

  if (err.code === 11000) {
    // for MongoDB Duplicate Key Error (unique: true) (e.g. emails)
    statusCode = 409
    const duplicateField = Object.keys(err.keyValue)[0] // e.g. MongoDB returns something like err.keyValue = { email: "jordi@test.com" } or err.keyValue = { username: "jordi_99" }
    message = `This ${duplicateField} is already registered ⚠️`
  }

  if (statusCode === 500) {
    message = 'Internal server error'
  }

  return res.status(statusCode).json({ status: statusCode, message })
}

module.exports = errorHandler
