const express = require('express');
const cors = require('cors');
const routes = require('./routes/api');
const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend.vercel.app'],
}));
app.use(express.json());
app.use('/api', routes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));