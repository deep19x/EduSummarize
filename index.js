require("dotenv").config();

const express = require("express");
const ejsMate = require('ejs-mate')
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

// Import routes
const authRoutes = require("./routes/auth");
const summaryRoutes = require("./routes/summary");
const flashcardRoutes = require("./routes/flashcards");
const quizRoutes = require("./routes/quiz");

const app = express();

// Middleware setup
app.engine('ejs', ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(flash());

app.set("view engine", "ejs");

// Session setup
app.use(
    session({
        secret: process.env.SESSION_SECRET || "defaultsecret",
        resave: false,
        saveUninitialized: false,
    })
);

// Passport setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash middleware (for messages)
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
});

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));


// Routes
app.use("/", authRoutes);
app.use("/summary", summaryRoutes);
app.use("/flashcards", flashcardRoutes);
app.use("/quiz", quizRoutes);

// Dashboard (simple render)
app.get("/dashboard", (req, res) => {
    if (!req.isAuthenticated()) return res.redirect("/login");
    res.render("dashboard");
});

// Root route
app.get("/", (req, res) => {
    res.render("index", { currentUser: req.user, noNavbar: true });;
});


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
