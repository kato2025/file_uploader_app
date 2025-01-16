const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const moment = require("moment");

// Display the upload file form
exports.uploadFile = async (req, res) => {
  const { folderId } = req.body;

  try {
    const file = req.file;

    await prisma.file.create({
      data: {
        name: file.originalname,
        size: file.size,
        uploadTime: new Date(),
        folderId: parseInt(folderId),
        url: file.path, // For now, store the local path
      },
    });

    res.redirect(`/folders/${folderId}`);
  } catch (err) {
    res.status(400).send("Error uploading file");
  }
};
// View a file
exports.viewFile = async (req, res) => {
  const { id } = req.params;

  try {
    const file = await prisma.file.findUnique({
      where: { id: parseInt(id) },
    });

    res.render("file", { file, moment });
  } catch (err) {
    res.status(400).send("Error viewing file");
  }
};
// Download a file
exports.downloadFile = async (req, res) => {
  const { id } = req.params;

  try {
    const file = await prisma.file.findUnique({
      where: { id: parseInt(id) },
    });

    res.download(file.url);
  } catch (err) {
    res.status(400).send("Error downloading file");
  }
};
