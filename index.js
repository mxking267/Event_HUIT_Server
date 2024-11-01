const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')

const routeAdmin = require("./src/routes/admin/indexRoute");
const routeClient = require("./src/routes/client/indexRoute");

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())
const port = process.env.PORT || 8080

// Kết nối MongoDB
mongoose
  .connect(process.env.DB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Could not connect to MongoDB...', err))

routeClient(app);
routeAdmin(app);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
