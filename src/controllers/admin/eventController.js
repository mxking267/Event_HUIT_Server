const { Event } = require('../../models/eventModel')
const User = require('../../models/userModel')

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

const listParticipant = async (req, res) => {
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

const changeMultiEventsStatus = async (req, res) => {
  const status = req.body.status 
  const ids = req.body.ids

  await Event.updateMany({
    _id: { $in: ids }
  }, {
    status: status
  })

  res.status(200).json({message: "Update event successfully!"})
}

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  listParticipant, 
  changeMultiEventsStatus
}
