const mongoose = require('mongoose')
// const Image = require('./imageModel')

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    location_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: true
    },
    type: {
      type: String,
      enum: ['SCIENTIFIC_RESEARCH', 'MOVEMENT', 'SEMINAR'],
      require: true
    },
    date: {
      type: Date,
      required: true
    },
    participants: [
      {
        user_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        status: {
          type: String,
          enum: ['PENDING', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'],
          default: 'PENDING'
        }
      }
    ],
    bonus_points: {
      type: Number,
      required: true
    },
    image: {
      type: String
    },
    faculty_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      require: false
    }
  },
  {
    timestamps: true
  }
)

const eventRegistrationSchema = new mongoose.Schema({
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  registration_date: {
    type: Date,
    default: Date.now
  },
  qr_code_cki: {
    type: String,
    required: true
  },
  qr_code_cko: {
    type: String,
    required: true
  }
})

const Event = mongoose.model('Event', eventSchema)

module.exports = { Event, eventRegistrationSchema }
