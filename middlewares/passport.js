require('dotenv').config()
const passport       = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt         = require("bcryptjs");
const Seller         = require("../models/seller");


passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  process.env.GOOGLE_CALLBACK_URL,   // swap per‑env
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let seller  = await Seller.findOne({ where: { email } });

        if (!seller) {
          const randomPassword = await bcrypt.hash(profile.id, 10);
          seller = await Seller.create({
            email,
            fullName:   profile.displayName,
            isVerified: profile._json.email_verified || false,  // Google flag
            password:   randomPassword,
          });
        }

        return done(null, seller);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((seller, done) => {
  done(null, seller.id);        // stores only the PK in the session
});

passport.deserializeUser(async (id, done) => {
  try {
    const seller = await Seller.findByPk(id);
    if (!seller) return done(new Error("Seller not found"));
    done(null, seller);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
