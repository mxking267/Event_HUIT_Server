const express = require('express')
const locationController = require('../controllers/locationController')

const router = express.Router()

router.post('/', locationController.createLocation) // Tạo mới địa điểm
router.get('/', locationController.getAllLocations) // Lấy tất cả địa điểm
router.get('/:id', locationController.getLocationById) // Lấy địa điểm theo ID
router.put('/:id', locationController.updateLocation) // Cập nhật địa điểm theo ID
router.delete('/:id', locationController.deleteLocation) // Xóa địa điểm theo ID

module.exports = router
