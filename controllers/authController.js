const User = require("../models/user");

// GET Signup
module.exports.renderSignup = (req, res) => {
    res.render("auth/signup", { noNavbar: true });
};

// POST Signup
module.exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email });
        const registeredUser = await User.register(user, password);

        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to EDU-Summarize!");
            res.redirect("/dashboard");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

// GET Login
module.exports.renderLogin = (req, res) => {
    res.render("auth/login", { noNavbar: true });
};

// POST Login
module.exports.login = (req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect("/dashboard");
};

// GET Logout
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "You have logged out successfully.");
        res.redirect("/");
    });
};
