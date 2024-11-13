const express = require('express')
const {
  checkInCheckOut
} = require('../../controllers/admin/eventController')

const router = express.Router()
router.patch('/check-in-out/:eventId', checkInCheckOut) // Check-in-out sự kiện

module.exports = router
