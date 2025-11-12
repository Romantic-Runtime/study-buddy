const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fs = require('fs');
require('dotenv').config();

const { dbConnect } = require('./config/database');
const pdfRoutes = require('./routes/pdfRoutes');
const quizRoutes = require('./routes/quizRoutes');
const authRoutes = require('./routes/authRoute');
const path = require('path');
const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log('Created uploads directory');
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/quiz', quizRoutes);


dbConnect();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});