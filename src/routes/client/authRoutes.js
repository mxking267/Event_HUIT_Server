const express = require('express')
const {
  createUser,
  handleLogin,
} = require('../../controllers/client/userController')

const router = express.Router()
router.post('/register', createUser)
router.post('/login', handleLogin)

module.exports = router
