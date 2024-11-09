const express = require('express')
const {
  createUser,
  forgotPassword,
  otpPassword,
  resetPassword,
  getUser
} = require('../controllers/userController')

const router = express.Router()
router.get('/', getUser)
router.post('/register', createUser)
router.post('/password/forgot', forgotPassword)
router.post('/password/otp', otpPassword)
router.post('/password/reset', resetPassword)

module.exports = router
