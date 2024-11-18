const { Event } = require('../models/eventModel')
const User = require('../models/userModel')
const QRCode = require('qrcode')
const {
  checkInCheckOutService,
  getEventAdminService,
  getEventUserService,
  getUserQRCodeForEvent
} = require('../services/eventService')

const checkInCheckOut = async (req, res) => {
  try {
    const { eventId, userId, usedFor } = req.body
    const data = await checkInCheckOutService(eventId, userId, usedFor)
    return res.status(200).json(data)
  } catch (error) {
    console.log(error)
    return res.status(500).json('Internal server error')
  }
}

const getAllEvents = async (req, res) => {
  try {
    const { role, _id: userId } = req.user
    const find = {}
    if (req.query.keyword) {
      const regex = new RegExp(req.query.keyword, 'i')
      find.name = regex
    }

    // Pagination
    let limitItem = 8
    let page = 1

    if (req.query.page) {
      page = req.query.page
    }

    if (req.query.limitItem) {
      limitItem = req.query.limitItem
    }

    const skip = (page - 1) * limitItem
    // End Pagination

    const totalItem = await Event.countDocuments(find)

    if (role === 'ADMIN' || role === 'MANAGER') {
      const events = await getEventAdminService(find, limitItem, skip)
      res.status(200).json({
        data: events,
        currentPage: page,
        totalPages: Math.ceil(totalItem / limitItem)
      })
    } else {
      const events = await getEventUserService(userId, find, limitItem, skip)
      if (events === null) {
        res
          .status(400)
          .json({ message: 'User is no longer within study period' })
      } else {
        res.status(200).json({
          data: events,
          currentPage: page,
          totalPages: Math.ceil(totalItem / limitItem)
        })
      }
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json('Internal server error')
  }
}

const getListParticipant = async (req, res) => {
  try {
    const find = {}
    if (req.query.keyword) {
      const regex = new RegExp(req.query.keyword, 'i')
      find.$or = [{ student_code: regex }, { full_name: regex }]
    }

    const eventId = req.params.eventId
    const event = await Event.findById(eventId)
    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }
    const participants = []
    for (const participant of event.participants) {
      const user = await User.findOne({
        _id: participant.user_id,
        ...find
      }).select(
        '-password -events_registered -role -email -__v -facultyId -courseId'
      )
      if (user) {
        participants.push({
          _id: user._id,
          student_code: user.student_code,
          class_name: user.class_name,
          full_name: user.full_name,
          status: participant.status
        })
      }
    }

    participants.sort((a, b) => b.full_name.localeCompare(a.full_name))

    res.status(200).json(participants)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getAllParticipant = async (req, res) => {
  try {
    const find = {}
    if (req.query.keyword) {
      const regex = new RegExp(req.query.keyword, 'i')
      find.$or = [{ student_code: regex }, { full_name: regex }]
    }

    const eventId = req.params.eventId
    const event = await Event.findById(eventId)
    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }
    const participants = []
    for (const participant of event.participants) {
      const user = await User.findOne({
        _id: participant.user_id,
        ...find
      }).select(
        '-password -events_registered -role -email -__v -facultyId -courseId'
      )
      if (user) {
        participants.push({
          _id: user._id,
          student_code: user.student_code,
          class_name: user.class_name,
          full_name: user.full_name,
          status: participant.status
        })
      }
    }

    participants.sort((a, b) => b.full_name.localeCompare(a.full_name))

    res.status(200).json(participants)
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

const registerEvent = async (req, res) => {
  try {
    const { _id: userId } = req.user
    const eventId = req.params.id
    if (userId && eventId) {
      const qr_code_cki = await QRCode.toDataURL(
        JSON.stringify({ userId, eventId, usedFor: 'CHECK_IN' })
      )
      const qr_code_cko = await QRCode.toDataURL(
        JSON.stringify({ userId, eventId, usedFor: 'CHECK_OUT' })
      )

      const addDataEventRegistration = {
        event_id: eventId,
        registration_date: new Date(),
        qr_code_cki,
        qr_code_cko,
        status: 'PENDING'
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { $push: { events_registered: addDataEventRegistration } },
        { new: true, runValidators: true }
      )
      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }

      const addDataParticipant = {
        user_id: userId,
        check_in_status: false,
        check_out_status: false
      }

      const event = await Event.findByIdAndUpdate(
        eventId,
        { $push: { participants: addDataParticipant } },
        { new: true, runValidators: true }
      )
      if (!event) {
        return res.status(404).json({ message: 'Event not found' })
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

const updateEventStatus = async (req, res) => {
  try {
    const { id } = req.params // Lấy ID của sự kiện từ params
    const { status } = req.body // Lấy trạng thái mới từ body

    // Danh sách trạng thái hợp lệ
    const validStatuses = ['INITIAL', 'HAPPENING', 'FINISHED', 'STOPPED']

    // Kiểm tra trạng thái có hợp lệ không
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' })
    }

    // Tìm và cập nhật trạng thái sự kiện
    const event = await Event.findByIdAndUpdate(
      id,
      { status }, // Cập nhật trạng thái mới
      { new: true } // Trả về sự kiện sau khi cập nhật
    )

    // Kiểm tra sự kiện có tồn tại không
    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }

    return res.status(200).json({
      message: 'Event status updated successfully',
      event
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

// Tạo sự kiện mới
const createEvent = async (req, res) => {
  try {
    const event = new Event(req.body)
    event.status = 'INITIAL'
    await event.save()
    res.status(201).json(event)
  } catch (error) {
    res.status(400).json({ error: error.message })
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

const getQR = async (req, res) => {
  try {
    const { _id: userId } = req.user
    const eventId = req.params.id
    if (userId && eventId) {
      getUserQRCodeForEvent(userId, eventId)
        .then((qrCode) => {
          if (qrCode) res.status(200).json({ qr_code: qrCode })
        })
        .catch((error) => {
          console.error('Error:', error)
          throw new Error(error)
        })
    } else {
      return res.status(400).json({ message: 'Bad request' })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const registeredEvents = async (req, res) => {
  try {
    const userId = req.params.userId
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    // Tìm kiếm tất cả các event_id trong user.events_registered
    const eventIds = user.events_registered.map((item) => item.event_id)
    // Search
    const find = { _id: { $in: eventIds } } // Tìm các sự kiện có _id trong eventIds
    if (req.query.status) {
      find.status = req.query.status
    }
    if (req.query.keyword) {
      const regex = new RegExp(req.query.keyword, 'i')
      find.name = regex
    }
    if (req.query.date) {
      const date = new Date(req.query.date)
      find.date_start = { $lte: date }
      find.date_end = { $gte: date }
    }
    if (req.query.locationId) {
      find.location_id = req.query.locationId
    }
    // End Search
    // Sort
    const sort = {}
    if (req.query.sortKey && req.query.sortValue) {
      sort[req.query.sortKey] = req.query.sortValue
    }
    // End sort
    // Pagination
    const limitItem = parseInt(req.query.limitItem) || 4
    const page = parseInt(req.query.page) || 1
    const skip = (page - 1) * limitItem
    // End Pagination
    // Truy vấn các sự kiện với điều kiện tìm kiếm và phân trang
    const events = await Event.find(find).limit(limitItem).skip(skip).sort(sort)
    res.status(200).json(events)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const cancelRegisterEvent = async (req, res) => {
  try {
    const { _id: userId } = req.user
    const eventId = req.params.id

    if (userId && eventId) {
      // Kiểm tra trạng thái sự kiện
      const event = await Event.findById(eventId)
      if (!event) {
        return res.status(404).json({ message: 'Event not found' })
      }

      if (event.status !== 'INITIAL') {
        return res.status(400).json({
          message: 'Cannot cancel registration. Event is happening or finished!'
        })
      }

      // Xóa sự kiện khỏi danh sách đã đăng ký của user
      const user = await User.findByIdAndUpdate(
        userId,
        { $pull: { events_registered: { event_id: eventId } } },
        { new: true, runValidators: true }
      )

      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }

      // Xóa user khỏi danh sách participants của sự kiện
      const updatedEvent = await Event.findByIdAndUpdate(
        eventId,
        { $pull: { participants: { user_id: userId } } },
        { new: true, runValidators: true }
      )

      if (!updatedEvent) {
        return res
          .status(404)
          .json({ message: 'Failed to update event participants' })
      }

      // Thành công
      return res
        .status(200)
        .json({ message: 'Cancel registering event successfully!' })
    } else {
      return res.status(400).json({ message: 'Bad request' })
    }
  } catch (error) {
    console.error('Error cancel registering event:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  getEventById,
  registerEvent,
  checkInCheckOut,
  createEvent,
  getAllEvents,
  updateEvent,
  deleteEvent,
  getQR,
  getListParticipant,
  registeredEvents,
  cancelRegisterEvent,
  getAllParticipant,
  updateEventStatus
}
