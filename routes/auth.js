const express = require("express");
const router = express.Router();
const passport = require("passport");
const authController = require("../controllers/authController");

// Signup routes
router.get("/signup", authController.renderSignup);
router.post("/signup", authController.signup);

// Login routes
router.get("/login", authController.renderLogin);
router.post(
    "/login",
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
    }),
    authController.login
);

// Logout
router.get("/logout", authController.logout);

module.exports = router;
