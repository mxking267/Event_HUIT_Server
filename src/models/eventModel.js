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
        check_in_status: {
          type: Boolean,
          default: false
        },
        check_out_status: {
          type: Boolean,
          default: false
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
  qr_code: {
    type: String,
    required: true
  },
  check_in_status: {
    type: Boolean,
    default: false
  },
  check_out_status: {
    type: Boolean,
    default: false
  }
})

const Event = mongoose.model('Event', eventSchema)

module.exports = { Event, eventRegistrationSchema }
