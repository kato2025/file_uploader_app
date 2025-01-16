const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const prisma = require('./src/prismaClient');
require('./src/passportConfig'); // Passport configuration
// Import routes
const authRoutes = require('./src/routes/authRoutes');
const fileRoutes = require('./src/routes/fileRoutes');
const folderRoutes = require('./src/routes/folderRoutes');
// Multer for file uploads
const multer = require('multer');
// File system module
const fs = require('fs');
const path = require('path');
// Initialize express
const app = express();
// Set up EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', './src/views'); // Adjust the path if your views folder is elsewhere
// Serve static files
app.use(express.static('public'));
// Parse incoming requests with JSON payloads
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve the uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Passport config
require('./src/passportConfig')(passport);

// Flash messages
app.use(flash());

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated() && req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login'); // Redirect to login page if not logged in
}

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/', // Directory where uploaded files will be stored
  limits: { fileSize: 6 * 1024 * 1024 }, // Limit file size to 6MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /\.(jpeg|jpg|png|pdf|docx|xlsx|doc|xls|txt|mp4|ppt|pptx)$/; // Regular expression for extensions
    const mimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'video/mp4',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword',
      'application/vnd.ms-excel',
      'text/plain',
      'application/vnd.ms-powerpoint', // MIME type for .ppt
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // MIME type for .pptx
    ];

    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = mimeTypes.includes(file.mimetype);

    if (extname && mimeType) {
      return cb(null, true); // Accept the file
    } else {
      cb(new Error('Only Word, Excel, PowerPoint, txt, PDF, MP4 and image file types are allowed'));
    }
  },
});

