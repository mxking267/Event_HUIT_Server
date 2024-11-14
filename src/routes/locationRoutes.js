const express = require('express')
const locationController = require('../controllers/locationController')
const authAdmin = require('../middleware/authAdmin')
const router = express.Router()

router.post('/', authAdmin, locationController.createLocation) // Tạo mới địa điểm
router.get('/', authAdmin, locationController.getAllLocations) // Lấy tất cả địa điểm
router.get('/:id', authAdmin, locationController.getLocationById) // Lấy địa điểm theo ID
router.put('/:id', authAdmin, locationController.updateLocation) // Cập nhật địa điểm theo ID
router.delete('/:id', authAdmin, locationController.deleteLocation) // Xóa địa điểm theo ID

module.exports = router
