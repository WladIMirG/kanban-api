import { Router } from "express";
import { createUser, listUsers } from "../controllers/userController";
import { createBoard, listBoards, getBoardById } from "../controllers/boardController";
import { createColumn } from "../controllers/columnController"; 

const router = Router();

// Users
router.post("/users", createUser);
router.get("/users", listUsers);

// Boards
router.post("/boards", createBoard);
router.get("/boards", listBoards);
router.get("/boards/:id", getBoardById);

// Columns
router.post("/columns", createColumn);

export default router;