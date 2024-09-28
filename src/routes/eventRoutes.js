const express = require('express')
const { createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    registerEvent,
    checkInEvent } = require('../controllers/eventController')

const router = express.Router()

router.post('/events', createEvent) // Tạo mới sự kiện
router.get('/events', getAllEvents) // Lấy tất cả sự kiện
router.get('/events/:id', getEventById) // Lấy sự kiện theo ID
router.patch('/events/:id', updateEvent) // Cập nhật sự kiện theo ID
router.delete('/events/:id', deleteEvent) // Xóa sự kiện theo ID
router.patch('/user/register/:id', registerEvent) // Đăng ký sự kiện
router.patch('/events/:eventId/user/:studentCode', checkInEvent) // Check-in sự kiện

module.exports = router
