const { loginService } = require('../services/authService')

const handleLogin = async (req, res) => {
  const { email, password } = req.body
  const data = await loginService(email, password)

  return res.status(200).json(data)
}

const getMe = async (req, res) => {
  const user = req.user
  res.status(200).json({ user })
}

module.exports = {
  handleLogin,
  getMe
}
