const { createUserService } = require('../services/userService')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const User = require('../models/userModel')
const ForgotPassword = require('../models/forgotPasswordModel')
const { Course } = require('../models/courseModel')

const generateHelper = require('../utils/generateRandomNumber')
const sendMailHelper = require('../utils/sendMail')
const { Event } = require('../models/eventModel')

const registerUser = async (req, res) => {
  const {
    email,
    password,
    student_code,
    class_name,
    full_name,
    facultyId,
    courseId
  } = req.body
  console.log(req.body)
  const data = await createUserService(
    email,
    password,
    student_code,
    class_name,
    full_name,
    facultyId,
    courseId
  )
  return res.status(200).json(data)
}

const createUser = async (req, res) => {
  const { email, password, full_name } = req.body
  console.log(req.body)
  const data = await createUserService(email, password, full_name, 'MANAGER')
  return res.status(200).json(data)
}

const getUser = async (req, res) => {
  try {
    const find = {}

    if (req.query.keyword) {
      const regex = new RegExp(req.query.keyword, 'i')
      find.name = regex
    }

    let limitItem = 8
    let page = 1

    if (req.query.page) {
      page = req.query.page
    }

    if (req.query.limitItem) {
      limitItem = req.query.limitItem
    }

    const skip = (page - 1) * limitItem

    const totalUsers = await User.countDocuments(find)

    const totalPages = Math.ceil(totalUsers / limitItem)

    // Lấy danh sách người dùng theo phân trang
    const users = await User.find(find).limit(limitItem).skip(skip)

    res.status(200).json({
      data: users,
      currentPage: page,
      totalPages
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json('Internal server error')
  }
}

const getManager = async (req, res) => {
  try {
    const users = await User.find({ role: 'MANAGER' }).select()
    res.status(200).json({ data: users })
  } catch (error) {
    console.log(error)
    return res.status(500).json('Internal server error')
  }
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

const trainingPointOnSemester = async (req, res) => {
  try {
    const userId = req.params.userId
    const user = await User.findById(userId).select('-password')
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Lấy thông tin khóa học của sinh viên để xác định năm bắt đầu
    const course = await Course.findById(user.course_id)
    const startYear = course.startYear

    // Mảng lưu kết quả cuối cùng
    const semesters = []

    // Lặp qua 8 kỳ (4 năm)
    for (let semester = 1; semester <= 8; semester++) {
      let semesterStart, semesterEnd

      // Tính năm học của kỳ
      const years = startYear + Math.floor((semester - 1) / 2)

      if (semester % 2 === 1) {
        // Semester lẻ: tháng 9 - tháng 1
        semesterStart = new Date(years, 8, 1) // 1/9 của năm học đó
        semesterEnd = new Date(years + 1, 0, 31) // 31/1 của năm sau
      } else {
        // Semester chẵn: tháng 2 - tháng 7
        semesterStart = new Date(years + 1, 1, 1) // 1/2 của năm tiếp theo
        semesterEnd = new Date(years + 1, 6, 31) // 31/7 của năm tiếp theo
      }

      // Tìm kiếm tất cả các event_id trong user.events_registered
      const eventIds = user.events_registered.map((item) => item.event_id)

      // Lấy các sự kiện mà sinh viên đã tham gia và có trạng thái CHECKED_OUT trong khoảng thời gian học kỳ
      const events = await Event.find({
        _id: { $in: eventIds },
        'participants.user_id': userId,
        date: { $gte: semesterStart, $lte: semesterEnd }
      })

      const eventsWithAttendanceStatus = events.map((event) => {
        const participant = event.participants.find(
          (p) => p.user_id.toString() === userId
        )
        return {
          ...event.toObject(),
          attendanceStatus: participant ? participant.status : null,
          participants: undefined
        }
      })

      // Tính tổng điểm bonus_points cho kỳ này
      const totalPointsForSemester = eventsWithAttendanceStatus.reduce(
        (sum, event) =>
          event.attendanceStatus === 'CHECKED_OUT'
            ? sum + (event.bonus_points || 0)
            : 0,
        0
      )

      // Thêm thông tin kỳ vào mảng
      semesters.push({
        semester: semester,
        totalPoints: totalPointsForSemester,
        events: eventsWithAttendanceStatus // Gắn toàn bộ sự kiện của kỳ này
      })
    }

    res.status(200).json({ semesters })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getRegisteredEvents = async (req, res) => {
  try {
    const userId = req.params.userId
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    const eventIds = user.events_registered.map((item) => item.event_id)
    const find = { _id: { $in: eventIds } }
    if (req.query.status) {
      find.status = req.query.status
    }
    if (req.query.keyword) {
      const regex = new RegExp(req.query.keyword, 'i')
      find.name = regex
    }
    if (req.query.locationId) {
      find.location_id = req.query.locationId
    }

    let limitItem = 8
    let page = 1

    if (req.query.page) {
      page = req.query.page
    }
    const skip = (page - 1) * limitItem

    const totalEvent = eventIds.length
    const totalPages = Math.ceil(totalEvent / limitItem)
    const events = await Event.find(find)
      .limit(limitItem)
      .skip(skip)
      .sort({ date: -1 })

    const eventsWithAttendanceStatus = events.map((event) => {
      const participant = event.participants.find(
        (p) => p.user_id.toString() === userId
      )
      return {
        ...event.toObject(),
        attendanceStatus: participant ? participant.status : null,
        participants: undefined
      }
    })

    res.status(200).json({
      data: eventsWithAttendanceStatus,
      currentPage: page,
      totalPages
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = {
  registerUser,
  createUser,
  getUser,
  getManager,
  forgotPassword,
  otpPassword,
  resetPassword,
  trainingPointOnSemester,
  getRegisteredEvents
}
