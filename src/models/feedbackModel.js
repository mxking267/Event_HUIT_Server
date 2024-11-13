const mongoose = require('mongoose')

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true
    },
    eventId: {
      type: String,
      required: true
    },
    feedback: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

const Feedback = mongoose.model('Feedback', feedbackSchema, 'feedbacks')

module.exports =  Feedback 
