const express = require('express')
const locationRoutes = require('./locationRoutes')
const authRoutes = require('./authRoutes')
const eventRoutes = require('./eventRoutes')
const userRoutes = require('./userRoutes')
const facultyRoute = require('./facultyRoutes')
const courseRoute = require('./courseRoutes')

const router = express.Router()

router.use('/location', locationRoutes)
router.use('/auth', authRoutes)
router.use('/event', eventRoutes)
router.use('/user', userRoutes)
router.use('/faculty', facultyRoute)
router.use('/course', courseRoute)
module.exports = router
