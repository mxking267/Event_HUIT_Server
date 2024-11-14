const express = require('express')
const {
  createUser,
  forgotPassword,
  otpPassword,
  resetPassword,
  getUser,
  getManager,
  trainingPointOnSemester,
  getRegisteredEvents
} = require('../controllers/userController')

const router = express.Router()
router.get('/', getUser)
router.get('/manager', getManager)
router.post('/register', createUser)
router.post('/password/forgot', forgotPassword)
router.post('/password/otp', otpPassword)
router.post('/password/reset', resetPassword)
router.get('/trainingPointOnSemester/:userId', trainingPointOnSemester)
router.get('/eventRegistered/:userId', getRegisteredEvents)

module.exports = router
