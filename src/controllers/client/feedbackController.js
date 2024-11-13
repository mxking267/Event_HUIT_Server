const  Feedback  = require('../../models/feedbackModel')

// Tạo sự kiện mới
const createFeedback = async (req, res) => {
  try {
    const feedback = new Feedback(req.body)
    await feedback.save()
    res.status(201).json(feedback)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Lấy tất cả sự kiện
const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({})
    res.status(200).json(feedbacks)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Lấy sự kiện theo ID
const getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' })
    }
    res.status(200).json(feedback)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Cập nhật sự kiện
const updateFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' })
    }
    res.status(200).json(feedback)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Xóa sự kiện
const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id)
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' })
    }
    res.status(200).json({ message: 'Feedback deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = {
  createFeedback,
  getAllFeedbacks,
  getFeedbackById,
  updateFeedback,
  deleteFeedback
}
