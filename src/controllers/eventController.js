const Event = require('../models/eventModel')
const User = require('../models/userModel')
const QRCode = require('qrcode')

// Tạo sự kiện mới
const createEvent = async (req, res) => {
  try {
    const event = new Event(req.body)
    await event.save()
    res.status(201).json(event)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Lấy tất cả sự kiện
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({})
    res.status(200).json(events)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Lấy sự kiện theo ID
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }
    res.status(200).json(event)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Cập nhật sự kiện
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }
    res.status(200).json(event)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Xóa sự kiện
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id)
    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }
    res.status(200).json({ message: 'Event deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const registerEvent = async (req, res) => {
  try {
    const regisInfor = req.body
    if (regisInfor) {
      // Tạo dữ liệu QR code
      const data = {
        student_code: regisInfor.student_code,
        eventId: regisInfor.eventId
      }

      const qr_code = await QRCode.toDataURL(JSON.stringify(data))

      // Dữ liệu cần thêm vào event registration
      const addData = {
        event_id: regisInfor.eventId,
        qr_code: qr_code,
        registration_date: new Date(),
        check_in_status: false,
        check_out_status: false
      }

      // Tìm và cập nhật User, thêm event vào mảng `events_registered`
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { $push: { events_registered: addData } },
        { new: true, runValidators: true }
      )

      console.log(req.params)

      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }
      res.status(200).json(user)
    } else {
      return res.status(400).json({ message: 'Bad request' })
    }
  } catch (error) {
    console.error('Error registering event:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerEvent
}
