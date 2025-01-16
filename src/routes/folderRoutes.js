const express = require('express');
const prisma = require('../prismaClient');
const router = express.Router();

// Create folder
router.post('/create', async (req, res) => {
  const { name } = req.body;

  await prisma.folder.create({
    data: {
      name,
      userId: req.user.id,
    },
  });

  res.redirect('/dashboard');
});

// View folders
router.get('/', async (req, res) => {
  const folders = await prisma.folder.findMany({
    where: { userId: req.user.id },
    include: { files: true },
  });
  res.render('dashboard', { folders });
});

module.exports = router;
