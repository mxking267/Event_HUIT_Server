const express = require('express')
const facultyController = require('../controllers/facultyController')
const router = express.Router()
router.post('/', facultyController.createFaculty) // Tạo mới địa điểm
router.get('/', facultyController.getAllFaculties) // Lấy tất cả địa điểm
router.get('/:id', facultyController.getFacultyById) // Lấy địa điểm theo ID
router.put('/:id', facultyController.updateFaculty) // Cập nhật địa điểm theo ID
router.delete('/:id', facultyController.deleteFaculty) // Xóa địa điểm theo ID
module.exports = router
