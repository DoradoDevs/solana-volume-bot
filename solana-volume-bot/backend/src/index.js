const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
require('dotenv').config(); // Load environment variables
app.use(cors({ origin: 'http://localhost:3000' })); // Allow frontend origin
app.use(express.json());
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 3000; // Updated to 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;