const Location = require('../models/locationModel')

const createLocation = async (req, res) => {
  try {
    const location = new Location(req.body)
    await location.save()
    res.status(201).json(location)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const getLocations = async (req, res) => {
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

    const totalLocation = await Location.countDocuments(find)
    const totalPages = Math.ceil(totalLocation / limitItem)
    const locations = await Location.find(find).limit(limitItem).skip(skip)
    res.status(200).json({
      data: locations,
      currentPage: page,
      totalPages
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find()
    res.status(200).json(locations)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getLocationById = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id)
    if (!location) {
      return res.status(404).json({ message: 'Location not found' })
    }
    res.status(200).json(location)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const updateLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    if (!location) {
      return res.status(404).json({ message: 'Location not found' })
    }
    res.status(200).json(location)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
// Xóa địa điểm theo ID

const deleteLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id)
    if (!location) {
      return res.status(404).json({ message: 'Location not found' })
    }
    res.status(200).json({ message: 'Location deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = {
  createLocation,
  getAllLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
  getLocations
}
