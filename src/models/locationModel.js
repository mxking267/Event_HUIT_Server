const mongoose = require('mongoose')

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    capacity: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
)

const Location = mongoose.model('Location', locationSchema)

module.exports = Location
