const mongoose = require('mongoose')

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    location_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: true
    },
    thumbnail: String,
    status: {
      type: String,
      enum: ['INITIAL', 'HAPPENING', 'FINISHED', 'STOPPED'],
      default: 'INITIAL'
    },
    date_start: {
      type: Date,
      required: true
    },
    date_end: {
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
        check_in_out_status: {
          type: String,
          enum: ['PENDING', 'CHECKED_IN', 'CHECKED_OUT'], // Role can be 'user', 'manager', or 'admin'
          default: 'PENDING'
        }
      }
    ],
    manager_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    bonus_points: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
)

// Schema for event registration
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
