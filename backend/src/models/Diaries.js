import mongoose from "mongoose";

const diarySchema = new mongoose.Schema({
    mood: {
        type: String,
        enum: ["sad", "angry", "calm", "happy", "love"],
        required: true,
    },

    title: {
        type: String,
        required: true
    },

    content: {
        type: String,
        required: true
    },

    imageUri: {
        type: String,
        default: null
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    deletedAt: {
        type: Date,
        default: null
    },
}, 
{ 
    timestamps: true 
});

export default mongoose.model('Diary', diarySchema);