// POST route for file upload
app.post('/upload', isAuthenticated, upload.single('file'), async (req, res) => {
  try {
    const { folderId } = req.body; // Folder ID from the form
    const filePath = req.file.filename; // Uploaded file's filename
    const originalName = req.file.originalname; // Original file name
    const fileSize = req.file.size; // File size
    const userId = req.user.id; // Current user's ID

    // Save the uploaded file's details in the database
    await prisma.file.create({
      data: {
        name: originalName,
        path: filePath,
        size: fileSize,
        folderId: parseInt(folderId), // Ensure folderId is a number
        userId,
      },
    });

    // Redirect to the folder's page to display the uploaded file
    res.redirect(`/folder/${folderId}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error uploading file');
  }
});

// Error handling middleware for file uploads
app.use((err, req, res, next) => {
  if (err) {
    res.status(400).send(err.message);
  } else {
    next();
  }
});

// Routes

// Root route
app.get("/", async (req, res) => {
  try {
    if (req.isAuthenticated() && req.user) {
      // If the user is logged in, redirect to the dashboard
      return res.redirect("/dashboard");
    }

    // Render the home page for unauthenticated users
    res.render("home", {
      user: null,
    });
  } catch (err) {
    console.error("Error rendering home page:", err);
    res.status(500).send("An error occurred.");
  }
});

// Route for creating folder form
app.get('/createFolder', (req, res) => {
  res.render('createFolder'); // Render the createFolder template
});

// Route for uploading file form
app.get('/uploadFile', isAuthenticated, async (req, res) => {
  try {
      const userId = req.user.id;
      const folders = await prisma.folder.findMany({
          where: { userId },
      });
      res.render('uploadFile', { folders });
  } catch (err) {
      console.error('Error fetching folders:', err);
      res.status(500).send('Error fetching folders.');
  }
});

// Route to display files within a folder
app.get('/folder/:id', isAuthenticated, async (req, res) => {
  try {
    const folderId = parseInt(req.params.id); // Get folder ID from URL

    // Ensure folderId is valid
    if (isNaN(folderId)) {
      return res.status(400).send('Invalid folder ID.');
    }

    // Fetch the folder and its files
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
    });

    if (!folder) {
      return res.status(404).send('Folder not found.');
    }

    const files = await prisma.file.findMany({
      where: { folderId },
    });

    // Render the folder view with its files
    res.render('folder', { user: req.user, folder, files });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching files.');
  }
});

// Add a POST route for creating folders
app.post('/create-folder', isAuthenticated, async (req, res) => {
  try {
    const { folderName } = req.body;
    const userId = req.user.id;

    // Ensure folder name is provided
    if (!folderName) {
      return res.status(400).send('Folder name is required.');
    }

    // Create the folder in the database
    await prisma.folder.create({
      data: {
        name: folderName,
        userId,
      },
    });

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating folder.');
  }
});

// Dashboard/Home Route
app.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
      const userId = req.user.id;
      const folders = await prisma.folder.findMany({
          where: { userId },
      });
      res.render('dashboard', { user: req.user, folders });
  } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching folders.');
  }
});

// Login GET route - Render login page with any error flash messages
app.get('/login', (req, res) => {
  res.render('login', { error: req.flash('error') });
});

// Login POST route - Authenticate the user and handle login
app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
      if (err) return next(err);
      if (!user) {
          req.flash('error', 'Invalid username or password');
          return res.redirect('/login');
      }
      req.logIn(user, (err) => {
          if (err) return next(err);
          
          // Store the username in the session
          req.session.username = user.username; // Assuming 'username' is a property in your user object
          
          res.redirect('/');
      });
  })(req, res, next);
});

// Register route
app.get('/register', (req, res) => {
  res.render('register', { error: null });
});

app.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.render('register', { error: 'Name, email, and password are required.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name, // Add name field
        email,
        password: hashedPassword,
      },
    });

    res.redirect('/login');
  } catch (err) {
    console.error(err);

    if (err.code === 'P2002' && err.meta.target.includes('email')) {
      return res.render('register', { error: 'Email already exists. Please use a different email.' });
    }

    res.render('register', { error: 'An error occurred during registration. Please try again.' });
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) console.error(err);
    res.redirect('/');
  });
});

// Import additional routes
app.use('/', authRoutes);
app.use('/files', isAuthenticated, fileRoutes);
app.use('/folders', isAuthenticated, folderRoutes);

// Download route
app.get('/download/:filename', async (req, res) => {
  const filename = req.params.filename;

  try {
    const file = await prisma.file.findFirst({
      where: { path: filename }, // Match based on path
      select: { name: true, path: true },
    });

    if (!file) {
      return res.status(404).send('File not found');
    }

    const filePath = path.join(__dirname, 'uploads', file.path);

    res.download(filePath, file.name, (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error downloading the file');
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
});

// Delete file route
app.post('/delete-file/:fileId', isAuthenticated, async (req, res) => {
  try {
    const fileId = parseInt(req.params.fileId); // Convert to integer

    // Ensure that the fileId is a valid number
    if (isNaN(fileId)) {
      return res.status(400).send('Invalid file ID');
    }

    // Find the file from the database using its ID
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return res.status(404).send('File not found');
    }

    // Save the folder ID before deleting the file
    const folderId = file.folderId;

    // Construct the correct path to the file
    const filePath = path.join(__dirname, 'uploads', file.path); // Assuming `file.path` stores the relative path like '8b87a43e837738743b0737eef115aaaf'

    // Check if the file exists
    if (fs.existsSync(filePath)) {
      // Delete the file from the filesystem
      fs.unlinkSync(filePath);
    }

    // Delete the file record from the database
    await prisma.file.delete({
      where: { id: fileId },
    });

    // Redirect to the folder view instead of the dashboard
    return res.redirect(`/folder/${folderId}`);
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error deleting file');
  }
});


// Edit Folder
app.post('/edit-folder', isAuthenticated, async (req, res) => {
  const { folderId, folderName } = req.body;

  try {
    await prisma.folder.update({
      where: { id: parseInt(folderId) },
      data: { name: folderName },
    });
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error editing folder:', error);
    res.status(500).send('Error editing folder');
  }
});

// Delete Folder
// Check if folder has files
app.get('/check-folder/:folderId', isAuthenticated, async (req, res) => {
  const folderId = parseInt(req.params.folderId);

  try {
    // Check if the folder contains any files
    const files = await prisma.file.findMany({
      where: { folderId },
    });

    // Respond with whether the folder has files or not
    res.json({ hasFiles: files.length > 0 });
  } catch (error) {
    console.error('Error checking folder:', error);
    res.status(500).json({ error: 'An error occurred while checking the folder.' });
  }
});

// Folder deletion route
app.post('/delete-folder', isAuthenticated, async (req, res) => {
  const { folderId } = req.body;

  try {
    // Check if the folder contains any files
    const files = await prisma.file.findMany({
      where: { folderId: parseInt(folderId) },
    });

    if (files.length > 0) {
      req.flash('error', 'Cannot delete folder. It contains files.');
      return res.redirect('/dashboard');
    }

    // Delete the folder
    await prisma.folder.delete({
      where: { id: parseInt(folderId) },
    });

    req.flash('success', 'Folder deleted successfully.');
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).send('Error deleting folder');
  }
});


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
