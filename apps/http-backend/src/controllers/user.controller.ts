import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { prismaClient } from "@repo/db/client";
import { JWT_SECRET } from "@repo/backend-common";

interface RegisterRequestBody {
  email: string;
  password: string;
  username: string;
}

interface LoginRequestBody {
  email: string;
  password: string;
}

const registerUser = async (req: Request<{}, {}, RegisterRequestBody>, res: Response): Promise<void> => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    res.status(400).json({ message: "Please provide email, password, and username" });
    return;
  }

  try {
    const existingUser = await prismaClient.user.findUnique({ where: { email } });

    if (existingUser) {
      res.status(400).json({ message: "User already exists, please log in" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prismaClient.user.create({
      data: { email, password: hashedPassword, username },
    });

    res.status(201).json({ message: "User signed up successfully" });
  } catch (error) {
    console.error("Error during sign up:", error);
    res.status(500).json({ message: "Error during sign up", error: (error as Error).message });
  }
};

const login = async (req: Request<{}, {}, LoginRequestBody>, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Please provide email and password" });
    return;
  }

  try {
    const user = await prismaClient.user.findUnique({ where: { email } });

    if (!user) {
      res.status(404).json({ message: "User not found. Please sign up." });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET as string, { expiresIn: "1d" });

    res.status(200).json({
      message: "User logged in successfully",
      token,
      username: user?.username,
      userid: user.id,
    });
  } catch (error) {
    console.error("Error during sign in:", error);
    res.status(500).json({ message: "Error during sign in", error: (error as Error).message });
  }
};

export { registerUser, login };
