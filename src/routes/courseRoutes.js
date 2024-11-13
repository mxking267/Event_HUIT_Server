const express = require('express')
const courseController = require('../controllers/courseController')
const router = express.Router()
router.post('/create', courseController.createCourse) // Tạo mới địa điểm
router.get('/', courseController.getAllCourses) // Lấy tất cả địa điểm
router.get('/:id', courseController.getCourseById) // Lấy địa điểm theo ID
router.put('/:id', courseController.updateCourse) // Cập nhật địa điểm theo ID
router.delete('/:id', courseController.deleteCourse) // Xóa địa điểm theo ID
module.exports = router
