const Upload = require("../models/upload");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.API_KEYY });

module.exports.getFlashcards = async (req, res) => {
    try {
        const latestUpload = await Upload.findOne({ user: req.user._id }).sort({ createdAt: -1 });

        if (!latestUpload) {
            return res.render("flashcards", { flashcards: [], message: "Please upload a PDF first!" });
        }

        const pdfText = latestUpload.text;

        // --- AI: Generate Flashcards ---
        const systemInstruction = `
        You are a helpful assistant. 
        From the text provided, generate 5 clear flashcards. 
        Each flashcard should have a concise question and answer.
        Format response as JSON array: [{"question": "...", "answer": "..."}, ...]
        `;

        const userQuery = `
        Generate flashcards from the following text:
        ${pdfText}
        `;

        let flashcards = [];
        try {
            const aiResponse = await ai.models.generateContent({
                model: "gemini-2.5-pro",
                contents: userQuery,
                systemInstruction: systemInstruction
            });

            // Parse AI response assuming it returns JSON array
            flashcards = JSON.parse(aiResponse.text);

        } catch (err) {
            console.error("AI flashcards error:", err);
            flashcards = [
                { question: "AI service unavailable", answer: "Please try again later." }
            ];
        }

        res.render("flashcards", { flashcards, message: null });

    } catch (err) {
        console.error("Error generating flashcards:", err);
        res.render("flashcards", { flashcards: [], message: "Error generating flashcards. Try again." });
    }
};
