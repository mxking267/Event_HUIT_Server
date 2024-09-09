const express = require('express');
const eventController = require('../controllers/eventController');

const router = express.Router();

router.post('/events', eventController.createEvent);       // Tạo mới sự kiện
router.get('/events', eventController.getAllEvents);       // Lấy tất cả sự kiện
router.get('/events/:id', eventController.getEventById);   // Lấy sự kiện theo ID
router.patch('/events/:id', eventController.updateEvent);    // Cập nhật sự kiện theo ID
router.delete('/events/:id', eventController.deleteEvent); // Xóa sự kiện theo ID

module.exports = router;
