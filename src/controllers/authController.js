const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const prisma = new PrismaClient();

// Passport Setup
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { username } });
      if (!user) return done(null, false, { message: "Invalid username" });

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) return done(null, false, { message: "Invalid password" });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

// Add user to session
passport.serializeUser((user, done) => {
  done(null, user.id);  // Storing the user ID in the session (could be 'email' or 'username')
});

// Deserialize the user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, password: true }, // Select the email field
    });

    if (!user) {
      return done(null, false);
    }

    done(null, user); // Attach the user object (with email) to req.user
  } catch (err) {
    done(err, null);
  }
});

// Controllers
// Register controller
exports.register = async (req, res) => {
  const { username, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: { username, password: hashedPassword },
    });
    res.redirect("/login");
  } catch (err) {
    res.status(400).send("User already exists");
  }
};
// Login controller
exports.login = (req, res) => {
  res.render("login");
};
// Logout controller
exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/login");
  });
};
// Dashboard controller
exports.dashboard = async (req, res) => {
  const folders = await prisma.folder.findMany({
    where: { userId: req.user.id },
    include: { files: true },
  });

  res.render("dashboard", { user: req.user, folders });
};