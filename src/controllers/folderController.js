const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Display the create folder form
exports.createFolder = async (req, res) => {
  const { name } = req.body;

  try {
    await prisma.folder.create({
      data: {
        name,
        userId: req.user.id,
      },
    });
    res.redirect("/dashboard");
  } catch (err) {
    res.status(400).send("Error creating folder");
  }
};
// Delete a folder
exports.deleteFolder = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.folder.delete({
      where: { id: parseInt(id) },
    });
    res.redirect("/dashboard");
  } catch (err) {
    res.status(400).send("Error deleting folder");
  }
};
// View a folder
exports.viewFolder = async (req, res) => {
  const { id } = req.params;

  try {
    const folder = await prisma.folder.findUnique({
      where: { id: parseInt(id) },
      include: { files: true },
    });

    res.render("folder", { folder });
  } catch (err) {
    res.status(400).send("Error viewing folder");
  }
};
