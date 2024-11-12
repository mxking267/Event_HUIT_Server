const express = require('express')
const facultyController = require('../../controllers/admin/facultyController')

const router = express.Router()

router.post('/create', facultyController.createFaculty) // Tạo mới địa điểm
router.get('/', facultyController.getAllFacultys) // Lấy tất cả địa điểm
router.get('/detail/:id', facultyController.getFacultyById) // Lấy địa điểm theo ID
router.put('/edit/:id', facultyController.updateFaculty) // Cập nhật địa điểm theo ID
router.delete('/delete/:id', facultyController.deleteFaculty) // Xóa địa điểm theo ID

module.exports = router
