require('dotenv').config()
const jwt = require('jsonwebtoken')

const auth = (req, res, next) => {
  const white_lists = [
    '/auth/register',
    '/auth/login',
    '/auth/password/forgot',
    '/auth/password/otp',
    '/auth/password/reset'
  ]
  if (white_lists.find((item) => '/api/v1' + item === req.originalUrl)) {
    next()
  } else {
    if (req?.headers?.authorization?.split(' ')?.[1]) {
      const token = req.headers.authorization.split(' ')[1]

      //verify token
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = {
          _id: decoded._id,
          email: decoded.email,
          full_name: decoded.full_name,
          role: decoded.role
        }
        next()
      } catch (error) {
        return res.status(401).json({
          error: error.message,
          message: 'Token bị hết hạn/hoặc không hợp lệ'
        })
      }
    } else {
      return res.status(401).json({
        message: 'Bạn chưa truyền Access Token ở header/Hoặc token bị hết hạn'
      })
    }
  }
}

module.exports = auth
