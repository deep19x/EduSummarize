const Flashcard = require("../models/flashcard");
const Upload = require("../models/upload");

module.exports.getFlashcards = async (req, res) => {
    const latestUpload = await Upload.findOne({ user: req.user._id }).sort({ createdAt: -1 });

    if (!latestUpload) {
        return res.render("flashcards", { flashcards: [], message: "Please upload a PDF first!" });
    }

    const sentences = latestUpload.text.split(". ").slice(0, 5);
    const flashcards = sentences.map((s) => ({
        question: `What is the main idea of: "${s.slice(0, 40)}..."?`,
        answer: s,
        upload: latestUpload._id,
    }));

    await Flashcard.insertMany(flashcards);

    res.render("flashcards", { flashcards, message: null });
};
