const mongoose = require('mongoose')
const { eventRegistrationSchema } = require('./eventModel')

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  student_code: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: false
  },
  class: {
    type: String,
    required: true
  },
  full_name: {
    type: String,
    required: true
  },
  events_registered: [eventRegistrationSchema], // Embedded event registration schema
  role: {
    type: String,
    enum: ['USER', 'MANAGER', 'ADMIN'], // Role can be 'user', 'manager', or 'admin'
    default: 'USER' // Default role is 'user'
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User
