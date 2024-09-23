const express = require('express')
const locationController = require('../../controllers/admin/locationController')

const router = express.Router()

router.post('/create', locationController.createLocation) // Tạo mới địa điểm
router.get('/', locationController.getAllLocations) // Lấy tất cả địa điểm
router.get('/detail/:id', locationController.getLocationById) // Lấy địa điểm theo ID
router.put('/edit/:id', locationController.updateLocation) // Cập nhật địa điểm theo ID
router.delete('/delete/:id', locationController.deleteLocation) // Xóa địa điểm theo ID

module.exports = router
