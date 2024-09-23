const {
  createUserService,
  createManagerService
} = require('../services/userService')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const User = require('../models/userModel')
const { Course } = require('../models/courseModel')
const { Event } = require('../models/eventModel')

const createUser = async (req, res) => {
  try {
    console.log(req.body)
    const {
      email,
      password,
      student_code,
      class_name,
      full_name,
      faculty_id,
      course_id
    } = req.body

    // Kiểm tra email trùng lặp
    const existingEmail = await User.findOne({ email })
    if (existingEmail) {
      return res.status(400).json({ message: 'Email đã tồn tại!' })
    }

    // Kiểm tra student_code trùng lặp
    const existingStudentCode = await User.findOne({ student_code })
    if (existingStudentCode) {
      return res.status(400).json({ message: 'Mã sinh viên đã tồn tại!' })
    }

    // Nếu không trùng, tiếp tục tạo người dùng
    const data = await createUserService(
      email,
      password,
      student_code,
      class_name,
      full_name,
      'USER',
      faculty_id,
      course_id
    )

    return res.status(200).json(data)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

const createManager = async (req, res) => {
  try {
    const { email, password, full_name } = req.body
    const data = await createManagerService(email, password, full_name)
    return res.status(200).json(data)
  } catch (error) {
    console.log(error)
    return res.status(500).json('Internal server error')
  }
}

const updateUser = async (req, res) => {
  try {
    const { id } = req.params // User ID from URL parameters
    const {
      email,
      password,
      student_code,
      class_name,
      full_name,
      faculty_id,
      course_id
    } = req.body

    // Check if the user exists
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ message: 'User not found!' })
    }

    // Check if the email is changing and if it's already taken by another user (excluding current user)
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email, _id: { $ne: id } })
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already exists!' })
      }
    }

    // Check if the student_code is changing and if it's already taken by another user (excluding current user)
    if (student_code && student_code !== user.student_code) {
      const existingStudentCode = await User.findOne({
        student_code,
        _id: { $ne: id }
      })
      if (existingStudentCode) {
        return res.status(400).json({ message: 'Student code already exists!' })
      }
    }

    // Update user fields
    if (email) user.email = email
    if (password) user.password = await bcrypt.hash(password, 10)
    if (student_code) user.student_code = student_code
    if (class_name) user.class_name = class_name
    if (full_name) user.full_name = full_name
    if (faculty_id) user.faculty_id = faculty_id
    if (course_id) user.course_id = course_id

    // Save updated user to database
    const newUser = await User.findByIdAndUpdate(id, user, { new: true })

    res
      .status(200)
      .json({ message: 'User updated successfully!', data: newUser })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

const updateManager = async (req, res) => {
  try {
    const { id } = req.params // Manager ID from URL parameters
    const { email, password, full_name } = req.body

    // Check if the manager exists
    const manager = await User.findById(id)
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found!' })
    }

    // Ensure the user has the 'MANAGER' role
    if (manager.role !== 'MANAGER') {
      return res.status(400).json({ message: 'This user is not a manager!' })
    }

    // Check if the email is changing and if it's already taken by another manager (excluding current manager)
    if (email && email !== manager.email) {
      const existingEmail = await User.findOne({
        email,
        _id: { $ne: id }
      })
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already exists!' })
      }
    }

    // Update manager fields
    if (email) manager.email = email
    if (password) manager.password = await bcrypt.hash(password, 10)
    if (full_name) manager.full_name = full_name

    // Save updated manager to database
    const updatedManager = await User.findByIdAndUpdate(id, manager, {
      new: true
    })

    res
      .status(200)
      .json({ message: 'Manager updated successfully!', data: updatedManager })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

const getUser = async (req, res) => {
  try {
    const find = {}

    if (req.query.keyword) {
      const regex = new RegExp(req.query.keyword, 'i')
      find.$or = [
        { full_name: regex },
        { email: regex },
        { student_code: regex }
      ]
    }

    let limitItem = 8
    let page = 1

    if (req.query.page) {
      page = req.query.page
    }

    if (req.query.limitItem) {
      limitItem = req.query.limitItem
    }

    find.role = 'USER'
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

const getStudents = async (req, res) => {
  try {
    const find = {}

    // Filter by search keyword
    if (req.query.keyword) {
      const regex = new RegExp(req.query.keyword, 'i')
      find.$or = [
        { full_name: regex },
        { email: regex },
        { student_code: regex }
      ]
    }

    // Filter by faculty_id
    if (req.query.faculty_id) {
      find.faculty_id = req.query.faculty_id
    }

    // Filter by course_id
    if (req.query.course_id) {
      find.course_id = req.query.course_id
    }

    let limitItem = 8 // Default items per page
    let page = 1 // Default page number

    if (req.query.page) {
      page = parseInt(req.query.page, 10) // Parse page number
    }

    if (req.query.limitItem) {
      limitItem = parseInt(req.query.limitItem, 10) // Parse limit
    }

    const skip = (page - 1) * limitItem

    // Count total users
    const totalUsers = await User.countDocuments(find)

    // Calculate total pages
    const totalPages = Math.ceil(totalUsers / limitItem)

    // Fetch users with pagination
    const users = await User.find(find)
      .limit(limitItem)
      .skip(skip)
      .sort({ createdAt: -1 }) // Sort by creation date descending

    res.status(200).json({
      data: users,
      currentPage: page,
      totalPages,
      totalUsers
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

const getManager = async (req, res) => {
  try {
    const find = {}

    if (req.query.keyword) {
      const regex = new RegExp(req.query.keyword, 'i')
      find.$or = [{ full_name: regex }, { email: regex }]
    }

    let limitItem = 8
    let page = 1

    if (req.query.page) {
      page = req.query.page
    }

    if (req.query.limitItem) {
      limitItem = req.query.limitItem
    }

    find.role = 'MANAGER'
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
            : sum,
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

    const totalEvent = eventsWithAttendanceStatus.length
    const totalPages = Math.ceil(totalEvent / limitItem)

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
  createUser,
  createManager,
  getUser,
  getManager,
  resetPassword,
  trainingPointOnSemester,
  getRegisteredEvents,
  getUsers: getStudents,
  updateManager,
  updateUser
}
