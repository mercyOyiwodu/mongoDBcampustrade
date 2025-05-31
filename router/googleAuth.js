const express  = require("express");
const passport = require("passport");

require("../middlewares/passport");  

const router = express.Router();

// Route to initiate Google OAuth
router.get("/auth/google", passport.authenticate("google", {
    scope: ["profile", "email"] 
}));

// Callback route after Google login
router.get(
  "/auth/google/login",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("https://campus-trade-h7bq.vercel.app/dashboard");  // Redirect after successful login
  }
);

module.exports = router;
