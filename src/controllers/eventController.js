const { Event, eventRegistrationSchema } = require('../models/eventModel');
const User = require('../models/userModel')
const QRCode = require('qrcode')
const { checkInService, checkOutService, } = require('../services/eventService');



// Check-in sự kiện 
const checkInEvent = async (req, res) => {
  try {
    const { eventId, studentCode } = req.params;
    const data = await checkInService(eventId, studentCode);
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Internal server error");
  }
}

// Tạo sự kiện mới
const createEvent = async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Lấy tất cả sự kiện
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({});
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Lấy sự kiện theo ID
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Xóa sự kiện
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const registerEvent = async (req, res) => {
  try {
    const regisInfor = req.body;
    if (regisInfor.student_code && regisInfor.eventId) {

      const qr_code = await QRCode.toDataURL(JSON.stringify(regisInfor));

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
        return res.status(404).json({ message: 'User not found' });
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
        return res.status(404).json({ message: 'Event not found' });
      }
      res.status(200).json(user);
    } else {
      return res.status(400).json({ message: 'Bad request' });
    }
  } catch (error) {
    console.error('Error registering event:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerEvent,
  checkInEvent,

}
