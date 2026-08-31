const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      required: true,
      default: 'user',
      enum: ['admin', 'user']
    },
    avatar: {
      type: String,
      default:
        'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Camper'
      }
    ],
    postedCampers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Camper'
      }
    ]
  },
  { timestamps: true, collection: 'users' }
)

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return

  this.password = await bcrypt.hash(this.password, 10)
})

const User = mongoose.model('User', userSchema, 'users')

module.exports = User
