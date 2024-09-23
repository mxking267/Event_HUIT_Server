const express = require('express')
const {
  resetPassword,
  getUser,
  getManager,
  trainingPointOnSemester,
  getRegisteredEvents,
  createUser,
  createManager,
  getUsers,
  updateManager,
  updateUser
} = require('../controllers/userController')

const authAdmin = require('../middleware/authAdmin')

const router = express.Router()
router.get('/', authAdmin, getUser)
router.post('/', authAdmin, createUser)
router.get('/manager', authAdmin, getManager)
router.post('/manager', authAdmin, createManager)
router.post('/password/reset', resetPassword)
router.patch('/:id', updateUser)
router.patch('/manager/:id', updateManager)
router.get('/trainingPointOnSemester/:userId', trainingPointOnSemester)
router.get('/eventRegistered/:userId', getRegisteredEvents)
router.get('/student', getUsers)

module.exports = router
