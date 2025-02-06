import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prismaClient } from "@repo/db/client";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}

export const signUp = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, username, avatarImage } = req.body;

        if (!email || !password || !username) {
            res.status(400).json({ error: "Invalid request body. Missing required fields." });
            return;
        }

        const existedUser = await prismaClient.user.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
        });

        if (existedUser) {
            res.status(400).json({ error: "User already exists with this email or username." });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prismaClient.user.create({
            data: {
                email,
                password: hashedPassword,
                username,
                avatarImage,
            },
        });

        res.status(201).json({ message : "User created successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error occurred while creating user." });
    }
};

export const signIn = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: "Invalid request body. Email and password are required." });
            return;
        }

        const user = await prismaClient.user.findFirst({
            where: { email },
        });

        if (!user) {
            res.status(404).json({ error: "User not found with this email." });
            return;
        }

        const isPasswordMatched = await bcrypt.compare(password, user.password);
        if (!isPasswordMatched) {
            res.status(401).json({ error: "Incorrect password." });
            return;
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1d" });
        const userWithOutPassword = { ...user, password: undefined };
        res.status(200).json({ userWithOutPassword, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error occurred while signing in." });
    }
};
