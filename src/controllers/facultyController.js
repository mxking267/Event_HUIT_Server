const { Faculty } = require('../models/facultyModel')
// Tạo sự kiện mới
const createFaculty = async (req, res) => {
  try {
    const faculty = new Faculty(req.body)
    await faculty.save()
    res.status(201).json(faculty)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
// Lấy tất cả sự kiện
const getAllFaculties = async (req, res) => {
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

    const totalFaculty = await Faculty.countDocuments(find)
    const totalPages = Math.ceil(totalFaculty / limitItem)
    const faculties = await Faculty.find(find).limit(limitItem).skip(skip)
    res.status(200).json({
      data: faculties,
      currentPage: page,
      totalPages
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
// Lấy sự kiện theo ID
const getFacultyById = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id)
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' })
    }
    res.status(200).json(faculty)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
// Cập nhật sự kiện
const updateFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' })
    }
    res.status(200).json(faculty)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
// Xóa sự kiện
const deleteFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndDelete(req.params.id)
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' })
    }
    res.status(200).json({ message: 'Faculty deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
module.exports = {
  createFaculty,
  getAllFaculties,
  getFacultyById,
  updateFaculty,
  deleteFaculty
}
