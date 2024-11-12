const mongoose = require('mongoose')

const facultySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

const Faculty = mongoose.model('Faculty', facultySchema, 'facultys')

module.exports = { Faculty }
