const express = require('express')
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  listParticipant,
  changeMultiEventsStatus,
  deleteMultiParticipants,
  statisticalEvent, 
  exportExcel
} = require('../../controllers/admin/eventController')

const router = express.Router()

router.post('/create', createEvent) // Tạo mới sự kiện
router.get('/', getAllEvents) // Lấy tất cả sự kiện
router.get('/detail/:id', getEventById) // Lấy sự kiện theo ID
router.patch('/edit/:id', updateEvent) // Cập nhật sự kiện theo ID
router.delete('/delete/:id', deleteEvent) // Xóa sự kiện theo ID
router.get('/listParticipant/:eventId', listParticipant)
router.patch('/update-status-multi', changeMultiEventsStatus)
router.patch('/delete-multi-participants/:eventId', deleteMultiParticipants)
router.get('/statisticalEvent/:eventId', statisticalEvent)
router.get('/exportExcel/:eventId/:facultyId', exportExcel)

module.exports = router
