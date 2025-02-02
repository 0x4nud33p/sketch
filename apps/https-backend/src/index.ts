import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authentication.routes";

const app = express();
dotenv.config();

//incoming request methods and url
 app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
})
const PORT = process.env.PORT || 3002;

app.use(express.json());

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
    console.log(`http-backend on ${PORT}`);
});
