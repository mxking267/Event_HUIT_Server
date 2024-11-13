const express = require('express')
const {
  registeredEvents,
  trainingPointOnSemester
} = require('../../controllers/client/userController')

const router = express.Router()
router.get('/registeredEvents/:userId', registeredEvents)

router.get('/trainingPointOnSemester/:userId', trainingPointOnSemester)

module.exports = router
