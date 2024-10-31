const express = require('express')
const {
  getAllEvents,
  getEventById,
  registerEvent,
  checkInCheckOut
} = require('../../controllers/client/eventController')

const router = express.Router()


router.get('/events', getAllEvents) // Lấy tất cả sự kiện
router.get('/events/:id', getEventById) // Lấy sự kiện theo ID
router.patch('/user/register/:id', registerEvent) // Đăng ký sự kiện
router.patch('/events/:eventId/user/:studentCode', checkInCheckOut) // Check-in sự kiện

module.exports = router
