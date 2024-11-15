const User = require('../models/userModel')
const jwt = require('jsonwebtoken')

const authAdminManager = async (req, res, next) => {
  try {
    const token = req?.headers?.authorization?.split(' ')?.[1]
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      req.user = {
        email: decoded.email
      }
      console.log('>>> check token: ', decoded.email)
      const manager = await User.findOne({
        email: decoded.email,
        role: { $in: ['MANAGER', 'ADMIN'] }
      })

      if (!manager) {
        return res.status(401).json({
          message: 'Do not have manager or admin rights!'
        })
      }
      next()
    } catch (error) {
      return res.status(401).json({
        error: error.message,
        message: 'Token bị hết hạn/hoặc không hợp lệ'
      })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = authAdminManager
