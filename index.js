const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');


const locationRoutes = require('./src/routes/locationRoutes');
const eventRoutes = require('./src/routes/eventRoutes');
const authRoutes = require('./src/routes/authRoutes');
const auth = require('./src/middleware/auth');

dotenv.config();

const app = express();
app.use(express.json());
const port = process.env.PORT || 8080;

// Kết nối MongoDB
mongoose.connect(process.env.DB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

app.use(auth);


app.use('/api/v1', locationRoutes);
app.use('/api/v1', eventRoutes);
app.use('/api/v1', authRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
