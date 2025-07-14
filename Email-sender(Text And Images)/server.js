const express = require('express');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// Email route with attachment
app.post('/send-email', upload.single('attachment'), async (req, res) => {
  const { to, subject, message } = req.body;
  const file = req.file;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: message,
      attachments: file
        ? [{
            filename: file.originalname,
            path: file.path
          }]
        : []
    };

    await transporter.sendMail(mailOptions);

    // Remove file after sending
    if (file) fs.unlinkSync(file.path);

    res.status(200).json({ success: true, message: 'Email sent successfully with attachment' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
