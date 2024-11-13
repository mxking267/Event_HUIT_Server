const express = require('express')
const feedbackController = require('../../controllers/client/feedbackController')

const router = express.Router()

router.post('/create', feedbackController.createFeedback) // Tạo mới địa điểm
router.get('/', feedbackController.getAllFeedbacks) // Lấy tất cả địa điểm
router.get('/detail/:id', feedbackController.getFeedbackById) // Lấy địa điểm theo ID
router.put('/edit/:id', feedbackController.updateFeedback) // Cập nhật địa điểm theo ID
router.delete('/delete/:id', feedbackController.deleteFeedback) // Xóa địa điểm theo ID

module.exports = router
