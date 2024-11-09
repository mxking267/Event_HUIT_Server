const express = require('express')
const locationRoutes = require('./locationRoutes')
const authRoutes = require('./authRoutes')
const eventRoutes = require('./eventRoutes')

const router = express.Router()

router.use('/locations', locationRoutes)
router.use('/auth', authRoutes)
router.use('/events', eventRoutes)
module.exports = router
