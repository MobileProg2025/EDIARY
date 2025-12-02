import mongoose from "mongoose";

const diarySchema = new mongoose.Schema({
    mood: {
        type: String,
        enum: ["sad", "angry", "calm", "happy", "in love"],
        required: true,
    },

    title: {
        type: String,
        required: true
    },

    body: {
        type: String,
        required: true
    },

    image: {
        type: String,
        default: null
    },

    user: {
        type: String,
        ref: "User",
        required: true
    },
}, 
{ 
    timestamps: true 
});

export default mongoose.model('Diary', diarySchema);