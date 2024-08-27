const express = require('express');
const locationController = require('../controllers/locationController');

const router = express.Router();

router.post('/locations', locationController.createLocation);       // Tạo mới địa điểm
router.get('/locations', locationController.getAllLocations);       // Lấy tất cả địa điểm
router.get('/locations/:id', locationController.getLocationById);   // Lấy địa điểm theo ID
router.put('/locations/:id', locationController.updateLocation);    // Cập nhật địa điểm theo ID
router.delete('/locations/:id', locationController.deleteLocation); // Xóa địa điểm theo ID

module.exports = router;
