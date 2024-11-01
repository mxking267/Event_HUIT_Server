const { Event } = require('../../models/eventModel')
const User = require('../../models/userModel')
const QRCode = require('qrcode')
const { checkInCheckOutService } = require('../../services/eventService')

const index = async (req, res) => {
  try {
    // Search
    const find = {}
    if (req.query.status) {
      find.status = req.query.status;
    }

    if (req.query.keyword) {
      const regex = new RegExp(req.query.keyword, "i");
      find.name = regex;
    }

    if (req.query.date) {
      const date = new Date(req.query.date); 
      find.date_start = { $lte: date }; 
      find.date_end = { $gte: date };  
    }

    if (req.query.locationId) {
      find.location_id = req.query.locationId
    }
    // End Search

    // Pagination 
    let limitItem = 4;
    let page = 1;

    if (req.query.page) {
      page = req.query.page;
    }

    if (req.query.limitItem) {
      limitItem = req.query.limitItem;
    }

    const skip = (page - 1) * limitItem;
    // End Pagination 


    console.log(find)
    const events = await Event
      .find(find)
      .limit(limitItem)
      .skip(skip)

    res.status(200).json(events);
  } catch (error) {
    console.log(error)
    return res.status(500).json('Internal server error')
  }
}

// Check-in sự kiện
const checkInCheckOut = async (req, res) => {
  try {
    const { eventId, studentCode } = req.params
    const status = req.body.status // (checkin/checkout)
    const data = await checkInCheckOutService(eventId, studentCode, status)
    return res.status(200).json(data)
  } catch (error) {
    console.log(error)
    return res.status(500).json('Internal server error')
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

const registerEvent = async (req, res) => {
  try {
    const regisInfor = req.body
    if (regisInfor.student_code && regisInfor.eventId) {
      const qr_code = await QRCode.toDataURL(JSON.stringify(regisInfor))

      // Dữ liệu cần thêm vào event registration
      const addDataEventRegistration = {
        event_id: regisInfor.eventId,
        qr_code: qr_code,
        registration_date: new Date(),
        check_in_status: false,
        check_out_status: false
      }

      // Tìm và cập nhật User, thêm event vào mảng `events_registered`
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { $push: { events_registered: addDataEventRegistration } },
        { new: true, runValidators: true }
      )
      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }

      // Tìm và cập nhật Event, thêm participant vào mảng `participants`
      const addDataParticipant = {
        user_id: req.params.id,
        check_in_status: false,
        check_out_status: false
      }

      const event = await Event.findByIdAndUpdate(
        regisInfor.eventId,
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

module.exports = {
  index,
  getAllEvents,
  getEventById,
  registerEvent,
  checkInCheckOut
}
