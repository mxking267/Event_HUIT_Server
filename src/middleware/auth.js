require('dotenv').config()
const jwt = require('jsonwebtoken')

const auth = (req, res, next) => {
  if (req.originalUrl === '/api/v1/') {
    next()
  }

  const white_lists = ['/', '/register', '/login', '/password/forgot', '/password/otp', '/password/reset']

  if (white_lists.find((item) => '/api/v1/auth' + item === req.originalUrl)) {
    console.log(req.originalUrl)
    next()
  } 
  else {
    if (req?.headers?.authorization?.split(' ')?.[1]) {
      const token = req.headers.authorization.split(' ')[1]

      //verify token
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = {
          email: decoded.email,
          name: decoded.name,
          createdBy: 'hoidanit'
        }
        console.log('>>> check token: ', decoded)
        next()
      } catch (error) {
        return res.status(401).json({
          error: error.message,
          message: 'Token bị hết hạn/hoặc không hợp lệ'
        })
      }
    } 
    else {
      return res.status(401).json({
        message: 'Bạn chưa truyền Access Token ở header/Hoặc token bị hết hạn'
      })
    }
  }
}

module.exports = auth
