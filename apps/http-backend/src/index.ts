import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/user.routes.ts";

const app = express();

app.use(
  cors({
    origin: "*",
  })
);

dotenv.config();

const port: number = Number(process.env.PORT) || 3000;

app.use(express.json());

app.use("/api/v1", userRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Server running");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
