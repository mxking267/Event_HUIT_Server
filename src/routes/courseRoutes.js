const express = require('express')
const courseController = require('../controllers/courseController')
const authAdmin = require('../middleware/authAdmin')
const router = express.Router()
router.post('/', authAdmin, courseController.createCourse) // Tạo mới địa điểm
router.get('/', authAdmin, courseController.getAllCourses) // Lấy tất cả địa điểm
router.put('/:id', authAdmin, courseController.updateCourse) // Cập nhật địa điểm theo ID
router.delete('/:id', authAdmin, courseController.deleteCourse) // Xóa địa điểm theo ID
router.get('/all', authAdmin, courseController.getAllCourses) // Xóa địa điểm theo ID
module.exports = router
