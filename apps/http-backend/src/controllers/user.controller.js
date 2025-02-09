import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prismaClient } from "@repo/db/client";

const registerUser = async (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res
      .status(400)
      .send({ message: "Please provide email, password and username" });
  }

  try {
    const existingUser = await prismaClient.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res
        .status(400)
        .send({ message: "User already exists, please log in" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prismaClient.user.create({
      data: {
        email,
        password: hashedPassword,
        username: username,
      },
    });

    return res.status(201).send({ message: "User signed up successfully" });
  } catch (error) {
    console.error("Error during sign up:", error);
    return res
      .status(500)
      .send({ message: "Error during sign up", error: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .send({ message: "Please provide email and password" });
  }

  try {
    const user = await prismaClient.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res
        .status(404)
        .send({ message: "User not found. Please sign up." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).send({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1D",
    });

    return res.status(200).send({
      message: "User logged in successfully",
      token,
      username: user.username,
      userid: user.id,
    });
  } catch (error) {
    console.error("Error during sign in:", error);
    return res
      .status(500)
      .send({ message: "Error during sign in", error: error.message });
  }
};

export { registerUser, login };
