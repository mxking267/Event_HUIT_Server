const eventRoute = require('./eventRoutes')
const locationRoute = require('./locationRoutes')

module.exports = (app) => {
  app.use('/api/v1/admin/events', eventRoute)

  app.use('/api/v1/admin/locations', locationRoute)
}
