import { Router } from "express";
import { signIn,signUp } from "../controllers/authentication.controller";

const router: Router = Router();

router.post("/signup", signUp);
router.post("/signin", signIn);

export default router;