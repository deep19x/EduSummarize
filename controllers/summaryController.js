require('dotenv').config();
const fs = require('fs');
const { PdfReader } = require('pdfreader');
const Upload = require('../models/upload');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

module.exports.renderSummaryPage = (req, res) => {
    res.render('summary', { summary: null, noNavbar: false });
};

module.exports.uploadSummary = async (req, res) => {
    let summary = "Error generating summary.";

    try {
        if (!req.file || !req.file.path) {
            throw new Error("No file uploaded or file path missing.");
        }

        const filePath = req.file.path;
        let pdfText = "";

        await new Promise((resolve, reject) => {
            new PdfReader().parseFileItems(filePath, (err, item) => {
                if (err) return reject(err);
                if (!item) return resolve();
                if (item.text) pdfText += item.text + " ";
            });
        });

        console.log("✅ PDF Text Extracted:", pdfText.substring(0, 500));

        const systemInstruction = `
You are a professional summarization assistant.
Summarize the provided document text into clear and readable study notes.
Use:
- Short paragraphs for main ideas
- Bullet points for clarity
- Simple text (no special characters or Markdown)
- Indentation and line breaks for structure
Write in plain English, suitable for a student to revise from.
`;

        const userQuery = `Please summarize the following document text:\n\nDOCUMENT TEXT:\n---\n${pdfText}\n---`;

        try {
            const geminiResponse = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: userQuery,
                systemInstruction: systemInstruction
            });

            summary = geminiResponse.text.trim();
        } catch (apiErr) {
            console.error("❌ Gemini API Error:", apiErr);
            if (apiErr.status === 503) {
                summary = "The AI service is currently busy. Please try again in a few moments.";
            }
        }

        const newUpload = new Upload({
            user: req.user._id,
            fileName: req.file.originalname,
            text: pdfText,
            summary
        });
        await newUpload.save();

        res.render("summary", { summary, noNavbar: false });

    } catch (err) {
        console.error("❌ Error during PDF parsing or summary generation:", err);
        res.render("summary", { summary, noNavbar: false });
    }
};
