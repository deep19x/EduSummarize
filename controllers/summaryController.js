const fs = require("fs");
const pdf = require("pdf-parse");
const Upload = require("../models/upload");

// GET Summary Page
module.exports.renderSummaryPage = (req, res) => {
    res.render("summary", { summary: null });
};

// POST Summary Upload
module.exports.uploadSummary = async (req, res) => {
    try {
        const dataBuffer = fs.readFileSync(req.file.path);
        const data = await pdf(dataBuffer);
        const text = data.text;

        const sentences = text.split(". ");
        const summary = sentences.slice(0, 5).join(". ") + ".";

        const newUpload = new Upload({
            user: req.user._id,
            fileName: req.file.originalname,
            text,
            summary,
        });
        await newUpload.save();

        res.render("summary", { summary });
    } catch (err) {
        console.error(err);
        res.render("summary", { summary: "Error generating summary." });
    }
};
