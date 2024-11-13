const authRoute = require('./authRoutes')
const eventRoute = require('./eventRoutes')
const userRoute = require('./userRoutes')
const feedbackRoute = require('./feedbackRoutes')

module.exports = (app) => {
  app.use('/api/v1/events', eventRoute)

  app.use('/api/v1/auth', authRoute)

  app.use('/api/v1/users', userRoute)

  app.use('/api/v1/feedbacks', feedbackRoute)
}
