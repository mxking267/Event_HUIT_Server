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

    // Search
    const find = {}
    if (req.query.full_name) {
      const regex = new RegExp(req.query.full_name, 'i')
      find.full_name = regex
    }

    if (req.query.student_code) {
      const regex = new RegExp(req.query.student_code, 'i')
      find.student_code = regex
    }

    if (req.query.className) {
      const regex = new RegExp(req.query.className, 'i')
      find.className = regex
    }

    if (req.query.courseId) {
      find.courseId = req.query.courseId
    }

    if (req.query.facultyId) {
      find.facultyId = req.query.facultyId
    }

    // End Search

    // Sort
    const sort = {}

    if (req.query.sortKey && req.query.sortValue) {
      sort[req.query.sortKey] = req.query.sortValue
    }
    // End sort

    // Pagination
    let limitItem = 20
    let page = 1

    if (req.query.page) {
      page = req.query.page
    }

    if (req.query.limitItem) {
      limitItem = req.query.limitItem
    }

    const skip = (page - 1) * limitItem
    // End Pagination

    const userIds = []
    for (const p of event.participants) {
      userIds.push(p.user_id)
    }

    find._id = { $in: userIds }

    const users = await User.find(find)
      .limit(limitItem)
      .skip(skip)
      .sort(sort)
      .select('-password -events_registered -role')

    res.status(200).json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const changeMultiEventsStatus = async (req, res) => {
  try {
    const status = req.body.status
    const ids = req.body.ids

    await Event.updateMany(
      {
        _id: { $in: ids }
      },
      {
        status: status
      }
    )

    res.status(200).json({ message: 'Update event successfully!' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const deleteMultiParticipants = async (req, res) => {
  try {
    const userIds = req.body.userIds
    const eventId = req.params.eventId

    await Event.updateOne(
      {
        _id: eventId
      },
      {
        $pull: {
          participants: {
            user_id: { $in: userIds }
          }
        }
      }
    )

    await User.updateMany({
      _id: { $in:  userIds}
    }, {
      $pull: {
        events_registered: {
          event_id: eventId
        }
      }
    })

    res.status(200).json({ message: 'Delete participants successfully!' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  listParticipant,
  changeMultiEventsStatus,
  deleteMultiParticipants
}
