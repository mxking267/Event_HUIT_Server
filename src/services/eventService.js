const { Event } = require('../models/eventModel')
const UserModel = require('../models/userModel')

const checkInCheckOutService = async (eventId, studentCode, status) => {
  try {
    if (!eventId && !studentCode) {
      return { message: 'Bad request!' }
    }

    const student = await UserModel.findOne({ student_code: studentCode })
    if (!student) return { message: 'Student not found' }

    const event = await Event.findById(eventId)
    if (!event) return { message: 'Event not found' }

    const participant = event.participants.find(
      (p) => p.user_id.toString() === student._id.toString()
    )

    if (!participant) {
      return { message: 'User not registered for the event' }
    }

    if (status == 'checkin') {
      if (
        participant.check_in_out_status == 'CHECKED_IN' ||
        participant.check_in_out_status == 'CHECKED_OUT'
      ) {
        return { message: 'User has already checked in' }
      }
      participant.check_in_out_status = 'CHECKED_IN'
      await event.save()
      return { message: 'Check-in successful' }
    } else {
      if (participant.check_in_out_status == 'CHECKED_OUT') {
        return { message: 'User has already checked out' }
      }
      if (participant.check_in_out_status != 'CHECKED_IN') {
        return { message: 'User has not checked in' }
      }
      participant.check_in_out_status = 'CHECKED_OUT'
      await event.save()
      return { message: 'Check-out successful' }
    }

    // event.bonus_points = 4; // apply to the old event
  } catch (error) {
    console.log(error)
    return null
  }
}

module.exports = {
  checkInCheckOutService
}
