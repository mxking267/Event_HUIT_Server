const { Event } = require('../models/eventModel')
const UserModel = require('../models/userModel')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

const checkInCheckOutService = async (eventId, userId, usedFor) => {
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
    } else {
      return { message: 'Event has been cancelled' }
    }
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
