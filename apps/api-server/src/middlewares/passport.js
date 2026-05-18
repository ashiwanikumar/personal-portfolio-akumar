// ** LIBS ** //
const bcrypt = require("bcryptjs");
const localStrategy = require("passport-local").Strategy;

// ** MODELS ** //
const User = require("@models/user/user");

module.exports = function (passport) {
  // Local Strategy
  passport.use(
    new localStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email });
          if (!user) {
            return done(null, false, {
              status: 401,
              error: true,
              type: [
                {
                  code: "GLOBAL_ERROR",
                  message: "Incorrect email or password. Please try again",
                },
              ],
            });
          }

          const result = await bcrypt.compare(password, user.password);
          if (result === true) {
            return done(null, user);
          } else {
            return done(null, false, {
              status: 401,
              error: true,
              type: [
                {
                  code: "GLOBAL_ERROR",
                  message: "Incorrect email or password. Please try again",
                },
              ],
            });
          }
        } catch (err) {
          return done(err);
        }
      }
    )
  );
  // Stores a cookie(with user id) inside of the browser
  passport.serializeUser((user, cb) => {
    cb(null, user.id);
  });

  passport.deserializeUser(async (id, cb) => {
    try {
      const user = await User.findOne({ _id: id });
      cb(null, user);
    } catch (err) {
      cb(err, null);
    }
  });
};
