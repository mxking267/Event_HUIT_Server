const authRoute = require('./authRoutes')
const eventRoute = require('./eventRoutes')

module.exports = (app) => {
  app.use('/api/v1/events', eventRoute)

  app.use('/api/v1/auth', authRoute)
}
