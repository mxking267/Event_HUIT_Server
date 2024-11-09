const express = require('express')
const locationRoutes = require('./locationRoutes')
const authRoutes = require('./authRoutes')
const eventRoutes = require('./eventRoutes')
const userRoutes = require('./userRoutes')

const router = express.Router()

router.use('/location', locationRoutes)
router.use('/auth', authRoutes)
router.use('/event', eventRoutes)
router.use('/user', userRoutes)
module.exports = router
