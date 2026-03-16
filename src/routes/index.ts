import { Router } from "express";
import { createUser, listUsers } from "../controllers/userController";


const router = Router();

// Users
router.post("/users", createUser);
router.get("/users", listUsers); // ← adiciona esta linha

export default router;