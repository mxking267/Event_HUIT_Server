const { Event } = require('../models/eventModel')
const UserModel = require('../models/userModel')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

const checkInCheckOutService = async (eventId, userId, status) => {
  try {
    if (!eventId && !userId) {
      return { message: 'Bad request!' }
    }

    const student = await UserModel.findOne({ _id: userId })
    if (!student) throw new Error('Student not found')

    const event = await Event.findById(eventId)
    if (!event) throw new Error('Event not found')

    const participant = event.participants.find(
      (p) => p.user_id.toString() === student._id.toString()
    )
    if (!participant) {
      throw new Error('User not registered for the event')
    }

    if (status == 'CHECK_IN') {
      if (participant.check_in_status) {
        throw new Error('User has already checked in')
      }
      participant.check_in_status = true
      await event.save()
      return { message: 'Check-in successful' }
    } else {
      if (participant.check_out_status) {
        return { message: 'User has already checked out' }
      }
      participant.check_out_status = true
      await event.save()
      return { message: 'Check-out successful' }
    }

    // event.bonus_points = 4; // apply to the old event
  } catch (error) {
    console.log(error)
    return null
  }
}

const getEventService = async (role, userId, find, limitItem, skip) => {
  const events = await Event.find(find).limit(limitItem).skip(skip)

  if (role === 'ADMIN' || role === 'MANAGER') {
    return events
  } else {
    const modifiedEvents = events.map((event) => {
      const userObjectId = new ObjectId(userId)
      const isRegistered = event.participants.some((part) => {
        console.log('-----------------------')
        console.log(userObjectId)
        console.log(part.user_id)
        console.log(part.user_id.equals(userObjectId))
        console.log('-----------------------')

        return part.user_id.equals(userObjectId)
      })

      return {
        ...event.toObject(),
        participants: undefined,
        isRegistered
      }
    })

    return modifiedEvents
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
    return qr.qr_code
  } catch (error) {
    console.error('Error fetching QR code:', error)
    throw error
  }
}

module.exports = {
  checkInCheckOutService,
  getEventService,
  getUserQRCodeForEvent
}
