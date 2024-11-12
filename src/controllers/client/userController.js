const {
  createUserService,
  loginService,
  getUserService
} = require('../../services/userService')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const User = require('../../models/userModel')
const ForgotPassword = require('../../models/forgot-passwordModel')
const { Event } = require('../../models/eventModel')

const generateHelper = require('../../helpers/generateHelper')
const sendMailHelper = require('../../helpers/sendMailHelper')

const createUser = async (req, res) => {
  const {
    email,
    password,
    student_code,
    className,
    full_name,
    facultyId,
    courseId
  } = req.body
  console.log(req.body)
  const data = await createUserService(
    email,
    password,
    student_code,
    className,
    full_name,
    facultyId,
    courseId
  )
  return res.status(200).json(data)
}

const handleLogin = async (req, res) => {
  const { email, password } = req.body
  const data = await loginService(email, password)

  return res.status(200).json(data)
}

const getUser = async (req, res) => {
  const data = await getUserService()
  return res.status(200).json(data)
}

const getAccount = async (req, res) => {
  return res.status(200).json(req.user)
}

const forgotPassword = async (req, res) => {
  const email = req.body.email
  const existUser = await User.findOne({
    email: email
  })

  if (!existUser) {
    res.json({
      code: 'error',
      message: 'Email không tồn tại!'
    })
    return
  }

  const existEmailInForgotPassword = await ForgotPassword.findOne({
    email: email
  })

  if (!existEmailInForgotPassword) {
    const otp = generateHelper.generateRandomNumber(6)
    const data = {
      email: email,
      otp: otp,
      expireAt: Date.now() + 5 * 60 * 1000
    }

    const record = new ForgotPassword(data)
    await record.save()

    const subject = 'Xác thực mã OTP'
    const text = `Mã xác thực của bạn là <b>${otp}</b>. Mã OTP có hiệu lực trong vòng 5 phút, vui lòng không cung cấp mã OTP cho bất kỳ ai.`
    sendMailHelper.sendMail(email, subject, text)
  }

  res.json({
    code: 'success',
    message: 'Gửi mã OTP thành công!'
  })
}

const otpPassword = async (req, res) => {
  const email = req.body.email
  const otp = req.body.otp

  const existRecord = await ForgotPassword.findOne({
    email: email,
    otp: otp
  })

  if (!existRecord) {
    res.json({
      code: 'error',
      message: 'Mã OTP không hợp lệ!'
    })
    return
  }

  const user = await User.findOne({
    email: email
  }).select('email full_name')

  //create an access token
  const payload = {
    email: user.email,
    full_name: user.full_name
  }

  const access_token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  })

  res.json({
    code: 'success',
    message: 'Mã OTP hợp lệ!',
    token: access_token,
    user: payload
  })
}

const resetPassword = async (req, res) => {
  const password = req.body.password
  const token = req.body.token
  const user = req.body.user

  if (token) {
    //verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const decodeUser = {
        email: decoded.email,
        full_name: decoded.name
      }

      if (
        decodeUser.email != user.email ||
        decodeUser.full_name != user.full_name
      ) {
        return res.status(400)
      }

      const saltRounds = 10
      //hash user password
      const hashPassword = await bcrypt.hash(password, saltRounds)
      await User.updateOne(
        {
          email: user.email
        },
        {
          password: hashPassword
        }
      )
    } catch (error) {
      return res.status(401).json({
        error: error.message,
        message: 'Token bị hết hạn/hoặc không hợp lệ'
      })
    }
  } else {
    return res.status(401).json({
      message: 'Bạn chưa gửi Access Token ở body/Hoặc token bị hết hạn'
    })
  }

  res.json({
    code: 'success',
    message: 'Đổi mật khẩu thành công!'
  })
}

const registeredEvents = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Tìm kiếm tất cả các event_id trong user.events_registered
    const eventIds = user.events_registered.map((item) => item.event_id);

    // Search
    const find = { _id: { $in: eventIds } }; // Tìm các sự kiện có _id trong eventIds
    if (req.query.status) {
      find.status = req.query.status;
    }

    if (req.query.keyword) {
      const regex = new RegExp(req.query.keyword, 'i');
      find.name = regex;
    }

    if (req.query.date) {
      const date = new Date(req.query.date);
      find.date_start = { $lte: date };
      find.date_end = { $gte: date };
    }

    if (req.query.locationId) {
      find.location_id = req.query.locationId;
    }
    // End Search

    // Sort 
    const sort = {};

    if (req.query.sortKey && req.query.sortValue) {
      sort[req.query.sortKey] = req.query.sortValue;
    }
    // End sort 

    // Pagination
    const limitItem = parseInt(req.query.limitItem) || 4;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limitItem;
    // End Pagination
    console.log("toi day")
    // Truy vấn các sự kiện với điều kiện tìm kiếm và phân trang
    const events = await Event.find(find).limit(limitItem).skip(skip).sort(sort)

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  createUser,
  handleLogin,
  getUser,
  getAccount,
  forgotPassword,
  otpPassword,
  resetPassword,
  registeredEvents
}
