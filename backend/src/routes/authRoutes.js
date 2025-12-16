import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15d" });
}

router.post("/register", async (req, res) => {
    try {
        const { email, password, username } = req.body;

        if (!email || !password || !username) {
            return res.status(400).json({ message: "All fields are required" })
        }

        if (username.length < 6) {
            return res.status(400).json({ message: "Username should be at least 6 characters long" })
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password should be at least 6 characters long" })
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: "Email address already used" })
        }

        const profileImage = `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${email}`;

        const user = new User({
            email,
            password,
            profileImage,
            username,
        });

        await user.save();

        const token = generateToken(user._id);
        res.status(201).json({
            token,
            user: {
                _id: user._id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                profileImage: user.profileImage
            },
        });

    } catch (error) {
        console.log("Error in register route", error);
        return res.status(500).json({ message: "Internal server error" });

    }
});

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password)
            return res.status(400).json({ message: "All fields are required" });

        const user = await User.findOne({ username });
        if (!user)
            return res.status(400).json({ message: "Invalid credentials" });

        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect)
            return res.status(400).json({ message: "Invalid credentials" });

        const token = generateToken(user._id);
        res.status(201).json({
            token,
            user: {
                _id: user._id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                profileImage: user.profileImage
            },
        });

    } catch (error) {
        console.log("Error in login route", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.put("/update-profile", authMiddleware, async (req, res) => {
    try {
        const { firstName, lastName, email, username } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (firstName !== undefined) user.firstName = firstName;
        if (lastName !== undefined) user.lastName = lastName;
        if (email !== undefined) user.email = email;
        if (username !== undefined) user.username = username;

        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                _id: user._id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                profileImage: user.profileImage
            }
        });

    } catch (error) {
        console.log("Error in update profile route", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;