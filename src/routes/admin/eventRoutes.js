const express = require('express')
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent
} = require('../../controllers/admin/eventController')

const router = express.Router()

router.post('/create', createEvent) // Tạo mới sự kiện
router.get('/', getAllEvents) // Lấy tất cả sự kiện
router.get('/detail/:id', getEventById) // Lấy sự kiện theo ID
router.patch('/edit/:id', updateEvent) // Cập nhật sự kiện theo ID
router.delete('/delete/:id', deleteEvent) // Xóa sự kiện theo ID

module.exports = router
