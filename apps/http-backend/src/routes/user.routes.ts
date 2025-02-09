import { Router } from "express";
import { registerUser, login } from "../controllers/user.controller";
import { verifyJWT } from "@repo/backend-common/config";

const router: Router = Router();

router.post('/auth/signup',verifyJWT, registerUser);
router.post('/auth/login',verifyJWT, login);

export default router;
