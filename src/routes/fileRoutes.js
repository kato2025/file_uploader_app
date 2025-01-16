const express = require('express');
const router = express.Router();
const upload = require('../middleware/multerConfig'); // Import multer configuration
const prisma = require('../prismaClient'); // Adjust the path to your Prisma client setup

// File upload route
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { folderId } = req.body;
    const userId = req.user.id; // Assuming `req.user` contains the authenticated user

    if (!folderId) {
      return res.status(400).send('Folder ID is required.');
    }

    // Extract file details
    const { originalname, size, path: filepath } = req.file;

    // Save file metadata to the database
    const file = await prisma.file.create({
      data: {
        name: originalname,
        path: filepath,
        size,
        folderId: parseInt(folderId, 10),
        userId, // Associate the file with the current user
      },
    });

    res.status(200).send({ message: 'File uploaded successfully!', file });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error uploading file.', error: err.message });
  }
});

module.exports = router;
