const mongoose = require('mongoose')
const courseSchema = new mongoose.Schema(
  {
    course_name: {
      type: String,
      required: true
    },
    course_id: {
      type: Number,
      required: true
    },
    start_year: {
      type: Number,
      required: true
    },
    end_year: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
)
const Course = mongoose.model('Course', courseSchema, 'courses')
module.exports = { Course }
