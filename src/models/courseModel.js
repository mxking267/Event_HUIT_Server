const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    courseId: {
      type: Number,
      required: true
    }, 
    startYear: {
      type: Number, 
      required: true
    },
    endYear: {
      type: Number, 
      required: true
    }
  },
  { timestamps: true }
)

const Course = mongoose.model('Course', courseSchema, 'courses')

module.exports = { Course }
