const express = require("express");
const router = express.Router();
const flashcardController = require("../controllers/flashcardController");

// Show flashcards
router.get("/", flashcardController.getFlashcards);

module.exports = router;
