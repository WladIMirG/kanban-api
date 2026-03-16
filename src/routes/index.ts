import { Router } from "express";
import { createUser, listUsers } from "../controllers/userController";
import { createBoard, listBoards, getBoardById } from "../controllers/boardController";
import { createColumn, listColumnsByBoard } from "../controllers/columnController"; 
import { createCard } from "../controllers/cardController";

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
router.get("/boards/:boardId/columns", listColumnsByBoard);

// Cards
router.post("/cards", createCard);

export default router;