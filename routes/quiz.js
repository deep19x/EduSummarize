const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");

// Show quiz questions
router.get("/", quizController.getQuiz);

// Handle quiz submission
router.post("/submit", quizController.submitQuiz);

module.exports = router;
