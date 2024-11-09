const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/userModel')

const loginService = async (email, password) => {
  try {
    const user = await User.findOne({ email })
    if (user) {
      const isMatchPassword = await bcrypt.compare(password, user.password)
      if (!isMatchPassword) {
        return {
          EC: 2,
          EM: 'Email/Password không hợp lệ'
        }
      } else {
        const payload = {
          _id: user._id,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        }

        const access_token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRE
        })
        return {
          EC: 0,
          access_token,
          user: {
            _id: user._id,
            email: user.email,
            full_name: user.full_name,
            role: user.role
          }
        }
      }
    } else {
      return {
        EC: 1,
        EM: 'Email/Password không hợp lệ'
      }
    }
  } catch (error) {
    console.log(error)
    return null
  }
}

module.exports = {
  loginService
}
