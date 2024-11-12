const express = require('express')
const {
    registeredEvents
} = require('../../controllers/client/userController')

const router = express.Router()
router.get('/registeredEvents/:userId', registeredEvents) 

module.exports = router
