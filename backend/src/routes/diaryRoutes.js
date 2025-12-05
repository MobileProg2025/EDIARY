import express from "express";
import Diary from "../models/Diaries.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes are protected with authentication
router.use(authMiddleware);

// Get all active (non-deleted) diary entries for the authenticated user
router.get("/", async (req, res) => {
    try {
        const diaries = await Diary.find({ 
            user: req.user._id,
            deletedAt: null  // Only get non-deleted entries
        }).sort({ createdAt: -1 });

        res.status(200).json(diaries);
    } catch (error) {
        console.log("Error fetching diary entries", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Get all trashed diary entries for the authenticated user
router.get("/trash", async (req, res) => {
    try {
        const trashedDiaries = await Diary.find({ 
            user: req.user._id,
            deletedAt: { $ne: null }  // Only get deleted entries
        }).sort({ deletedAt: -1 });

        res.status(200).json(trashedDiaries);
    } catch (error) {
        console.log("Error fetching trash entries", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Create new diary entry
router.post("/", async (req, res) => {
    try {
        const { mood, title, content, imageUri } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: "Title and content are required" });
        }

        const diary = new Diary({
            mood: mood || "calm",
            title,
            content,
            imageUri: imageUri || null,
            user: req.user._id,
        });

        await diary.save();

        res.status(201).json(diary);
    } catch (error) {
        console.log("Error creating diary entry", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Get single diary entry
router.get("/:id", async (req, res) => {
    try {
        const diary = await Diary.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!diary) {
            return res.status(404).json({ message: "Diary entry not found" });
        }

        res.status(200).json(diary);
    } catch (error) {
        console.log("Error fetching diary entry", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Update diary entry
router.put("/:id", async (req, res) => {
    try {
        const { mood, title, content, imageUri } = req.body;

        const diary = await Diary.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!diary) {
            return res.status(404).json({ message: "Diary entry not found" });
        }

        res.status(200).json(diary);
    } catch (error) {
        console.log("Error updating diary entry", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Soft delete diary entry (move to trash)
router.delete("/:id", async (req, res) => {
    try {
        const diary = await Diary.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id, deletedAt: null },
            { $set: { deletedAt: new Date() } },
            { new: true }
        );

        if (!diary) {
            return res.status(404).json({ message: "Diary entry not found" });
        }

        res.status(200).json({ message: "Diary entry moved to trash", diary });
    } catch (error) {
        console.log("Error deleting diary entry", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Restore diary entry from trash
router.put("/:id/restore", async (req, res) => {
    try {
        const diary = await Diary.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id, deletedAt: { $ne: null } },
            { $set: { deletedAt: null } },
            { new: true }
        );

        if (!diary) {
            return res.status(404).json({ message: "Diary entry not found in trash" });
        }

        res.status(200).json({ message: "Diary entry restored", diary });
    } catch (error) {
        console.log("Error restoring diary entry", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Permanently delete diary entry from trash
router.delete("/:id/permanent", async (req, res) => {
    try {
        const diary = await Diary.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id,
            deletedAt: { $ne: null }  // Only permanently delete if it's in trash
        });

        if (!diary) {
            return res.status(404).json({ message: "Diary entry not found in trash" });
        }

        res.status(200).json({ message: "Diary entry permanently deleted" });
    } catch (error) {
        console.log("Error permanently deleting diary entry", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
