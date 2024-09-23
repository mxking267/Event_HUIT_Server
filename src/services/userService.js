require('dotenv').config()

const User = require('../models/userModel')
const bcrypt = require('bcrypt')

const saltRounds = 10

const createUserService = async (
  email,
  password,
  student_code,
  class_name,
  full_name,
  role,
  faculty_id,
  course_id
) => {
  try {
    const user = await User.findOne({ email })
    if (user) {
      console.log(`>>> user exist, chọn 1 email khác: ${email}`)
      return null
    }

    const hashPassword = await bcrypt.hash(password, saltRounds)
    let result
    if (role === 'USER') {
      result = await User.create({
        email,
        password: hashPassword,
        student_code,
        class_name,
        full_name,
        role: 'USER',
        faculty_id,
        course_id
      })
    } else {
      result = await User.create({
        full_name,
        email,
        password: hashPassword,
        role: 'MANAGER'
      })
    }
    return result
  } catch (error) {
    console.log(error)
    return null
  }
}

const createManagerService = async (email, password, full_name) => {
  try {
    const user = await User.findOne({ email })
    if (user) {
      console.log(`>>> user exist, chọn 1 email khác: ${email}`)
      return null
    }

    const hashPassword = await bcrypt.hash(password, saltRounds)
    const result = await User.create({
      email,
      password: hashPassword,
      full_name,
      role: 'MANAGER'
    })
    return result
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
  getUserService,
  createManagerService
}
