const express = require('express')
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerEvent,
  checkInCheckOut,
  getQR
} = require('../controllers/eventController')

const router = express.Router()

router.get('/', getAllEvents) // Lấy tất cả sự kiện
router.post('/create', createEvent) // Tạo mới sự kiện
router.get('/detail/:id', getEventById) // Lấy sự kiện theo ID
router.get('/qr/:id', getQR) // Lấy QR sự kiện theo ID
router.patch('/edit/:id', updateEvent) // Cập nhật sự kiện theo ID
router.delete('/delete/:id', deleteEvent) // Xóa sự kiện theo ID
router.patch('/register/:id', registerEvent) // Đăng ký sự kiện
router.patch('/check-in-out/:eventId/:studentCode', checkInCheckOut) // Check-in sự kiện

module.exports = router
