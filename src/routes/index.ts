import { Router } from "express";
import { createUser, listUsers } from "../controllers/userController";
import { createBoard, listBoards, getBoardById } from "../controllers/boardController";

const router = Router();

// Users
router.post("/users", createUser);
router.get("/users", listUsers);

// Boards
router.post("/boards", createBoard);
router.get("/boards", listBoards);
router.get("/boards/:id", getBoardById);

export default router;