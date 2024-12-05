const { Event } = require('../models/eventModel')
const UserModel = require('../models/userModel')
const { Course } = require('../models/courseModel')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

const checkInCheckOutService = async (eventId, userId, usedFor) => {
  try {
    if (!eventId && !userId) {
      return { message: 'Bad request!' }
    }

    const student = await UserModel.findOne({ _id: userId })
    if (!student) throw new Error('Student not found')

    const event = await Event.findOne({ _id: eventId })
    if (!event) throw new Error('Event not found')
    console.log(event)

    const participant = event.participants.find(
      (p) => p.user_id.toString() === student._id.toString()
    )
    if (!participant) {
      throw new Error('User not registered for the event')
    }
    console.log(event.participants)

    if (usedFor == 'CHECK_IN') {
      if (participant.status === 'CHECKED_IN') {
        throw new Error('User has already checked in')
      }
      participant.status = 'CHECKED_IN'
      await event.save()
      return { message: 'Check-in successful' }
    } else if (usedFor === 'CHECK_OUT') {
      if (participant.status === 'CHECKED_OUT') {
        return { message: 'User has already checked out' }
      }
      if (participant.status !== 'CHECKED_IN') {
        return { message: 'User has not checked in' }
      }
      participant.status = 'CHECKED_OUT'
      await event.save()
      return { message: 'Check-out successful' }
    } else {
      return { message: 'Event has been cancelled' }
    }
  } catch (error) {
    console.log(error)
    return null
  }
}

const getEventAdminService = async (find, limitItem, skip) => {
  const events = await Event.find(find)
    .populate('faculty_id', 'name')
    .sort({ date: -1 })
    .limit(limitItem)
    .skip(skip)

  return events
}

const getEventUserService = async (userId, find) => {
  // Lấy thông tin người dùng và khóa học
  const user = await UserModel.findById(userId)
  const facultyId = user.faculty_id
  const course = await Course.findById(user.course_id)

  // Kiểm tra ngày kết thúc khóa học
  const endDateCourse = new Date(course.endYear, 6, 31)
  const currentDate = new Date()

  if (currentDate <= endDateCourse) {
    // Tạo đối tượng findQuery với các điều kiện từ find
    const findQuery = { ...find }

    // Truy vấn sự kiện với các điều kiện findQuery, sắp xếp và phân trang
    const events = await Event.find(findQuery)
      .populate('faculty_id', 'name')
      .sort({ date: -1 })

    // Xử lý sự kiện sau khi truy vấn
    const modifiedEvents = events.map((event) => {
      const userObjectId = new ObjectId(userId)

      const isValidFaculty =
        !event.faculty_id || event.faculty_id._id == facultyId

      // Kiểm tra người dùng đã đăng ký chưa
      const isRegistered = event.participants.some((part) =>
        part.user_id.equals(userObjectId)
      )

      if (isValidFaculty) {
        return {
          ...event.toObject(),
          participants: undefined,
          isRegistered
        }
      }

      return null
    })

    return modifiedEvents
  } else {
    return null
  }
}

const getUserQRCodeForEvent = async (userId, eventId) => {
  try {
    const user = await UserModel.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    const eventObjectId = new ObjectId(eventId)
    const qr = user.events_registered.find((ev) =>
      ev.event_id.equals(eventObjectId)
    )

    if (!qr) {
      throw new Error('Cannot find QR Code')
    }
    return {
      qr_code_cki: qr.qr_code_cki,
      qr_code_cko: qr.qr_code_cko
    }
  } catch (error) {
    console.error('Error fetching QR code:', error)
    throw error
  }
}

module.exports = {
  checkInCheckOutService,
  getEventAdminService,
  getEventUserService,
  getUserQRCodeForEvent
}
