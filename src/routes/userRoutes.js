const express = require('express')
const {
  createUser,
  forgotPassword,
  otpPassword,
  resetPassword,
  getUser,
  getManager,
  trainingPointOnSemester,
  getRegisteredEvents,
  registerUser
} = require('../controllers/userController')

const authAdmin = require('../middleware/authAdmin')

const router = express.Router()
router.get('/', authAdmin, getUser)
router.post('/', authAdmin, registerUser)
router.get('/manager', authAdmin, getManager)
router.post('/manager', authAdmin, createUser)
router.post('/password/forgot', forgotPassword)
router.post('/password/otp', otpPassword)
router.post('/password/reset', resetPassword)
router.get('/trainingPointOnSemester/:userId', trainingPointOnSemester)
router.get('/eventRegistered/:userId', getRegisteredEvents)

module.exports = router
