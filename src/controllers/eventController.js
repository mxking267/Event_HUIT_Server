const { Event } = require('../models/eventModel')
const User = require('../models/userModel')
const QRCode = require('qrcode')
const {
  checkInCheckOutService,
  getEventService,
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
    const find = {}
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

    // Pagination
    let limitItem = 4
    let page = 1

    if (req.query.page) {
      page = req.query.page
    }

    if (req.query.limitItem) {
      limitItem = req.query.limitItem
    }

    const skip = (page - 1) * limitItem
    // End Pagination

    const { role, _id: userId } = req.user
    console.log(userId)
    if (role === 'USER') {
      const events = await getEventService(role, userId, find, limitItem, skip)
      res.status(200).json(events)
    } else {
      const events = await getEventService(role, null, find, limitItem, skip)
      res.status(200).json(events)
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json('Internal server error')
  }
}

const getListParticipant = async (req, res) => {
  try {
    const eventId = req.params.eventId
    const event = await Event.findById(eventId)
    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }
    const participants = []
    for (const participant of event.participants) {
      const user = await User.findOne({ _id: participant.user_id }).select(
        '-password -events_registered'
      )
      if (user) {
        participants.push(user)
      }
    }
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

module.exports = {
  getEventById,
  registerEvent,
  checkInCheckOut,
  createEvent,
  getAllEvents,
  updateEvent,
  deleteEvent,
  getQR,
  getListParticipant
}
