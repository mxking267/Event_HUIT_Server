const express = require('express')
const {
  createUser,
  handleLogin, 
  forgotPassword,
  otpPassword,
  resetPassword
} = require('../../controllers/client/userController')

const router = express.Router()
router.post('/register', createUser)
router.post('/login', handleLogin)

router.post("/password/forgot", forgotPassword);

router.post("/password/otp", otpPassword);

router.post("/password/reset", resetPassword);

module.exports = router
