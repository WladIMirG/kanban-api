import { Router } from "express";
import { createUser, listUsers } from "../controllers/userController";
import { createBoard } from "../controllers/boardController";

const router = Router();

// Users
router.post("/users", createUser);
router.get("/users", listUsers);

// Boards
router.post("/boards", createBoard);


export default router;