const { Course } = require('../models/courseModel')
// Tạo sự kiện mới
const createCourse = async (req, res) => {
  try {
    const course = new Course(req.body)
    await course.save()
    res.status(201).json(course)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
// Lấy tất cả sự kiện
const getAllCourses = async (req, res) => {
  try {
    const find = {}

    if (req.query.keyword) {
      const regex = new RegExp(req.query.keyword, 'i')
      find.name = regex
    }

    let limitItem = 8
    let page = 1

    if (req.query.page) {
      page = req.query.page
    }
    const skip = (page - 1) * limitItem

    const totalCourse = await Course.countDocuments(find)
    const totalPages = Math.ceil(totalCourse / limitItem)
    const courses = await Course.find(find).limit(limitItem).skip(skip)
    res.status(200).json({
      data: courses,
      currentPage: page,
      totalPages
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
// Lấy sự kiện theo ID
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
    if (!course) {
      return res.status(404).json({ message: 'Course not found' })
    }
    res.status(200).json(course)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
// Cập nhật sự kiện
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    if (!course) {
      return res.status(404).json({ message: 'Course not found' })
    }
    res.status(200).json(course)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
// Xóa sự kiện
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id)
    if (!course) {
      return res.status(404).json({ message: 'Course not found' })
    }
    res.status(200).json({ message: 'Course deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse
}
