const express = require("express");
const router = express.Router();
const multer = require("multer");
const summaryController = require("../controllers/summaryController");

const upload = multer({ dest: "public/uploads/" });

// Show summary page
router.get("/", summaryController.renderSummaryPage);

// Upload and summarize PDF
router.post("/", upload.single("pdfFile"), summaryController.uploadSummary);

module.exports = router;
