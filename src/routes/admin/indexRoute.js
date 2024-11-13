const eventRoute = require('./eventRoutes')
const locationRoute = require('./locationRoutes')
const facultyRoute = require('./facultyRoutes')
const courseRoute = require('./courseRoutes')
const authAdmin = require('../../middleware/authAdmin')
const authManager = require('../../middleware/authManager')
const managerRoute = require('./managerRoutes')

module.exports = (app) => {
  app.use('/api/v1/manager/events', authManager, managerRoute)

  app.use(authAdmin)

  app.use('/api/v1/admin/events', eventRoute)

  app.use('/api/v1/admin/locations', locationRoute)

  app.use('/api/v1/admin/facultys', facultyRoute)

  app.use('/api/v1/admin/courses', courseRoute)
}
