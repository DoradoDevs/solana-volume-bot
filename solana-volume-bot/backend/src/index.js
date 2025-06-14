const express = require('express');
const cors = require('cors');
const routes = require('./routes/api');
const app = express();

require('dotenv').config(); // Load environment variables
app.use(cors({ origin: 'http://localhost:3001' })); // Allow frontend on port 3001
app.use(express.json());
app.use('/api', routes);

const PORT = process.env.PORT || 3000; // Updated to 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));