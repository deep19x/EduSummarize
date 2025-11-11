const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const uploadSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User", // Links each upload to the user who uploaded it
        required: true,
    },
    fileName: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    summary: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Upload", uploadSchema);
