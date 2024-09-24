require('dotenv').config()

const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const saltRounds = 10

const createUserService = async (
  name,
  email,
  password,
  student_code,
  studentClass
) => {
  try {
    //check user exist
    const user = await User.findOne({ email })
    console.log(user)
    if (user) {
      console.log(`>>> user exist, chọn 1 email khác: ${email}`)
      return null
    }

    //hash user password
    const hashPassword = await bcrypt.hash(password, saltRounds)
    console.log(hashPassword)
    //save user to database
    let result = await User.create({
      full_name: name,
      email: email,
      password: hashPassword,
      student_code: student_code,
      class: studentClass,
      role: 'USER'
    })
    return result
  } catch (error) {
    console.log(error)
    return null
  }
}

const loginService = async (email, password) => {
  try {
    //fetch user by email
    const user = await User.findOne({ email })
    if (user) {
      //compare password
      const isMatchPassword = await bcrypt.compare(password, user.password)
      if (!isMatchPassword) {
        return {
          EC: 2,
          EM: 'Email/Password không hợp lệ'
        }
      } else {
        //create an access token
        const payload = {
          email: user.email,
          name: user.name
        }

        const access_token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRE
        })
        return {
          EC: 0,
          access_token,
          user: {
            email: user.email,
            name: user.name
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

const getUserService = async () => {
  try {
    let result = await User.find({}).select('-password')
    return result
  } catch (error) {
    console.log(error)
    return null
  }
}
module.exports = {
  createUserService,
  loginService,
  getUserService
}
