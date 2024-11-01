const express = require('express')
const {
  index,
  getAllEvents,
  getEventById,
  registerEvent,
  checkInCheckOut
} = require('../../controllers/client/eventController')

const router = express.Router()

router.get('/', index) // trang chính
router.get('/getAll', getAllEvents) // Lấy tất cả sự kiện
router.get('/detail/:id', getEventById) // Lấy sự kiện theo ID
router.patch('/register/:id', registerEvent) // Đăng ký sự kiện
router.patch('/check-in-out/:eventId/:studentCode', checkInCheckOut) // Check-in sự kiện

module.exports = router
