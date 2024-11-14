const express = require('express')
const facultyController = require('../controllers/facultyController')
const authAdmin = require('../middleware/authAdmin')
const router = express.Router()
router.post('/', authAdmin, facultyController.createFaculty) // Tạo mới địa điểm
router.get('/', authAdmin, facultyController.getAllFaculties) // Lấy tất cả địa điểm
router.get('/:id', authAdmin, facultyController.getFacultyById) // Lấy địa điểm theo ID
router.put('/:id', authAdmin, facultyController.updateFaculty) // Cập nhật địa điểm theo ID
router.delete('/:id', authAdmin, facultyController.deleteFaculty) // Xóa địa điểm theo ID
module.exports = router
