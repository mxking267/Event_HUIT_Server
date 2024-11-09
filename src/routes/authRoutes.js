const express = require('express')
const { handleLogin, getMe } = require('../controllers/authController')

const router = express.Router()
router.post('/login', handleLogin)
router.get('/profile', getMe)

module.exports = router
