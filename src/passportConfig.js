const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const prisma = require('./prismaClient'); // Import your Prisma client

module.exports = (passport) => {
    passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
        try {
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            return done(null, false, { message: 'No user with that email' });
          }
      
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return done(null, false, { message: 'Password incorrect' });
          }
      
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
          const user = await prisma.user.findUnique({ where: { id } });
          done(null, user);
        } catch (err) {
          done(err, null);
        }
      });
};
